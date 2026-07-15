const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'fanora',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true, // Use snake_case for column names
      freezeTableName: true, // Don't pluralize table names
    },
  }
);

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to PostgreSQL...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully!');
    console.log(`🏠 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
    console.log(`📊 Database: ${process.env.DB_NAME || 'fanora'}`);
    
    // Import models to ensure associations are loaded
    require('../models');
    
    // Sync database (create tables)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true }); // Update tables to match models
      console.log('📝 Database tables synchronized');
    }
    
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    console.error('💡 Make sure PostgreSQL is running and credentials are correct');
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };