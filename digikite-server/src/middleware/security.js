const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');

const helmetConfig = helmet({
  contentSecurityPolicy: env.NODE_ENV === 'development' ? false : {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com", "https://gsi.googleapis.com", "https://*.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "https://accounts.google.com", "https://gsi.googleapis.com", "https://*.googleusercontent.com"],
      frameSrc: ["'self'", "https://accounts.google.com", "https://gsi.googleapis.com", "https://*.google.com"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://gsi.googleapis.com", "https://*.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      childSrc: ["'self'", "https://accounts.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: env.NODE_ENV === 'development' ? false : { policy: "same-origin-allow-popups" },
});

const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow no origin (e.g., mobile apps, curl) or localhost origins
    if (!origin || origin.includes('localhost') || env.CORS_ORIGIN.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: env.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

const rateLimitConfig = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      url: req.url,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    });
  },
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth routes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req.method, req.originalUrl, res.statusCode, duration);
  });

  next();
};

module.exports = {
  helmetConfig,
  corsConfig,
  rateLimitConfig,
  authRateLimit,
  requestLogger,
};