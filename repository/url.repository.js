const { pool } = require('../config/db');

async function initTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS urls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      original_url TEXT NOT NULL,
      short_code VARCHAR(7) UNIQUE NOT NULL,
      clicks INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function createUrl(userId, originalUrl, shortCode) {
  const { rows } = await pool.query(`
    INSERT INTO urls (user_id, original_url, short_code)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, original_url, short_code, clicks, created_at
  `, [userId, originalUrl, shortCode]);
  return rows[0];
}

async function findByShortCode(shortCode) {
  const { rows } = await pool.query(`
    SELECT id, user_id, original_url, short_code, clicks, created_at
    FROM urls
    WHERE short_code = $1
  `, [shortCode]);
  return rows[0];
}

async function findByUserId(userId) {
  const { rows } = await pool.query(`
    SELECT id, user_id, original_url, short_code, clicks, created_at
    FROM urls
    WHERE user_id = $1
    ORDER BY created_at DESC
  `, [userId]);
  return rows;
}

async function incrementClicks(shortCode) {
  const { rows } = await pool.query(`
    UPDATE urls
    SET clicks = clicks + 1
    WHERE short_code = $1
    RETURNING id, user_id, original_url, short_code, clicks, created_at
  `, [shortCode]);
  return rows[0];
}

module.exports = {
  initTable,
  createUrl,
  findByShortCode,
  findByUserId,
  incrementClicks,
};
