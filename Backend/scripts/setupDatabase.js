require('dotenv').config();
const { Client } = require('pg');
const { sequelize } = require('../config/database');

const ensureDatabaseExists = async () => {
  const dbName = process.env.DB_NAME || 'fanora';
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  await client.connect();
  try {
    const { rows } = await client.query(
      'SELECT datname FROM pg_database WHERE datistemplate = false'
    );
    const exists = rows.some((row) => row.datname.toLowerCase() === dbName.toLowerCase());
    if (!exists) {
      console.log(`Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created!\n`);
    }
  } finally {
    await client.end();
  }
};

const setupDatabase = async () => {
  try {
    console.log('🚀 Fanora Database Setup');
    console.log('==========================\n');
    
    // Step 0: Ensure database exists
    console.log('Step 0: Ensuring database exists...');
    await ensureDatabaseExists();
    
    // Step 1: Test connection
    console.log('Step 1: Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL successfully!\n');
    
    // Step 2: Check database exists
    console.log('Step 2: Checking database...');
    const [dbResult] = await sequelize.query('SELECT current_database()');
    console.log(`✅ Using database: ${dbResult[0].current_database}\n`);
    
    // Step 3: Create/update tables
    console.log('Step 3: Setting up database tables...');
    
    // Import models to ensure associations are loaded
    require('../models');
    
    // Sync database (create/update tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables created/updated successfully!\n');
    
    // Step 4: List created tables
    console.log('Step 4: Verifying tables...');
    const [tables] = await sequelize.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Database Tables:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.table_name} (${table.column_count} columns)`);
    });
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run "npm run seed" to create sample data');
    console.log('   2. Run "npm run dev" to start the server');
    console.log('   3. Open pgAdmin 4 to view your database visually');
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    
    if (error.name === 'SequelizeConnectionRefusedError') {
      console.error('\n💡 PostgreSQL Connection Failed:');
      console.error('   1. Make sure PostgreSQL is running');
      console.error('   2. Check if the service is started:');
      console.error('      Windows: Check Services → PostgreSQL');
      console.error('      Mac: brew services start postgresql');
      console.error('      Linux: sudo systemctl start postgresql');
    } else if (error.name === 'SequelizeAccessDeniedError') {
      console.error('\n💡 Access Denied:');
      console.error('   1. Check your database credentials in .env file');
      console.error('   2. Make sure the database user exists');
      console.error('   3. Verify the password is correct');
    } else if (error.name === 'SequelizeConnectionError') {
      console.error('\n💡 Connection Error:');
      console.error('   1. Check your database configuration in .env:');
      console.error('      DB_HOST=localhost');
      console.error('      DB_PORT=5432');
      console.error('      DB_NAME=fanora');
      console.error('      DB_USER=postgres');
      console.error('      DB_PASSWORD=your_password');
      console.error('   2. Make sure the database "fanora" exists');
    }
    
    console.error('\n🔧 Quick Fix Commands:');
    console.error('   Create database: createdb -U postgres fanora');
    console.error('   Test connection: psql -U postgres -d fanora');
    
    await sequelize.close();
    process.exit(1);
  }
};

setupDatabase();
