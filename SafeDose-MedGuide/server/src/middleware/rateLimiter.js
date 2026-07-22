const rateLimit = require('express-rate-limit');

const generalLimiter = process.env.NODE_ENV === 'development'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      message: { success: false, message: 'Too many requests. Please try again after 15 minutes.' },
      standardHeaders: true,
      legacyHeaders: false,
    });

const authLimiter = process.env.NODE_ENV === 'development'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
      standardHeaders: true,
      legacyHeaders: false,
    });

const aiChatLimiter = process.env.NODE_ENV === 'development'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      message: { success: false, message: 'Too many AI chat requests. Please try again after 15 minutes.' },
      standardHeaders: true,
      legacyHeaders: false,
    });

module.exports = { generalLimiter, authLimiter, aiChatLimiter };
