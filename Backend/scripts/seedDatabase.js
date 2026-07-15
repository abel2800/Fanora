require('dotenv').config();
const { sequelize, User, Wallet, SubscriptionPlan } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting PostgreSQL database seeding...');
    
    // Connect to database and sync models
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    console.log('📝 Database tables created');
    
    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@fanora.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+251911234567',
      dateOfBirth: '1990-01-01',
      role: 'admin',
      isVerified: true,
      isEmailVerified: true,
      isCreator: true
    });
    
    console.log('👤 Created admin user');
    
    // Create wallet for admin
    const adminWallet = await Wallet.create({
      userId: adminUser.id,
      balance: 10000, // 10,000 ETB starting balance
      currency: 'ETB'
    });
    
    console.log('💳 Created admin wallet');
    
    // Create sample creator
    const creatorUser = await User.create({
      username: 'sample_creator',
      email: 'creator@fanora.com',
      password: 'Creator123!',
      firstName: 'Sample',
      lastName: 'Creator',
      phoneNumber: '+251922345678',
      dateOfBirth: '1995-05-15',
      role: 'creator',
      isVerified: true,
      isEmailVerified: true,
      isCreator: true,
      bio: 'Fanora content creator sharing lifestyle and culture content'
    });
    
    console.log('🎨 Created sample creator');
    
    // Create wallet for creator
    const creatorWallet = await Wallet.create({
      userId: creatorUser.id,
      balance: 5000, // 5,000 ETB starting balance
      currency: 'ETB'
    });
    
    console.log('💳 Created creator wallet');
    
    // Create sample subscription plans for the creator
    const basicPlan = await SubscriptionPlan.create({
      creatorId: creatorUser.id,
      name: 'Basic Subscription',
      description: 'Access to basic content and weekly updates',
      price: 50, // 50 ETB per month
      duration: 'monthly',
      durationInDays: 30, // Explicitly set duration
      features: [
        { name: 'Weekly content updates', isIncluded: true },
        { name: 'Basic photo gallery', isIncluded: true },
        { name: 'Community access', isIncluded: true }
      ],
      accessToAllContent: true,
      accessToLiveStreams: false,
      directMessaging: false
    });
    
    const premiumPlan = await SubscriptionPlan.create({
      creatorId: creatorUser.id,
      name: 'Premium Subscription',
      description: 'Full access to all content including exclusive videos',
      price: 150, // 150 ETB per month
      duration: 'monthly',
      durationInDays: 30, // Explicitly set duration
      features: [
        { name: 'Daily content updates', isIncluded: true },
        { name: 'Exclusive video content', isIncluded: true },
        { name: 'Live stream access', isIncluded: true },
        { name: 'Direct messaging', isIncluded: true },
        { name: 'Custom requests', isIncluded: true }
      ],
      accessToAllContent: true,
      accessToLiveStreams: true,
      accessToExclusiveContent: true,
      directMessaging: true,
      customRequests: true
    });
    
    console.log('💳 Created sample subscription plans');
    
    // Create sample regular user
    const regularUser = await User.create({
      username: 'sample_user',
      email: 'user@fanora.com',
      password: 'User123!',
      firstName: 'Sample',
      lastName: 'User',
      phoneNumber: '+251933456789',
      dateOfBirth: '1998-08-20',
      role: 'user',
      isVerified: true,
      isEmailVerified: true,
      isCreator: false
    });
    
    console.log('👥 Created sample regular user');
    
    // Create wallet for regular user
    const userWallet = await Wallet.create({
      userId: regularUser.id,
      balance: 1000, // 1,000 ETB starting balance
      currency: 'ETB'
    });
    
    console.log('💳 Created user wallet');
    
    console.log('✅ PostgreSQL database seeding completed successfully!');
    console.log('\n📋 Sample Accounts Created:');
    console.log('Admin: admin@fanora.com / Admin123!');
    console.log('Creator: creator@fanora.com / Creator123!');
    console.log('User: user@fanora.com / User123!');
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database seeding error:', error);
    await sequelize.close();
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;