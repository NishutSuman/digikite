const express = require('express');
const authController = require('../../controllers/authController');
const { validateRequest } = require('../../middleware/validation/validator');
const authValidation = require('../../middleware/validation/authValidation');
const { authenticateToken } = require('../../middleware/auth/jwt');
const { cacheMiddleware } = require('../../middleware/cache');

const router = express.Router();

// Public routes
router.post(
  '/register',
  validateRequest(authValidation.register),
  authController.register
);

router.post(
  '/login',
  validateRequest(authValidation.login),
  authController.login
);

router.post(
  '/google',
  validateRequest(authValidation.googleAuth),
  authController.googleAuth
);

// Email verification routes
router.get(
  '/verify-email',
  authController.verifyEmail
);

router.post(
  '/verify-email-code',
  validateRequest(authValidation.verifyEmailCode),
  authController.verifyEmailWithCode
);

router.post(
  '/resend-verification',
  validateRequest(authValidation.resendVerification),
  authController.resendVerificationEmail
);

// Protected routes
router.get(
  '/me',
  authenticateToken,
  cacheMiddleware(300), // Cache for 5 minutes
  authController.getCurrentUser
);

router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

router.post(
  '/change-password',
  authenticateToken,
  validateRequest(authValidation.changePassword),
  authController.changePassword
);

router.post(
  '/refresh-token',
  authController.refreshToken
);

module.exports = router;