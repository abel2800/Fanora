require('dotenv').config();
const { sequelize } = require('../config/database');

const testConnection = async () => {
  try {
    console.log('🔄 Testing PostgreSQL connection...');
    console.log('📍 Connection details:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 5432}`);
    console.log(`   Database: ${process.env.DB_NAME || 'fanora'}`);
    console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
    
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully!');
    
    // Get database info
    const [results] = await sequelize.query('SELECT version()');
    console.log('🔢 PostgreSQL Version:', results[0].version);
    
    // List existing tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📁 Existing Tables:');
    if (tables.length === 0) {
      console.log('   No tables found (run "npm run seed" to create sample data)');
    } else {
      tables.forEach(table => console.log(`   - ${table.table_name}`));
    }
    
    // Test basic query
    const [dbInfo] = await sequelize.query('SELECT current_database(), current_user');
    console.log('📊 Database Info:');
    console.log(`   Current Database: ${dbInfo[0].current_database}`);
    console.log(`   Current User: ${dbInfo[0].current_user}`);
    
    await sequelize.close();
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    console.error('\n💡 Troubleshooting steps:');
    console.error('   1. Make sure PostgreSQL is running');
    console.error('   2. Check your .env file configuration:');
    console.error('      - DB_HOST (default: localhost)');
    console.error('      - DB_PORT (default: 5432)');
    console.error('      - DB_NAME (default: fanora)');
    console.error('      - DB_USER (default: postgres)');
    console.error('      - DB_PASSWORD (required)');
    console.error('   3. Verify database exists and user has permissions');
    console.error('   4. Check firewall settings');
    
    await sequelize.close();
    process.exit(1);
  }
};

testConnection();