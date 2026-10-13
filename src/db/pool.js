const { Pool } = require('pg');
const config = require('../config/env');

const isSupabase = config.databaseUrl.includes('supabase.co') || config.databaseUrl.includes('supabase.com') || config.databaseUrl.includes('pooler.supabase.com');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: isSupabase || config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
  console.error('[DB Pool Error]', err);
});

/**
 * Execute raw parameterized SQL query
 */
const query = (text, params) => pool.query(text, params);

/**
 * Acquire a client from the pool
 */
const getClient = () => pool.connect();

/**
 * Helper to run operations inside a safe database transaction
 */
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  getClient,
  withTransaction
};
