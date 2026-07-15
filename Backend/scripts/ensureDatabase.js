require('dotenv').config();
const { Client } = require('pg');

const ensureDatabase = async () => {
  const dbName = process.env.DB_NAME || 'fanora';
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();
    const { rows } = await client.query(
      'SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname'
    );
    console.log('Existing databases:', rows.map((row) => row.datname).join(', '));

    const exists = rows.some((row) => row.datname.toLowerCase() === dbName.toLowerCase());
    if (!exists) {
      console.log(`Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } finally {
    await client.end();
  }
};

ensureDatabase().catch((error) => {
  console.error('Failed to ensure database:', error.message);
  process.exit(1);
});
