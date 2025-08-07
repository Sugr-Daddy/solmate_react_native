const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const os = require('os');
require('dotenv').config({ path: '../.env' });

const app = express();
const prisma = new PrismaClient();

// Function to get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name in interfaces) {
    const iface = interfaces[name];
    
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        // Skip Docker and virtual interfaces
        if (!name.toLowerCase().includes('docker') && 
            !name.toLowerCase().includes('vbox') &&
            !name.toLowerCase().includes('vmware')) {
          return alias.address;
        }
      }
    }
  }
  
  return 'localhost';
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:8082', // Added for React Native on port 8082
    'http://localhost:3000',
    `http://${getLocalIP()}:8081`, // Dynamic local IP
    `http://${getLocalIP()}:8082`, // Dynamic local IP for port 8082
    /^http:\/\/192\.168\.\d+\.\d+:808[12]$/, // Allow any 192.168.x.x:8081 or 8082
    /^http:\/\/10\.0\.\d+\.\d+:808[12]$/, // Allow any 10.0.x.x:8081 or 8082
    /^http:\/\/172\.16\.\d+\.\d+:808[12]$/, // Allow any 172.16.x.x:8081 or 8082
    /^http:\/\/172\.25\.\d+\.\d+:808[12]$/, // Allow any 172.25.x.x:8081 or 8082
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Solmate API is running' });
});

// Authentication routes
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return res.json({ user: null, needsOnboarding: true });
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    res.json({ 
      user: {
        ...user,
        gender: user.gender.toLowerCase()
      }, 
      needsOnboarding: false 
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/onboard', async (req, res) => {
  try {
    const { walletAddress, name, age, gender, bio, photos, preferredTipAmount } = req.body;
    
    if (!walletAddress || !name || !age || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await prisma.user.create({
      data: {
        walletAddress,
        name,
        age,
        gender: gender.toUpperCase(),
        bio: bio || '',
        photos: photos || [],
        preferredTipAmount: preferredTipAmount || 3,
        isOnline: true,
        lastActive: new Date(),
      },
    });

    res.json({ 
      user: {
        ...user,
        gender: user.gender.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Onboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User routes
app.get('/api/users/discovery/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const currentUser = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get users already matched or swiped
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { senderId: currentUser.id },
          { receiverId: currentUser.id },
        ],
      },
      select: { senderId: true, receiverId: true },
    });

    const excludedUserIds = new Set([currentUser.id]);
    existingMatches.forEach(match => {
      excludedUserIds.add(match.senderId);
      excludedUserIds.add(match.receiverId);
    });

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedUserIds) },
        gender: currentUser.gender === 'MALE' ? 'FEMALE' : 'MALE',
        isOnline: true,
      },
      orderBy: {
        lastActive: 'desc',
      },
      take: limit,
    });

    res.json(users.map(user => ({
      ...user,
      gender: user.gender.toLowerCase()
    })));
  } catch (error) {
    console.error('Discovery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Match routes
app.post('/api/matches', async (req, res) => {
  try {
    const { senderWallet, receiverWallet, tipAmount, transactionHash } = req.body;

    if (!senderWallet || !receiverWallet || !tipAmount || !transactionHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sender = await prisma.user.findUnique({
      where: { walletAddress: senderWallet },
    });
    const receiver = await prisma.user.findUnique({
      where: { walletAddress: receiverWallet },
    });

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if a match already exists between these users
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          {
            senderId: sender.id,
            receiverId: receiver.id,
          },
          {
            senderId: receiver.id,
            receiverId: sender.id,
          },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (existingMatch) {
      return res.status(409).json({ 
        error: 'Match already exists between these users',
        existingMatch 
      });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const match = await prisma.match.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        tipAmount,
        transactionHash,
        expiresAt,
        status: 'PENDING',
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        walletAddress: senderWallet,
        type: 'TIP_SENT',
        amount: tipAmount * 100,
        transactionHash,
        matchId: match.id,
        status: 'CONFIRMED',
      },
    });

    res.json(match);
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/matches/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matches = await prisma.match.findMany({
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

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/matches/:matchId/accept', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'ACCEPTED',
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

    res.json(match);
  } catch (error) {
    console.error('Accept match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/matches/:matchId/reject', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    res.json(match);
  } catch (error) {
    console.error('Reject match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seed route
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data
    await prisma.transaction.deleteMany();
    await prisma.match.deleteMany();
    await prisma.user.deleteMany();

    // Create users with more varied and realistic data
    const users = await prisma.user.createMany({
      data: [
        // Sugar Daddies
        {
          walletAddress: 'demo-sugar-daddy-1',
          name: 'Alex',
          age: 35,
          gender: 'MALE',
          bio: 'Tech entrepreneur & crypto enthusiast 🚀 Building the future, one investment at a time',
          photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 5,
          isOnline: true,
          lastActive: new Date(),
          matchCount: 0,
          ghostedCount: 0,
          ghostedByCount: 0,
        },
        {
          walletAddress: 'demo-sugar-daddy-2',
          name: 'Marcus',
          age: 42,
          gender: 'MALE',
          bio: 'Investment banker & wine collector 🍷 Love fine dining and meaningful conversations',
          photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 8,
          isOnline: true,
          lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
          matchCount: 0,
          ghostedCount: 1,
          ghostedByCount: 0,
        },
        {
          walletAddress: 'demo-sugar-daddy-3',
          name: 'David',
          age: 38,
          gender: 'MALE',
          bio: 'Real estate mogul 🏢 Passionate about art, travel, and spoiling the right person',
          photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 10,
          isOnline: false,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          matchCount: 0,
          ghostedCount: 0,
          ghostedByCount: 2,
        },
        
        // Sugar Babies
        {
          walletAddress: 'demo-sugar-baby-1',
          name: 'Sophia',
          age: 26,
          gender: 'FEMALE',
          bio: 'Adventure seeker & coffee enthusiast ☕️ Med student by day, explorer by heart',
          photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 3,
          isOnline: true,
          lastActive: new Date(),
          matchCount: 0,
          ghostedCount: 0,
          ghostedByCount: 0,
        },
        {
          walletAddress: 'demo-sugar-baby-2',
          name: 'Emma',
          age: 24,
          gender: 'FEMALE',
          bio: 'Yoga instructor & wellness advocate 🧘‍♀️ Seeking someone who values mindfulness and growth',
          photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 5,
          isOnline: true,
          lastActive: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
          matchCount: 0,
          ghostedCount: 0,
          ghostedByCount: 1,
        },
        {
          walletAddress: 'demo-sugar-baby-3',
          name: 'Isabella',
          age: 27,
          gender: 'FEMALE',
          bio: 'Creative soul & art lover 🎨 Graphic designer looking for inspiration and genuine connection',
          photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 2,
          isOnline: true,
          lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
          matchCount: 0,
          ghostedCount: 2,
          ghostedByCount: 0,
        },
        {
          walletAddress: 'demo-sugar-baby-4',
          name: 'Olivia',
          age: 25,
          gender: 'FEMALE',
          bio: 'Tech enthusiast & fitness lover 💪 Software engineer who loves hiking and trying new cuisines',
          photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 4,
          isOnline: true,
          lastActive: new Date(),
          matchCount: 0,
          ghostedCount: 0,
          ghostedByCount: 0,
        },
        {
          walletAddress: 'demo-sugar-baby-5',
          name: 'Ava',
          age: 23,
          gender: 'FEMALE',
          bio: 'Fashion designer & world traveler ✈️ Currently building my own brand while studying in Paris',
          photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 3,
          isOnline: false,
          lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          matchCount: 0,
          ghostedCount: 1,
          ghostedByCount: 0,
        },
        {
          walletAddress: 'demo-sugar-baby-6',
          name: 'Mia',
          age: 28,
          gender: 'FEMALE',
          bio: 'Chef & foodie extraordinaire 👨‍🍳 Opening my own restaurant soon, love sharing culinary adventures',
          photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 4,
          isOnline: true,
          lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          matchCount: 0,
          ghostedCount: 0,
          ghostedByCount: 1,
        },
        {
          walletAddress: 'demo-sugar-baby-7',
          name: 'Charlotte',
          age: 22,
          gender: 'FEMALE',
          bio: 'Psychology student & aspiring therapist 💝 Fascinated by human connections and deep conversations',
          photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 2,
          isOnline: true,
          lastActive: new Date(),
          matchCount: 0,
          ghostedCount: 0,
          ghostedByCount: 0,
        },
        {
          walletAddress: 'demo-sugar-baby-8',
          name: 'Luna',
          age: 26,
          gender: 'FEMALE',
          bio: 'Professional dancer & choreographer 💃 Bringing art to life through movement and expression',
          photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=face&auto=format'],
          preferredTipAmount: 6,
          isOnline: false,
          lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          matchCount: 0,
          ghostedCount: 0,
          ghostedByCount: 0,
        },
      ],
    });

    // Get created users to create comprehensive matches and transactions
    const createdUsers = await prisma.user.findMany();
    const alex = createdUsers.find(u => u.walletAddress === 'demo-sugar-daddy-1');
    const marcus = createdUsers.find(u => u.walletAddress === 'demo-sugar-daddy-2');
    const david = createdUsers.find(u => u.walletAddress === 'demo-sugar-daddy-3');
    
    const sophia = createdUsers.find(u => u.walletAddress === 'demo-sugar-baby-1');
    const emma = createdUsers.find(u => u.walletAddress === 'demo-sugar-baby-2');
    const isabella = createdUsers.find(u => u.walletAddress === 'demo-sugar-baby-3');
    const olivia = createdUsers.find(u => u.walletAddress === 'demo-sugar-baby-4');
    const ava = createdUsers.find(u => u.walletAddress === 'demo-sugar-baby-5');
    const mia = createdUsers.find(u => u.walletAddress === 'demo-sugar-baby-6');
    const charlotte = createdUsers.find(u => u.walletAddress === 'demo-sugar-baby-7');
    const luna = createdUsers.find(u => u.walletAddress === 'demo-sugar-baby-8');

    const matches = [];
    const transactions = [];

    if (alex && marcus && david && sophia && emma && isabella && olivia && ava && mia && charlotte && luna) {
      // Alex's matches
      // 1. Accepted match with Sophia (most recent success)
      const match1 = await prisma.match.create({
        data: {
          senderId: alex.id,
          receiverId: sophia.id,
          tipAmount: 5,
          transactionHash: '0x1a2b3c4d5e6f7890abcdef1234567890alexsophia',
          status: 'ACCEPTED',
          acceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
        }
      });
      matches.push(match1);

      // Transaction for Alex -> Sophia
      transactions.push({
        walletAddress: alex.walletAddress,
        type: 'TIP_SENT',
        amount: 500, // $5 in cents
        transactionHash: '0x1a2b3c4d5e6f7890abcdef1234567890alexsophia',
        matchId: match1.id,
        status: 'CONFIRMED',
      });

      // 2. Pending match with Emma
      const match2 = await prisma.match.create({
        data: {
          senderId: alex.id,
          receiverId: emma.id,
          tipAmount: 3,
          transactionHash: '0x2b3c4d5e6f7890abcdef1234567890alexemma',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        }
      });
      matches.push(match2);

      transactions.push({
        walletAddress: alex.walletAddress,
        type: 'TIP_SENT',
        amount: 300,
        transactionHash: '0x2b3c4d5e6f7890abcdef1234567890alexemma',
        matchId: match2.id,
        status: 'CONFIRMED',
      });

      // 3. Rejected match with Isabella
      const match3 = await prisma.match.create({
        data: {
          senderId: alex.id,
          receiverId: isabella.id,
          tipAmount: 2,
          transactionHash: '0x3c4d5e6f7890abcdef1234567890alexisabella',
          status: 'REJECTED',
          rejectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          expiresAt: new Date(Date.now() + 15 * 60 * 60 * 1000), // 15 hours from now
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        }
      });
      matches.push(match3);

      transactions.push({
        walletAddress: alex.walletAddress,
        type: 'TIP_SENT',
        amount: 200,
        transactionHash: '0x3c4d5e6f7890abcdef1234567890alexisabella',
        matchId: match3.id,
        status: 'CONFIRMED',
      });

      // Marcus's matches
      // 1. Accepted match with Olivia
      const match4 = await prisma.match.create({
        data: {
          senderId: marcus.id,
          receiverId: olivia.id,
          tipAmount: 8,
          transactionHash: '0x4d5e6f7890abcdef1234567890marcusolivia',
          status: 'ACCEPTED',
          acceptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000), // 21 hours from now
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        }
      });
      matches.push(match4);

      transactions.push({
        walletAddress: marcus.walletAddress,
        type: 'TIP_SENT',
        amount: 800,
        transactionHash: '0x4d5e6f7890abcdef1234567890marcusolivia',
        matchId: match4.id,
        status: 'CONFIRMED',
      });

      // 2. Ghosted match with Ava
      const match5 = await prisma.match.create({
        data: {
          senderId: marcus.id,
          receiverId: ava.id,
          tipAmount: 6,
          transactionHash: '0x5e6f7890abcdef1234567890marcusava',
          status: 'GHOSTED',
          expiresAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // Expired 12 hours ago
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        }
      });
      matches.push(match5);

      transactions.push({
        walletAddress: marcus.walletAddress,
        type: 'TIP_SENT',
        amount: 600,
        transactionHash: '0x5e6f7890abcdef1234567890marcusava',
        matchId: match5.id,
        status: 'CONFIRMED',
      });

      // David's matches
      // 1. Pending match with Charlotte
      const match6 = await prisma.match.create({
        data: {
          senderId: david.id,
          receiverId: charlotte.id,
          tipAmount: 10,
          transactionHash: '0x6f7890abcdef1234567890davidcharlotte',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        }
      });
      matches.push(match6);

      transactions.push({
        walletAddress: david.walletAddress,
        type: 'TIP_SENT',
        amount: 1000,
        transactionHash: '0x6f7890abcdef1234567890davidcharlotte',
        matchId: match6.id,
        status: 'CONFIRMED',
      });

      // 2. Rejected by Luna
      const match7 = await prisma.match.create({
        data: {
          senderId: david.id,
          receiverId: luna.id,
          tipAmount: 12,
          transactionHash: '0x7890abcdef1234567890davidluna',
          status: 'REJECTED',
          rejectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours from now
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        }
      });
      matches.push(match7);

      transactions.push({
        walletAddress: david.walletAddress,
        type: 'TIP_SENT',
        amount: 1200,
        transactionHash: '0x7890abcdef1234567890davidluna',
        matchId: match7.id,
        status: 'CONFIRMED',
      });

      // 3. Ghosted by Mia
      const match8 = await prisma.match.create({
        data: {
          senderId: david.id,
          receiverId: mia.id,
          tipAmount: 8,
          transactionHash: '0x890abcdef1234567890davidmia',
          status: 'GHOSTED',
          expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Expired 2 hours ago
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        }
      });
      matches.push(match8);

      transactions.push({
        walletAddress: david.walletAddress,
        type: 'TIP_SENT',
        amount: 800,
        transactionHash: '0x890abcdef1234567890davidmia',
        matchId: match8.id,
        status: 'CONFIRMED',
      });

      // Create all transactions
      for (const txData of transactions) {
        await prisma.transaction.create({ data: txData });
      }

      // Update match counts (only count accepted matches)
      await prisma.user.update({
        where: { id: alex.id },
        data: { matchCount: 1 } // Sophia
      });
      
      await prisma.user.update({
        where: { id: sophia.id },
        data: { matchCount: 1 } // Alex
      });

      await prisma.user.update({
        where: { id: marcus.id },
        data: { matchCount: 1, ghostedCount: 1 } // Olivia accepted, Ava ghosted him
      });

      await prisma.user.update({
        where: { id: olivia.id },
        data: { matchCount: 1 } // Marcus
      });

      await prisma.user.update({
        where: { id: david.id },
        data: { ghostedByCount: 2 } // Luna rejected, Mia ghosted
      });

      await prisma.user.update({
        where: { id: isabella.id },
        data: { ghostedCount: 2 } // She has rejected others
      });

      await prisma.user.update({
        where: { id: emma.id },
        data: { ghostedByCount: 1 } // Someone ghosted her
      });

      await prisma.user.update({
        where: { id: ava.id },
        data: { ghostedCount: 1 } // She ghosted Marcus
      });

      await prisma.user.update({
        where: { id: mia.id },
        data: { ghostedByCount: 1 } // She ghosted David
      });
    }

    res.json({ 
      message: 'Database seeded successfully with comprehensive demo data', 
      userCount: users.count,
      matchCount: matches.length,
      transactionCount: transactions.length
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
const LOCAL_IP = getLocalIP();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Solmate API server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://${LOCAL_IP}:${PORT}`);
  console.log(`📱 For Expo Go, use: ${LOCAL_IP}`);
  console.log(`⚙️  Update LOCAL_IP in src/constants/network.ts to: ${LOCAL_IP}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
