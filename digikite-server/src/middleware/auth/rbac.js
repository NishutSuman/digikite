const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/response');

/**
 * Role-based access control middleware
 * @param {Array} allowedRoles - Array of roles that can access the endpoint
 */
const roleBasedAccess = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        logger.warn('RBAC: No user found in request');
        return errorResponse(res, 'Access denied. Please authenticate.', 401);
      }

      if (!user.role) {
        logger.warn('RBAC: User has no role assigned', { userId: user.id });
        return errorResponse(res, 'Access denied. No role assigned.', 403);
      }

      if (!allowedRoles.includes(user.role)) {
        logger.warn('RBAC: Access denied for user role', {
          userId: user.id,
          userRole: user.role,
          allowedRoles,
          endpoint: req.originalUrl
        });
        return errorResponse(res, 'Access denied. Insufficient permissions.', 403);
      }

      logger.info('RBAC: Access granted', {
        userId: user.id,
        userRole: user.role,
        endpoint: req.originalUrl
      });

      next();
    } catch (error) {
      logger.error('RBAC middleware error', {
        error: error.message,
        userId: req.user?.id,
        endpoint: req.originalUrl
      });
      return errorResponse(res, 'Access control error', 500);
    }
  };
};

/**
 * Admin only access middleware (Digikite staff)
 */
const adminOnly = () => {
  return roleBasedAccess(['ADMIN', 'SUPER_ADMIN']);
};

/**
 * Super admin only access middleware
 */
const superAdminOnly = () => {
  return roleBasedAccess(['SUPER_ADMIN']);
};

/**
 * User portal access middleware (for USER role)
 * Also allows admins to access for support purposes
 */
const userPortalAccess = () => {
  return roleBasedAccess(['ADMIN', 'SUPER_ADMIN', 'USER']);
};

/**
 * Check if user owns the resource or is admin
 * @param {Function} getResourceOwnerId - Function that extracts owner ID from request
 */
const ownerOrAdmin = (getResourceOwnerId) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return errorResponse(res, 'Access denied. Please authenticate.', 401);
      }

      // Allow admins to access any resource
      if (['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        return next();
      }

      // Check if user owns the resource
      const resourceOwnerId = getResourceOwnerId(req);

      if (user.id === resourceOwnerId || user.userId === resourceOwnerId) {
        return next();
      }

      logger.warn('RBAC: Resource access denied', {
        userId: user.id,
        resourceOwnerId,
        endpoint: req.originalUrl
      });

      return errorResponse(res, 'Access denied. You can only access your own resources.', 403);
    } catch (error) {
      logger.error('Owner or admin middleware error', {
        error: error.message,
        userId: req.user?.id,
        endpoint: req.originalUrl
      });
      return errorResponse(res, 'Access control error', 500);
    }
  };
};

/**
 * Check if user account is active
 */
const activeUserOnly = () => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return errorResponse(res, 'Access denied. Please authenticate.', 401);
      }

      if (user.isActive === false) {
        logger.warn('Inactive user attempted access', {
          userId: user.id,
          endpoint: req.originalUrl
        });
        return errorResponse(res, 'Account is deactivated. Please contact support.', 403);
      }

      next();
    } catch (error) {
      logger.error('Active user middleware error', {
        error: error.message,
        userId: req.user?.id,
        endpoint: req.originalUrl
      });
      return errorResponse(res, 'Access control error', 500);
    }
  };
};

/**
 * Check if user email is verified for certain actions
 */
const verifiedEmailOnly = () => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return errorResponse(res, 'Access denied. Please authenticate.', 401);
      }

      if (!user.emailVerified) {
        logger.warn('Unverified user attempted protected access', {
          userId: user.id,
          endpoint: req.originalUrl
        });
        return errorResponse(res, 'Email verification required for this action.', 403);
      }

      next();
    } catch (error) {
      logger.error('Verified email middleware error', {
        error: error.message,
        userId: req.user?.id,
        endpoint: req.originalUrl
      });
      return errorResponse(res, 'Access control error', 500);
    }
  };
};

module.exports = {
  roleBasedAccess,
  adminOnly,
  superAdminOnly,
  userPortalAccess,
  ownerOrAdmin,
  activeUserOnly,
  verifiedEmailOnly
};