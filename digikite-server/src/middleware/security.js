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
      connectSrc: ["'self'", "https://accounts.google.com", "https://gsi.googleapis.com", "https://*.googleapis.com", "https://digikite.vercel.app", "https://digikite.onrender.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      childSrc: ["'self'", "https://accounts.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  // Disable COOP entirely to allow Google OAuth popup communication
  crossOriginOpenerPolicy: false,
});

// Allowed origins for CORS - includes Vercel production domain
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://digikite.vercel.app',
  'https://digikite-git-main-digikite.vercel.app',
  ...env.CORS_ORIGIN,
];

const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow no origin (e.g., mobile apps, curl, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }
    // Allow localhost origins
    if (origin.includes('localhost')) {
      callback(null, true);
      return;
    }
    // Allow Vercel preview deployments
    if (origin.includes('vercel.app')) {
      callback(null, true);
      return;
    }
    // Check against allowed origins list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    logger.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 hours preflight cache
});

// Skip rate limiting in development for easier testing
const isDev = env.NODE_ENV === 'development';

const rateLimitConfig = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: isDev ? 10000 : env.RATE_LIMIT_MAX_REQUESTS, // Effectively disabled in dev
  skip: () => isDev, // Skip rate limiting entirely in development
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
  max: isDev ? 10000 : 50, // Effectively disabled in dev
  skip: () => isDev, // Skip rate limiting entirely in development
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