const App = require('./app');
const { Database } = require('./config/database');
const { env } = require('./config/env');
const { logger } = require('./utils/logger');

async function startServer() {
  try {
    await Database.connect();

    const appInstance = new App();
    const app = appInstance.getApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Digikite Server is running on port ${env.PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`📍 API Base URL: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
      logger.info(`💚 Health Check: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await Database.disconnect();
          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', { promise, reason });
      process.exit(1);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = startServer;
