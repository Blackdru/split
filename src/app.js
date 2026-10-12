const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');
const { errorHandler } = require('./middleware/error-handler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // max 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests, please try again later.' } }
});
app.use('/api/', globalLimiter);

// Specific Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // max 30 auth attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many authentication attempts, please try again later.' } }
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Mount API routes
app.use('/api/v1', apiRoutes);

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: `Route not found: ${req.method} ${req.url}` } });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
