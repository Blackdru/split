const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../../database/migrations');

async function runMigrations() {
  console.log('[Migration] Starting database migration runner...');
  const client = await pool.connect();

  try {
    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Read already applied migrations
    const res = await client.query('SELECT version FROM schema_migrations ORDER BY version ASC');
    const appliedVersions = new Set(res.rows.map((r) => r.version));

    // 3. Read migration files
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.warn(`[Migration] Migrations directory not found at ${MIGRATIONS_DIR}`);
      return;
    }

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedVersions.has(file)) {
        console.log(`[Migration] Skipped (already applied): ${file}`);
        continue;
      }

      console.log(`[Migration] Applying migration: ${file}...`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`[Migration] Successfully applied: ${file}`);
      } catch (migrationErr) {
        await client.query('ROLLBACK');
        console.error(`[Migration Error] Failed applying ${file}:`, migrationErr);
        throw migrationErr;
      }
    }

    console.log('[Migration] All migrations completed successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Migration Fatal]', err);
      process.exit(1);
    });
}

module.exports = { runMigrations };
