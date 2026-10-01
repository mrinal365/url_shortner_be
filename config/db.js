const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const connectDB = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully');

    const { initTable: initUserTable } = require('../repository/user.repository');
    await initUserTable();

    const { initTable: initUrlTable } = require('../repository/url.repository');
    await initUrlTable();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
};

module.exports = { pool, connectDB };
