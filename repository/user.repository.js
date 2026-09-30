const { pool } = require('../config/db');

async function initTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
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
