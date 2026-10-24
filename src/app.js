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
        scriptSrcAttr: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

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

// Contact / Deletion Rate Limiter
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // max 20 deletion/contact requests per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests, please try again later.' } }
});

// Public Contact & Account / Data Deletion Request Page
const { renderContactPage } = require('./modules/legal/contact-page.template');
const DeletionRequestService = require('./modules/legal/deletion-request.service');

const handleContactPage = (req, res) => {
  const baseUrl = process.env.APP_BASE_URL || 'https://split.udhaar.store';
  const html = renderContactPage({
    baseUrl,
    iconUrl: `${baseUrl}/static/ic_launcher-web.png`
  });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
app.get('/contact', handleContactPage);
app.get('/delete-account', handleContactPage);
app.get('/data-deletion', handleContactPage);

const handleDeletionSubmission = async (req, res, next) => {
  try {
    const { name, email, phone, requestType, deleteAccount, deleteData, reason } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const record = await DeletionRequestService.createRequest({
      name,
      email,
      phone,
      requestType,
      deleteAccount,
      deleteData,
      reason,
      ipAddress,
      userAgent
    });

    const isJson = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));
    if (isJson) {
      return res.status(201).json({
        success: true,
        message: 'Your deletion request has been recorded successfully.',
        data: record
      });
    }

    const baseUrl = process.env.APP_BASE_URL || 'https://split.udhaar.store';
    const html = renderContactPage({
      baseUrl,
      iconUrl: `${baseUrl}/static/ic_launcher-web.png`,
      successData: record
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (err) {
    const isJson = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));
    if (isJson) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: { message: err.message || 'Failed to submit deletion request.' }
      });
    }
    const baseUrl = process.env.APP_BASE_URL || 'https://split.udhaar.store';
    const html = renderContactPage({
      baseUrl,
      iconUrl: `${baseUrl}/static/ic_launcher-web.png`,
      errorMessage: err.message || 'Failed to submit deletion request.'
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(err.statusCode || 400).send(html);
  }
};
app.post('/contact', contactLimiter, handleDeletionSubmission);
app.post('/api/v1/contact/deletion-request', contactLimiter, handleDeletionSubmission);

// Public Legal & Policy Pages (Required for Google Play Store compliance)
const { renderPrivacyPage } = require('./modules/legal/privacy-page.template');
const handlePrivacyPolicy = (req, res) => {
  const baseUrl = process.env.APP_BASE_URL || 'https://split.udhaar.store';
  const html = renderPrivacyPage({
    baseUrl,
    iconUrl: `${baseUrl}/static/ic_launcher-web.png`
  });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
app.get('/privacy', handlePrivacyPolicy);
app.get('/privacy-policy', handlePrivacyPolicy);

// Public Web Landing Page (https://split.udhaar.store)
const { renderHomePage } = require('./modules/landing/home-page.template');
app.get('/', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html')) {
    return res.status(200).json({ success: true, message: 'Split Boss API is active' });
  }

  const baseUrl = process.env.APP_BASE_URL || 'https://split.udhaar.store';
  const pkg = process.env.PLAY_STORE_PACKAGE || 'com.budrock.splitboss';
  const playStoreUrl = `https://play.google.com/store/apps/details?id=${pkg}`;
  const html = renderHomePage({
    baseUrl,
    playStoreUrl,
    iconUrl: `${baseUrl}/static/ic_launcher-web.png`
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
});

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
