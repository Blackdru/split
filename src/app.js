const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');
const { errorHandler } = require('./middleware/error-handler');

const app = express();

// Static assets (branding, icons, preview assets)
app.use('/static', express.static(path.join(__dirname, '../public')));
app.use('/favicon.ico', (req, res) => res.sendFile(path.join(__dirname, '../public/favicon.png')));

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);
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

// Public Web Invite Landing Pages
const GroupsController = require('./modules/groups/groups.controller');
app.get('/join/:token', GroupsController.renderInviteLanding);
app.get('/join', (req, res) => {
  const pkg = process.env.PLAY_STORE_PACKAGE || 'com.budrock.splitboss';
  res.redirect(`https://play.google.com/store/apps/details?id=${pkg}`);
});

// Mount API routes
app.use('/api/v1', apiRoutes);

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: `Route not found: ${req.method} ${req.url}` } });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
