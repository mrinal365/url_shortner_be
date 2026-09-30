const { pool } = require('../config/db');

async function initTable() {
  // Ensure pgcrypto extension is available for gen_random_uuid()
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // Check if users table exists and what data type id has
  const columnCheck = await pool.query(`
    SELECT data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id';
  `);

  if (columnCheck.rows.length === 0) {
    // Fresh table creation with UUID primary key
    await pool.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else if (columnCheck.rows[0].data_type !== 'uuid') {
    // Migrate existing table with integer/serial id to UUID
    await pool.query(`
      ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
      ALTER TABLE users ALTER COLUMN id TYPE UUID USING gen_random_uuid();
      ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
    `);
  }
}

async function findByEmail(email) {
  const { rows } = await pool.query(`
    SELECT * 
    FROM users 
    WHERE email = $1
  `, [email]);
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query(`
    SELECT id, name, email, created_at 
    FROM users 
    WHERE id = $1
  `, [id]);
  return rows[0];
}

async function createUser(name, email, password) {
  const { rows } = await pool.query(`
    INSERT INTO users (name, email, password) 
    VALUES ($1, $2, $3) 
    RETURNING id, name, email, created_at
  `, [name, email, password]);
  return rows[0];
}

module.exports = {
  initTable,
  findByEmail,
  findById,
  createUser,
};
