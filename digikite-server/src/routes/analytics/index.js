const express = require('express');
const analyticsController = require('../../controllers/analyticsController');
const { authenticateToken } = require('../../middleware/auth/jwt');
const { adminOnly, roleBasedAccess } = require('../../middleware/auth/rbac');
const { validateRequest } = require('../../middleware/validation/index');
const { query, param } = require('express-validator');
const router = express.Router();

// Validation schemas
const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
];

const paginationValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

const userIdValidation = [
  param('userId')
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage('User ID must not be empty'),
];

// Routes

/**
 * @route GET /api/v1/analytics/dashboard
 * @desc Get business analytics dashboard
 * @access Admin only
 */
router.get('/dashboard',
  authenticateToken,
  roleBasedAccess(['ADMIN', 'SUPER_ADMIN']),
  dateRangeValidation,
  validateRequest,
  analyticsController.getDashboard
);

/**
 * @route GET /api/v1/analytics/realtime
 * @desc Get real-time analytics stats (last 24h)
 * @access Admin only
 */
router.get('/realtime',
  authenticateToken,
  roleBasedAccess(['ADMIN', 'SUPER_ADMIN']),
  analyticsController.getRealTimeStats
);

/**
 * @route GET /api/v1/analytics/funnel
 * @desc Get conversion funnel data
 * @access Admin only
 */
router.get('/funnel',
  authenticateToken,
  roleBasedAccess(['ADMIN', 'SUPER_ADMIN']),
  dateRangeValidation,
  validateRequest,
  analyticsController.getConversionFunnel
);

/**
 * @route GET /api/v1/analytics/behavior
 * @desc Get user behavior insights
 * @access Admin only
 */
router.get('/behavior',
  authenticateToken,
  roleBasedAccess(['ADMIN', 'SUPER_ADMIN']),
  dateRangeValidation,
  validateRequest,
  analyticsController.getUserBehaviorInsights
);

/**
 * @route GET /api/v1/analytics/timeline/:userId
 * @desc Get user activity timeline (users can see own, admins can see any)
 * @access Authenticated users (own data) / Admin (any user's data)
 */
router.get('/timeline/:userId',
  authenticateToken,
  userIdValidation,
  paginationValidation,
  validateRequest,
  analyticsController.getUserTimeline
);

/**
 * @route GET /api/v1/analytics/my-timeline
 * @desc Get current user's activity timeline
 * @access Authenticated users
 */
router.get('/my-timeline',
  authenticateToken,
  paginationValidation,
  validateRequest,
  analyticsController.getUserTimeline
);

module.exports = router;