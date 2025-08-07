import { databaseService } from '../src/services/database';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    await databaseService.seedDatabase();
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
