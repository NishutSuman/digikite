const { validationResult } = require('express-validator');
const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/response');

/**
 * Middleware to validate requests using express-validator
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation failed', {
      endpoint: req.originalUrl,
      method: req.method,
      errors: errorMessages,
      userId: req.user?.id
    });

    return errorResponse(res, 'Validation failed', 400, {
      errors: errorMessages
    });
  }

  next();
};

/**
 * Middleware to sanitize request data
 */
const sanitizeRequest = (req, res, next) => {
  try {
    // Remove empty strings and convert to null
    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;

      const sanitized = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];

        if (typeof value === 'string') {
          const trimmed = value.trim();
          sanitized[key] = trimmed === '' ? null : trimmed;
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      });

      return sanitized;
    };

    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    next();
  } catch (error) {
    logger.error('Request sanitization error', {
      error: error.message,
      endpoint: req.originalUrl,
      userId: req.user?.id
    });
    next();
  }
};

module.exports = {
  validateRequest,
  sanitizeRequest
};