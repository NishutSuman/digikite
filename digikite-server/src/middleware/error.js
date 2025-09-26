const { ResponseUtil } = require('../utils/response');
const { logger } = require('../utils/logger');
const { env } = require('../config/env');

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (error, req, res, next) => {
  let { statusCode = 500, message } = error;

  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  if (env.NODE_ENV === 'production' && !error.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  ResponseUtil.error(
    res,
    message,
    statusCode,
    env.NODE_ENV === 'development' ? error.stack : undefined
  );
};

const notFoundHandler = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn(message, { method: req.method, ip: req.ip });
  ResponseUtil.notFound(res, message);
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};