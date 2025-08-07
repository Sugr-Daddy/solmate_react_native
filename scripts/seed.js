const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
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
        gender: 'FEMALE',
        name: 'Sophia',
        age: 26,
        bio: 'Adventure seeker & coffee enthusiast ☕️ Love hiking, photography, and spontaneous road trips. Looking for someone to explore life\'s beautiful moments with! 🌟',
        photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 3,
        isOnline: true,
      },
      {
        walletAddress: 'demo-wallet-2',
        gender: 'FEMALE',
        name: 'Emma',
        age: 24,
        bio: 'Yoga instructor & wellness advocate 🧘‍♀️ Passionate about healthy living, meditation, and creating meaningful connections. Let\'s grow together! ✨',
        photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 5,
        isOnline: true,
      },
      {
        walletAddress: 'demo-wallet-3',
        gender: 'FEMALE',
        name: 'Isabella',
        age: 27,
        bio: 'Creative soul & art lover 🎨 Dog mom to the cutest golden retriever. Love museums, indie music, and deep conversations over wine 🍷',
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 2,
        isOnline: true,
      },
      {
        walletAddress: 'demo-wallet-4',
        gender: 'FEMALE',
        name: 'Olivia',
        age: 25,
        bio: 'Tech enthusiast & fitness lover 💪 Startup founder by day, gym rat by night. Looking for someone who shares my passion for innovation and health! 🚀',
        photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 4,
        isOnline: true,
      },
      {
        walletAddress: 'demo-wallet-5',
        gender: 'FEMALE',
        name: 'Ava',
        age: 23,
        bio: 'Foodie & travel blogger 🌍 Always on the hunt for the best restaurants and hidden gems. Let\'s create memories over amazing food! 🍕✈️',
        photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format'],
        preferredTipAmount: 3,
        isOnline: true,
      },
      {
        walletAddress: 'demo-wallet-6',
        gender: 'FEMALE',
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
      gender: 'MALE',
      name: 'Alexander',
      age: 35,
      bio: 'Successful entrepreneur looking for meaningful connections. Love fine dining, travel, and spoiling the right person. Let\'s create beautiful memories together! 💎',
      photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face&auto=format'],
      preferredTipAmount: 5,
      isOnline: true,
    };

    // Create all users
    await prisma.user.createMany({
      data: [...sugarBabies, sugarDaddy],
    });

    console.log(`✅ Successfully seeded ${sugarBabies.length + 1} users to the database!`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
