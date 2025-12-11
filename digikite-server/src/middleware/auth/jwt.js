const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { env } = require('../../config/env');
const { logger } = require('../../utils/logger');
const { getUserCache, setUserCache } = require('../cache');

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (payload) => {
  try {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN || '7d',
      issuer: 'digikite-app'
    });
  } catch (error) {
    logger.error('Token generation error', error);
    throw new Error('Token generation failed');
  }
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET || env.JWT_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'digikite-app'
    });
  } catch (error) {
    logger.error('Refresh token generation error', error);
    throw new Error('Refresh token generation failed');
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    logger.error('Token verification error', error);
    throw error;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET || env.JWT_SECRET);
  } catch (error) {
    logger.error('Refresh token verification error', error);
    throw error;
  }
};

// JWT Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check cache first
    let user = getUserCache(decoded.userId);

    if (!user) {
      // Fetch from database to get role and clientOrganizationId
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          emailVerified: true,
          provider: true,
          clientOrganizationId: true,
        },
      });

      if (!dbUser) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!dbUser.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      user = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        isActive: dbUser.isActive,
        emailVerified: dbUser.emailVerified,
        provider: dbUser.provider,
        clientOrganizationId: dbUser.clientOrganizationId,
      };

      // Cache user data
      setUserCache(decoded.userId, user);
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Token authentication error', {
      error: error.message,
      path: req.path,
      ip: req.ip
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);

    let user = getUserCache(decoded.userId);

    if (!user) {
      user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        provider: decoded.provider || 'email'
      };

      setUserCache(decoded.userId, user);
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    // Don't fail on optional auth, just continue
    logger.warn('Optional auth failed', { error: error.message });
    next();
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  authenticateToken,
  optionalAuth
};