const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { AppError } = require('./error-handler');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // { id, email, displayName }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired. Please refresh your session.', 401));
    }
    return next(new AppError('Invalid access token.', 401));
  }
};

module.exports = { authenticate };
