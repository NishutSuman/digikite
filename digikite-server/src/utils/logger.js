const { env } = require('../config/env');

const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor() {
    this.logLevel = env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
  }

  formatMessage(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }

  shouldLog(level) {
    return level <= this.logLevel;
  }

  error(message, meta) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, meta));
    }
  }

  warn(message, meta) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, meta));
    }
  }

  info(message, meta) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, meta));
    }
  }

  debug(message, meta) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, meta));
    }
  }

  http(method, url, statusCode, responseTime) {
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;
    if (statusCode >= 400) {
      this.error(message);
    } else {
      this.info(message);
    }
  }
}

const logger = new Logger();

module.exports = { logger, LogLevel };