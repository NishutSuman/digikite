const express = require('express');
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

    this.app.use(corsConfig);

    this.app.use(rateLimitConfig);

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    this.app.set('trust proxy', 1);

    // Activity logging middleware
    this.app.use(activityLogger({
      excludePaths: ['/health', '/favicon.ico', '/api-docs'],
      excludeMethods: ['OPTIONS']
    }));

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