const activityService = require('../services/activityService');
const { logger } = require('../utils/logger');

/**
 * Middleware to automatically log API activities
 * Tracks all API requests for business intelligence
 */
const activityLogger = (options = {}) => {
  const {
    excludePaths = ['/health', '/favicon.ico'],
    excludeMethods = ['OPTIONS'],
    logAllRequests = true,
    logOnlyAuthenticated = false
  } = options;

  return async (req, res, next) => {
    const startTime = Date.now();

    // Skip excluded paths and methods
    if (excludePaths.some(path => req.path.includes(path)) ||
        excludeMethods.includes(req.method)) {
      return next();
    }

    // Skip unauthenticated requests if configured
    if (logOnlyAuthenticated && !req.user) {
      return next();
    }

    // Store original res.json and res.send to capture response
    const originalJson = res.json;
    const originalSend = res.send;
    let responseBody = null;

    res.json = function(data) {
      responseBody = data;
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      responseBody = data;
      return originalSend.call(this, data);
    };

    // Handle response completion
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const success = res.statusCode < 400;
        const userId = req.user?.id || req.user?.userId || null;

        // Log the API call activity
        await activityService.logApiCall(
          userId,
          req,
          req.originalUrl || req.url,
          req.method,
          success,
          duration,
          success ? null : `HTTP ${res.statusCode}`
        );

        // Log specific business activities based on endpoints
        await logSpecificActivities(req, res, userId, success, responseBody);

      } catch (error) {
        logger.error('Activity logging middleware error', error);
        // Don't break the main flow
      }
    });

    next();
  };
};

/**
 * Log specific business activities based on endpoints
 */
async function logSpecificActivities(req, res, userId, success, responseBody) {
  const { method, path, body } = req;

  try {
    // User registration
    if (method === 'POST' && path.includes('/auth/register')) {
      await activityService.logUserRegistration(
        userId || responseBody?.data?.user?.id,
        req,
        success,
        success ? null : responseBody?.message
      );
    }

    // User login
    if (method === 'POST' && path.includes('/auth/login')) {
      await activityService.logUserLogin(
        userId || responseBody?.data?.user?.id,
        req,
        success,
        success ? null : responseBody?.message
      );
    }

    // User logout
    if (method === 'POST' && path.includes('/auth/logout')) {
      await activityService.logUserLogout(userId, req);
    }

    // Email verification
    if (path.includes('/auth/verify')) {
      await activityService.logEmailVerification(
        userId || responseBody?.data?.user?.id,
        req,
        success,
        success ? null : responseBody?.message
      );
    }

    // Password change
    if (method === 'POST' && path.includes('/auth/change-password')) {
      await activityService.logActivity({
        type: 'PASSWORD_CHANGE',
        description: success ? 'Password changed successfully' : 'Password change failed',
        userId,
        req,
        success,
        errorMessage: success ? null : responseBody?.message
      });
    }

    // Profile updates
    if (method === 'PUT' && path.includes('/user/profile')) {
      await activityService.logActivity({
        type: 'PROFILE_UPDATE',
        description: success ? 'Profile updated successfully' : 'Profile update failed',
        userId,
        req,
        success,
        errorMessage: success ? null : responseBody?.message,
        metadata: { updatedFields: Object.keys(body || {}) }
      });
    }

    // Ticket operations
    if (path.includes('/tickets')) {
      if (method === 'POST') {
        await activityService.logActivity({
          type: 'TICKET_CREATE',
          description: success ? 'Support ticket created' : 'Ticket creation failed',
          userId,
          req,
          success,
          errorMessage: success ? null : responseBody?.message,
          metadata: {
            ticketTitle: body?.title,
            ticketId: responseBody?.data?.id
          }
        });
      } else if (method === 'PUT' || method === 'PATCH') {
        await activityService.logActivity({
          type: 'TICKET_UPDATE',
          description: success ? 'Support ticket updated' : 'Ticket update failed',
          userId,
          req,
          success,
          errorMessage: success ? null : responseBody?.message,
          metadata: {
            ticketId: req.params.id,
            updatedFields: Object.keys(body || {})
          }
        });
      } else if (method === 'DELETE') {
        await activityService.logActivity({
          type: 'TICKET_DELETE',
          description: success ? 'Support ticket deleted' : 'Ticket deletion failed',
          userId,
          req,
          success,
          errorMessage: success ? null : responseBody?.message,
          metadata: { ticketId: req.params.id }
        });
      }
    }

    // Payment operations
    if (path.includes('/payment')) {
      if (method === 'POST' && path.includes('/initiate')) {
        await activityService.logPaymentActivity(
          userId,
          req,
          'PAYMENT_INITIATE',
          body?.amount || 0,
          success,
          success ? null : responseBody?.message
        );
      } else if (path.includes('/success')) {
        await activityService.logPaymentActivity(
          userId,
          req,
          'PAYMENT_SUCCESS',
          body?.amount || responseBody?.data?.amount || 0,
          success,
          success ? null : responseBody?.message
        );
      } else if (path.includes('/failed') || path.includes('/cancel')) {
        await activityService.logPaymentActivity(
          userId,
          req,
          'PAYMENT_FAILED',
          body?.amount || 0,
          false,
          responseBody?.message || 'Payment cancelled or failed'
        );
      }
    }

  } catch (error) {
    logger.error('Error logging specific activity', {
      error: error.message,
      endpoint: req.path,
      method: req.method,
      userId
    });
  }
}

/**
 * Middleware specifically for page view tracking
 */
const pageViewLogger = () => {
  return async (req, res, next) => {
    try {
      // Only log GET requests that serve HTML pages
      if (req.method === 'GET' &&
          req.accepts('html') &&
          !req.path.includes('/api/') &&
          !req.path.includes('/static/') &&
          !req.path.includes('/favicon.ico')) {

        const userId = req.user?.id || req.user?.userId || null;
        const page = req.path === '/' ? 'home' : req.path.replace(/^\//, '');

        await activityService.logPageView(userId, req, page);
      }
    } catch (error) {
      logger.error('Page view logging error', error);
    }

    next();
  };
};

/**
 * Manual activity logging helper for controllers
 */
const logActivity = async (type, description, userId, req, options = {}) => {
  try {
    return await activityService.logActivity({
      type,
      description,
      userId,
      req,
      ...options
    });
  } catch (error) {
    logger.error('Manual activity logging error', error);
  }
};

module.exports = {
  activityLogger,
  pageViewLogger,
  logActivity
};