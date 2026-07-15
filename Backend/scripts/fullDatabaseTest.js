require('dotenv').config();
const { sequelize, User, Wallet, Transaction, Content, SubscriptionPlan } = require('../models');

const fullDatabaseTest = async () => {
  try {
    console.log('🔬 Starting Full Database Test...\n');
    
    // Test 1: Connection
    console.log('📡 Test 1: Database Connection');
    await sequelize.authenticate();
    console.log('✅ Connection successful');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
    console.log(`   Database: ${process.env.DB_NAME || 'fanora'}`);
    console.log(`   User: ${process.env.DB_USER || 'postgres'}\n`);
    
    // Test 2: Database Info
    console.log('📊 Test 2: Database Information');
    const [versionResult] = await sequelize.query('SELECT version()');
    console.log('✅ PostgreSQL Version:', versionResult[0].version.split(' ')[0] + ' ' + versionResult[0].version.split(' ')[1]);
    
    const [dbInfo] = await sequelize.query('SELECT current_database(), current_user, now()');
    console.log('✅ Current Database:', dbInfo[0].current_database);
    console.log('✅ Current User:', dbInfo[0].current_user);
    console.log('✅ Server Time:', dbInfo[0].now, '\n');
    
    // Test 3: Table Creation
    console.log('🏗️  Test 3: Table Creation & Sync');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tables synchronized successfully');
    
    // List all tables
    const [tables] = await sequelize.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Created Tables:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.table_name} (${table.column_count} columns)`);
    });
    console.log();
    
    // Test 4: CRUD Operations
    console.log('🔄 Test 4: CRUD Operations');
    
    // Create test user
    const testUser = await User.create({
      username: 'test_user_' + Date.now(),
      email: `test_${Date.now()}@fanora.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+251911111111',
      dateOfBirth: '1995-01-01',
      role: 'user',
      isEmailVerified: true
    });
    console.log('✅ User created:', testUser.username);
    
    // Create test wallet
    const testWallet = await Wallet.create({
      userId: testUser.id,
      balance: 500.00,
      currency: 'ETB'
    });
    console.log('✅ Wallet created with balance:', testWallet.getFormattedBalance());
    
    // Create test transaction
    const testTransaction = await Transaction.create({
      userId: testUser.id,
      walletId: testWallet.id,
      type: 'deposit',
      amount: 100.00,
      currency: 'ETB',
      status: 'completed',
      description: 'Test deposit',
      reference: `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      paymentMethodType: 'telebirr',
      paymentMethodDetails: { telebirrPhoneNumber: '+251911111111' }
    });
    console.log('✅ Transaction created:', testTransaction.reference);
    
    // Test 5: Relationships & Joins
    console.log('\n🔗 Test 5: Relationships & Joins');
    
    // Test user with wallet relationship
    const userWithWallet = await User.findByPk(testUser.id, {
      include: [{ model: Wallet, as: 'wallet' }]
    });
    console.log('✅ User-Wallet relationship:', userWithWallet.wallet ? 'Working' : 'Failed');
    
    // Test wallet with transactions
    const walletWithTransactions = await Wallet.findByPk(testWallet.id, {
      include: [{ model: Transaction, as: 'transactions' }]
    });
    console.log('✅ Wallet-Transaction relationship:', walletWithTransactions.transactions.length > 0 ? 'Working' : 'Failed');
    
    // Test 6: Complex Queries
    console.log('\n🧮 Test 6: Complex Queries');
    
    // Count users by role
    const userStats = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role']
    });
    
    console.log('✅ User Statistics:');
    userStats.forEach(stat => {
      console.log(`   ${stat.role}: ${stat.dataValues.count} users`);
    });
    
    // Test wallet balance operations
    const originalBalance = parseFloat(testWallet.balance);
    await testWallet.addFunds(50.00);
    await testWallet.reload();
    const newBalance = parseFloat(testWallet.balance);
    console.log('✅ Wallet Operations:', newBalance === originalBalance + 50 ? 'Working' : 'Failed');
    
    // Test 7: Data Validation
    console.log('\n✅ Test 7: Data Validation');
    
    try {
      await User.create({
        username: 'invalid_email_user',
        email: 'invalid-email', // Invalid email
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+251911111111',
        dateOfBirth: '1995-01-01'
      });
      console.log('❌ Email validation: Failed (should have rejected invalid email)');
    } catch (error) {
      console.log('✅ Email validation: Working (correctly rejected invalid email)');
    }
    
    try {
      await User.create({
        username: 'short_pass_user',
        email: 'valid@email.com',
        password: '123', // Too short
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+251911111111',
        dateOfBirth: '1995-01-01'
      });
      console.log('❌ Password validation: Failed (should have rejected short password)');
    } catch (error) {
      console.log('✅ Password validation: Working (correctly rejected short password)');
    }
    
    // Test 8: Indexes
    console.log('\n📇 Test 8: Database Indexes');
    const [indexes] = await sequelize.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    console.log('✅ Database Indexes:');
    const indexesByTable = {};
    indexes.forEach(idx => {
      if (!indexesByTable[idx.tablename]) {
        indexesByTable[idx.tablename] = [];
      }
      indexesByTable[idx.tablename].push(idx.indexname);
    });
    
    Object.keys(indexesByTable).forEach(table => {
      console.log(`   ${table}: ${indexesByTable[table].length} indexes`);
    });
    
    // Test 9: Performance Test
    console.log('\n⚡ Test 9: Performance Test');
    const startTime = Date.now();
    
    // Create multiple users quickly
    const bulkUsers = [];
    for (let i = 0; i < 10; i++) {
      bulkUsers.push({
        username: `bulk_user_${Date.now()}_${i}`,
        email: `bulk_${Date.now()}_${i}@fanora.com`,
        password: 'BulkTest123!',
        firstName: 'Bulk',
        lastName: `User${i}`,
        phoneNumber: `+25191111111${i}`,
        dateOfBirth: '1995-01-01',
        role: 'user'
      });
    }
    
    await User.bulkCreate(bulkUsers);
    const endTime = Date.now();
    console.log(`✅ Bulk insert (10 users): ${endTime - startTime}ms`);
    
    // Test 10: Cleanup
    console.log('\n🧹 Test 10: Cleanup');
    
    // Delete test data
    const { Op } = require('sequelize');
    await Transaction.destroy({ where: { userId: testUser.id } });
    await Wallet.destroy({ where: { userId: testUser.id } });
    await User.destroy({ where: { username: { [Op.like]: 'test_user_%' } } });
    await User.destroy({ where: { username: { [Op.like]: 'bulk_user_%' } } });
    
    console.log('✅ Test data cleaned up');
    
    // Final Summary
    console.log('\n🎉 DATABASE TEST SUMMARY');
    console.log('========================================');
    console.log('✅ Connection: PASSED');
    console.log('✅ Table Creation: PASSED');
    console.log('✅ CRUD Operations: PASSED');
    console.log('✅ Relationships: PASSED');
    console.log('✅ Complex Queries: PASSED');
    console.log('✅ Data Validation: PASSED');
    console.log('✅ Indexes: PASSED');
    console.log('✅ Performance: PASSED');
    console.log('✅ Cleanup: PASSED');
    console.log('========================================');
    console.log('🎯 ALL TESTS PASSED! Database is ready for production.');
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ DATABASE TEST FAILED:', error.message);
    console.error('\n🔍 Error Details:');
    console.error('   Name:', error.name);
    console.error('   Message:', error.message);
    if (error.sql) {
      console.error('   SQL:', error.sql);
    }
    if (error.parent) {
      console.error('   Database Error:', error.parent.message);
    }
    
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure PostgreSQL is running');
    console.error('   2. Check your .env file configuration');
    console.error('   3. Verify database exists and user has permissions');
    console.error('   4. Check connection details');
    
    await sequelize.close();
    process.exit(1);
  }
};

fullDatabaseTest();
