const app = require('./app');
const config = require('./config/env');
const { pool } = require('./db/pool');

const server = app.listen(config.port, () => {
  console.log(`🚀 India-First Expense Sharing Server running on port ${config.port} [${config.nodeEnv}]`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`[Server] Received ${signal}, closing server gracefully...`);
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    try {
      await pool.end();
      console.log('[Server] Database pool closed.');
    } catch (err) {
      console.error('[Server] Error closing db pool:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
