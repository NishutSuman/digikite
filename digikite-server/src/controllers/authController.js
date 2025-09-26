const authService = require('../services/authService');
const { logger } = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      logger.info(`AuthController.register called for email: ${email}`);

      const result = await authService.registerUser({ name, email, password });
      logger.info(`AuthController.register completed for email: ${email}, userId: ${result.user.id}`);

      logger.info('User registration successful', {
        userId: result.user.id,
        email: result.user.email,
        ip: req.ip
      });

      return successResponse(res, 'User registered successfully', {
        user: result.user,
        token: result.token
      }, 201);

    } catch (error) {
      logger.error('Registration failed', {
        error: error.message,
        email: req.body?.email,
        ip: req.ip
      });

      if (error.message === 'User with this email already exists') {
        return errorResponse(res, error.message, 409);
      }

      return errorResponse(res, 'Registration failed', 400);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await authService.loginUser(email, password);

      logger.info('User login successful', {
        userId: result.user.id,
        email: result.user.email,
        ip: req.ip
      });

      return successResponse(res, 'Login successful', {
        user: result.user,
        token: result.token
      });

    } catch (error) {
      logger.error('Login failed', {
        error: error.message,
        email: req.body?.email,
        ip: req.ip
      });

      if (error.message === 'Invalid email or password') {
        return errorResponse(res, error.message, 401);
      }

      return errorResponse(res, 'Login failed', 400);
    }
  }

  async googleAuth(req, res) {
    try {
      const { token } = req.body;

      const result = await authService.googleAuth(token);

      logger.info('Google authentication successful', {
        userId: result.user.id,
        email: result.user.email,
        ip: req.ip
      });

      return successResponse(res, 'Google authentication successful', {
        user: result.user,
        token: result.token
      });

    } catch (error) {
      logger.error('Google authentication failed', {
        error: error.message,
        ip: req.ip
      });

      if (error.message === 'Invalid Google token') {
        return errorResponse(res, error.message, 401);
      }

      return errorResponse(res, 'Google authentication failed', 400);
    }
  }

  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;

      const user = await authService.getCurrentUser(userId);

      return successResponse(res, 'User retrieved successfully', user);

    } catch (error) {
      logger.error('Get current user failed', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip
      });

      if (error.message === 'User not found') {
        return errorResponse(res, error.message, 404);
      }

      return errorResponse(res, 'Failed to retrieve user', 400);
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user.id;

      await authService.logoutUser(userId);

      logger.info('User logout successful', {
        userId,
        ip: req.ip
      });

      return successResponse(res, 'Logout successful');

    } catch (error) {
      logger.error('Logout failed', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip
      });

      return errorResponse(res, 'Logout failed', 400);
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(userId, currentPassword, newPassword);

      logger.info('Password change successful', {
        userId,
        ip: req.ip
      });

      return successResponse(res, 'Password changed successfully');

    } catch (error) {
      logger.error('Password change failed', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip
      });

      if (error.message === 'Current password is incorrect') {
        return errorResponse(res, error.message, 400);
      }

      if (error.message === 'Password change not available for social login users') {
        return errorResponse(res, error.message, 403);
      }

      return errorResponse(res, 'Password change failed', 400);
    }
  }

  async refreshToken(req, res) {
    try {
      // Implementation for refresh token logic
      // This would typically verify the refresh token and generate new tokens
      return successResponse(res, 'Token refreshed successfully');

    } catch (error) {
      logger.error('Token refresh failed', {
        error: error.message,
        ip: req.ip
      });

      return errorResponse(res, 'Token refresh failed', 401);
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return errorResponse(res, 'Verification token is required', 400);
      }

      const result = await authService.verifyEmail(token);

      logger.info('Email verification successful', {
        userId: result.user.id,
        email: result.user.email,
        ip: req.ip
      });

      return successResponse(res, result.message, {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
        verified: result.verified,
        alreadyVerified: result.alreadyVerified
      });

    } catch (error) {
      logger.error('Email verification failed', {
        error: error.message,
        token: req.query?.token,
        ip: req.ip
      });

      if (error.message === 'Invalid or expired verification token') {
        return errorResponse(res, error.message, 400);
      }

      return errorResponse(res, 'Email verification failed', 400);
    }
  }

  async verifyEmailWithCode(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return errorResponse(res, 'Email and verification code are required', 400);
      }

      const result = await authService.verifyEmailWithCode(email, code);

      logger.info('Email verification with code successful', {
        userId: result.user.id,
        email: result.user.email,
        ip: req.ip
      });

      return successResponse(res, result.message, {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
        verified: result.verified,
        alreadyVerified: result.alreadyVerified
      });

    } catch (error) {
      logger.error('Email verification with code failed', {
        error: error.message,
        email: req.body?.email,
        ip: req.ip
      });

      if (error.message.includes('Invalid verification code') ||
          error.message.includes('expired') ||
          error.message.includes('User not found') ||
          error.message.includes('already verified')) {
        return errorResponse(res, error.message, 400);
      }

      return errorResponse(res, 'Email verification failed', 400);
    }
  }

  async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return errorResponse(res, 'Email is required', 400);
      }

      const result = await authService.resendVerificationEmail(email);

      logger.info('Verification email resent successfully', {
        email,
        ip: req.ip
      });

      return successResponse(res, result.message, {
        emailSent: result.emailSent
      });

    } catch (error) {
      logger.error('Resend verification email failed', {
        error: error.message,
        email: req.body?.email,
        ip: req.ip
      });

      if (error.message.includes('User not found') ||
          error.message.includes('already verified')) {
        return errorResponse(res, error.message, 400);
      }

      return errorResponse(res, 'Failed to resend verification email', 400);
    }
  }
}

module.exports = new AuthController();