const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const {
  helmetConfig,
  corsConfig,
  rateLimitConfig,
  requestLogger
} = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/error');
const { activityLogger } = require('./middleware/activityLogger');
const routes = require('./routes');
const { logger } = require('./utils/logger');

class App {
  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddleware() {
    this.app.use(requestLogger);

    this.app.use(helmetConfig);

    // CORS middleware - handles preflight and regular requests
    // Using cors() directly with permissive settings for all routes
    this.app.use(cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control'],
      exposedHeaders: ['Content-Length', 'Content-Type'],
      maxAge: 86400,
    }));

    this.app.use(rateLimitConfig);

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    this.app.set('trust proxy', 1);

    // Activity logging middleware - DISABLED in development (causes excessive DB writes)
    // Only enable in production for business intelligence
    if (env.NODE_ENV === 'production') {
      this.app.use(activityLogger({
        excludePaths: ['/health', '/favicon.ico', '/api-docs'],
        excludeMethods: ['OPTIONS', 'GET'], // Only log mutations, not reads
        logOnlyAuthenticated: true // Only log authenticated user actions
      }));
      logger.info('Activity logging enabled (production mode)');
    } else {
      logger.info('Activity logging disabled (development mode)');
    }

    logger.info('Middleware initialized successfully');
  }

  initializeRoutes() {
    this.app.use(`/api/${env.API_VERSION}`, routes);

    logger.info('Routes initialized successfully');
  }

  initializeErrorHandling() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);

    logger.info('Error handling initialized successfully');
  }

  getApp() {
    return this.app;
  }
}

module.exports = App;