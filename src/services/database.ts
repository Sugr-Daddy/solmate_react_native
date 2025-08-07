import { prisma } from '../lib/prisma';
import { User, Match, Transaction, Gender, MatchStatus, TransactionType } from '../generated/prisma';
import bcrypt from 'bcryptjs';

export interface CreateUserInput {
  walletAddress: string;
  gender: 'MALE' | 'FEMALE';
  name: string;
  age: number;
  bio: string;
  photos: string[];
  preferredTipAmount?: number;
}

export interface SignInInput {
  walletAddress: string;
  password?: string; // Optional for wallet-only auth
}

class DatabaseService {
  // User Management
  async createUser(data: CreateUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: {
        walletAddress: data.walletAddress,
        gender: data.gender as Gender,
        name: data.name,
        age: data.age,
        bio: data.bio,
        photos: data.photos,
        preferredTipAmount: data.preferredTipAmount || 3,
      },
    });
    return user;
  }

  async getUserByWallet(walletAddress: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        sentMatches: true,
        receivedMatches: true,
        transactions: true,
      },
    });
  }

  async updateUserActivity(walletAddress: string): Promise<void> {
    await prisma.user.update({
      where: { walletAddress },
      data: {
        lastActive: new Date(),
        isOnline: true,
      },
    });
  }

  // Discovery - Get potential matches
  async getDiscoveryUsers(currentUserWallet: string, limit: number = 10): Promise<User[]> {
    const currentUser = await this.getUserByWallet(currentUserWallet);
    if (!currentUser) return [];

    // Get users we haven't matched with yet
    const existingMatchUserIds = await prisma.match.findMany({
      where: {
        OR: [
          { sender: { walletAddress: currentUserWallet } },
          { receiver: { walletAddress: currentUserWallet } },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const excludedUserIds = new Set([
      currentUser.id,
      ...existingMatchUserIds.flatMap(match => [match.senderId, match.receiverId])
    ]);

    return await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedUserIds) },
        gender: currentUser.gender === 'MALE' ? 'FEMALE' : 'MALE', // Opposite gender
        isOnline: true,
      },
      orderBy: {
        lastActive: 'desc',
      },
      take: limit,
    });
  }

  // Match Management
  async createMatch(
    senderWallet: string,
    receiverWallet: string,
    tipAmount: number,
    transactionHash: string
  ): Promise<Match> {
    const sender = await this.getUserByWallet(senderWallet);
    const receiver = await this.getUserByWallet(receiverWallet);

    if (!sender || !receiver) {
      throw new Error('User not found');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    const match = await prisma.match.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        tipAmount,
        transactionHash,
        expiresAt,
        status: 'PENDING' as MatchStatus,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Create transaction record
    await this.createTransaction({
      walletAddress: senderWallet,
      type: 'TIP_SENT' as TransactionType,
      amount: tipAmount * 100, // Convert to cents
      transactionHash,
      matchId: match.id,
    });

    return match;
  }

  async getUserMatches(walletAddress: string): Promise<Match[]> {
    const user = await this.getUserByWallet(walletAddress);
    if (!user) return [];

    return await prisma.match.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      include: {
        sender: true,
        receiver: true,
        transactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async acceptMatch(matchId: string): Promise<Match> {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'ACCEPTED' as MatchStatus,
        acceptedAt: new Date(),
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Update match counts
    await Promise.all([
      prisma.user.update({
        where: { id: match.senderId },
        data: { matchCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: match.receiverId },
        data: { matchCount: { increment: 1 } },
      }),
    ]);

    return match;
  }

  async rejectMatch(matchId: string): Promise<Match> {
    return await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'REJECTED' as MatchStatus,
        rejectedAt: new Date(),
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
  }

  async ghostMatch(matchId: string): Promise<Match> {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'GHOSTED' as MatchStatus,
        ghostedAt: new Date(),
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Update ghosted counts
    await Promise.all([
      prisma.user.update({
        where: { id: match.senderId },
        data: { ghostedByCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: match.receiverId },
        data: { ghostedCount: { increment: 1 } },
      }),
    ]);

    return match;
  }

  // Transaction Management
  async createTransaction(data: {
    walletAddress: string;
    type: TransactionType;
    amount: number;
    transactionHash: string;
    matchId?: string;
  }): Promise<Transaction> {
    return await prisma.transaction.create({
      data,
    });
  }

  async getUserTransactions(walletAddress: string): Promise<Transaction[]> {
    return await prisma.transaction.findMany({
      where: { walletAddress },
      include: {
        match: {
          include: {
            sender: true,
            receiver: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  // Sign in functionality
  async signInUser(walletAddress: string): Promise<User | null> {
    let user = await this.getUserByWallet(walletAddress);
    
    // If user doesn't exist, we'll need them to complete onboarding
    if (!user) {
      return null;
    }

    // Update activity
    await this.updateUserActivity(walletAddress);
    
    return user;
  }

  // Check if user exists and needs onboarding
  async needsOnboarding(walletAddress: string): Promise<boolean> {
    const user = await this.getUserByWallet(walletAddress);
    return !user;
  }

  // Seed data for testing
  async seedDatabase(): Promise<void> {
    // Check if users already exist
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('Database already seeded');
      return;
    }

    // Create sample sugar babies (females)
    const sugarBabies = [
      {
        walletAddress: 'demo-wallet-1',
        gender: 'FEMALE' as Gender,
        name: 'Sophia',
        age: 26,
        bio: 'Adventure seeker & coffee enthusiast ☕️ Love hiking, photography, and spontaneous road trips. Looking for someone to explore life\'s beautiful moments with! 🌟',
        photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 3,
        isOnline: true,
      },
      {
        walletAddress: 'demo-wallet-2',
        gender: 'FEMALE' as Gender,
        name: 'Emma',
        age: 24,
        bio: 'Yoga instructor & wellness advocate 🧘‍♀️ Passionate about healthy living, meditation, and creating meaningful connections. Let\'s grow together! ✨',
        photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 5,
        isOnline: true,
      },
      {
        walletAddress: 'demo-wallet-3',
        gender: 'FEMALE' as Gender,
        name: 'Isabella',
        age: 27,
        bio: 'Creative soul & art lover 🎨 Dog mom to the cutest golden retriever. Love museums, indie music, and deep conversations over wine 🍷',
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 2,
        isOnline: true,
      },
      {
        walletAddress: 'demo-wallet-4',
        gender: 'FEMALE' as Gender,
        name: 'Olivia',
        age: 25,
        bio: 'Tech enthusiast & fitness lover 💪 Startup founder by day, gym rat by night. Looking for someone who shares my passion for innovation and health! 🚀',
        photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 4,
        isOnline: true,
      },
      {
        walletAddress: 'demo-wallet-5',
        gender: 'FEMALE' as Gender,
        name: 'Ava',
        age: 23,
        bio: 'Foodie & travel blogger 🌍 Always on the hunt for the best restaurants and hidden gems. Let\'s create memories over amazing food! 🍕✈️',
        photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 3,
        isOnline: true,
      },
      {
        walletAddress: 'demo-wallet-6',
        gender: 'FEMALE' as Gender,
        name: 'Mia',
        age: 28,
        bio: 'Bookworm & nature lover 📚🌿 Hiking trails, cozy cafes, and deep conversations are my happy places. Looking for someone to share adventures with! 🏔️',
        photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 2,
        isOnline: true,
      },
    ];

    // Create demo sugar daddy
    const sugarDaddy = {
      walletAddress: 'demo-sugar-daddy-1',
      gender: 'MALE' as Gender,
      name: 'Alexander',
      age: 35,
      bio: 'Successful entrepreneur looking for meaningful connections. Love fine dining, travel, and spoiling the right person. Let\'s create beautiful memories together! 💎',
      photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face&auto=format'],
      preferredTipAmount: 5,
      isOnline: true,
    };

    try {
      // Create all users
      await prisma.user.createMany({
        data: [...sugarBabies, sugarDaddy],
      });

      console.log(`✅ Successfully seeded ${sugarBabies.length + 1} users to the database!`);
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
