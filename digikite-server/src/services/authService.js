const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../middleware/auth/jwt');
const googleAuthService = require('./googleAuthService');
const emailService = require('./emailService');
const databaseService = require('./databaseService');
const { logger } = require('../utils/logger');
const { clearUserCache } = require('../middleware/cache');

class AuthService {
  constructor() {
    this.db = databaseService;
  }

  async hashPassword(password) {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error('Password hashing failed', error);
      throw new Error('Password processing failed');
    }
  }

  async comparePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('Password comparison failed', error);
      throw new Error('Password verification failed');
    }
  }

  async registerUser(userData) {
    try {
      const { name, email, password } = userData;

      // Check if user already exists
      const existingUser = await this.db.findUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Generate verification code and token
      const verificationCode = emailService.generateVerificationCode();
      const verificationToken = emailService.generateVerificationToken();

      // Create user data
      const newUserData = {
        name,
        email,
        password: hashedPassword,
        provider: 'EMAIL',
        emailVerified: false,
        verificationToken,
        verificationCode,
        verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      // Create user in database
      const user = await this.db.createUser(newUserData);

      logger.info('User registered successfully', { userId: user.id, email });

      // Send verification email
      try {
        await emailService.sendVerificationEmail(email, name, verificationToken, verificationCode);
        logger.info('Verification email sent', { userId: user.id, email });
      } catch (emailError) {
        logger.warn('Failed to send verification email, but user was created', {
          userId: user.id,
          email,
          error: emailError.message
        });
      }

      // Generate tokens (but don't allow full access until verified)
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        emailVerified: user.emailVerified
      };

      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Return user without password and verification details
      const { password: _, verificationToken: __, verificationCode: ___, ...userResponse } = user;

      return {
        user: userResponse,
        token,
        refreshToken,
        message: 'Account created successfully! Please check your email to verify your account.',
        emailSent: true
      };
    } catch (error) {
      logger.error('User registration failed', { error: error.message });
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      // Find user
      const user = await this.db.findUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      logger.info('User logged in successfully', { userId: user.id, email });

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider
      };

      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Return user without password
      const { password: _, ...userResponse } = user;

      return {
        user: userResponse,
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('User login failed', { error: error.message });
      throw error;
    }
  }

  async googleAuth(googleToken) {
    try {
      // Verify Google token and get user info
      const googleUserInfo = await googleAuthService.verifyGoogleToken(googleToken);

      logger.info('Google user info received', {
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        picture: googleUserInfo.picture
      });

      // Check if user exists by email first
      let user = await this.db.findUserByEmail(googleUserInfo.email);

      if (user) {
        // User exists - handle account linking
        if (!user.googleId) {
          // Link Google account to existing email account
          logger.info('Linking Google account to existing email account', {
            userId: user.id,
            email: user.email
          });

          user = await this.db.updateUser(user.id, {
            googleId: googleUserInfo.googleId,
            avatar: googleUserInfo.picture,
            emailVerified: true, // Google emails are pre-verified
            provider: user.provider === 'EMAIL' ? 'EMAIL' : 'GOOGLE' // Keep original if email, otherwise Google
          });

          // Send account linking notification email
          try {
            await emailService.sendAccountLinkingEmail(user.email, user.name);
          } catch (emailError) {
            logger.warn('Failed to send account linking email', { error: emailError.message });
          }
        } else {
          // Existing Google user - update profile data
          user = await this.db.updateUser(user.id, {
            name: googleUserInfo.name, // Update name in case it changed
            avatar: googleUserInfo.picture // Update profile picture
          });
        }

        logger.info('Existing user logged in with Google', { userId: user.id, email: user.email });
      } else {
        // Create new Google user
        logger.info('Creating new Google user', { email: googleUserInfo.email });

        const newUserData = {
          name: googleUserInfo.name,
          email: googleUserInfo.email,
          password: null, // No password for Google users
          provider: 'GOOGLE',
          googleId: googleUserInfo.googleId,
          avatar: googleUserInfo.picture,
          emailVerified: true, // Google emails are pre-verified
        };

        user = await this.db.createUser(newUserData);

        logger.info('New Google user created successfully', { userId: user.id, email: user.email });

        // Send welcome email for new Google users
        try {
          await emailService.sendWelcomeEmail(user.email, user.name);
        } catch (emailError) {
          logger.warn('Failed to send welcome email', { error: emailError.message });
        }
      }

      // Generate tokens with verified email status
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        emailVerified: user.emailVerified
      };

      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Return user without sensitive data
      const { password: _, verificationToken: __, verificationCode: ___, ...userResponse } = user;

      return {
        user: userResponse,
        token,
        refreshToken,
        message: user.createdAt === user.updatedAt ?
          'Welcome to DigiKite! Your account has been created successfully.' :
          'Welcome back! You have been logged in successfully.',
        isNewUser: user.createdAt === user.updatedAt
      };
    } catch (error) {
      logger.error('Google authentication failed', { error: error.message });
      throw error;
    }
  }

  async getCurrentUser(userId) {
    try {
      const user = await this.db.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Return user without password
      const { password, ...userResponse } = user;
      return userResponse;
    } catch (error) {
      logger.error('Get current user failed', { error: error.message, userId });
      throw error;
    }
  }

  async logoutUser(userId) {
    try {
      // Clear user cache
      clearUserCache(userId);

      logger.info('User logged out successfully', { userId });
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('User logout failed', { error: error.message, userId });
      throw error;
    }
  }

  async findUserByEmail(email) {
    return await this.db.findUserByEmail(email);
  }

  async findUserById(userId) {
    return await this.db.findUserById(userId);
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.db.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.provider !== 'email') {
        throw new Error('Password change not available for social login users');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update user
      await this.db.updateUser(userId, {
        password: hashedNewPassword
      });

      // Clear user cache
      clearUserCache(userId);

      logger.info('Password changed successfully', { userId });
      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Password change failed', { error: error.message, userId });
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      // Find user by verification token
      const user = await this.db.findUserByVerificationToken(token);
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Check if already verified
      if (user.emailVerified) {
        return {
          user: { ...user, password: undefined },
          message: 'Email is already verified',
          alreadyVerified: true
        };
      }

      // Mark as verified
      const updatedUser = await this.db.updateUser(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationCode: null,
        verificationCodeExpires: null
      });

      logger.info('Email verified successfully', { userId: user.id, email: user.email });

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user.email, user.name);
        logger.info('Welcome email sent', { userId: user.id, email: user.email });
      } catch (emailError) {
        logger.warn('Failed to send welcome email', {
          userId: user.id,
          email: user.email,
          error: emailError.message
        });
      }

      // Generate new tokens with verified status
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        emailVerified: true
      };

      const newToken = generateToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      // Return user without sensitive data
      const { password: _, ...userResponse } = user;

      return {
        user: userResponse,
        token: newToken,
        refreshToken: newRefreshToken,
        message: 'Email verified successfully! Welcome to DigiKite!',
        verified: true
      };
    } catch (error) {
      logger.error('Email verification failed', { error: error.message, token });
      throw error;
    }
  }

  async verifyEmailWithCode(email, code) {
    try {
      // Find user by email
      const user = await this.db.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if already verified
      if (user.emailVerified) {
        return {
          user: { ...user, password: undefined },
          message: 'Email is already verified',
          alreadyVerified: true
        };
      }

      // Check verification code
      if (!user.verificationCode || user.verificationCode !== code) {
        throw new Error('Invalid verification code');
      }

      // Check if code is expired
      if (new Date() > user.verificationCodeExpires) {
        throw new Error('Verification code has expired');
      }

      // Mark as verified
      const updatedUser = await this.db.updateUser(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationCode: null,
        verificationCodeExpires: null
      });

      logger.info('Email verified successfully with code', { userId: updatedUser.id, email: updatedUser.email });

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(updatedUser.email, updatedUser.name);
        logger.info('Welcome email sent', { userId: updatedUser.id, email: updatedUser.email });
      } catch (emailError) {
        logger.warn('Failed to send welcome email', {
          userId: updatedUser.id,
          email: updatedUser.email,
          error: emailError.message
        });
      }

      // Generate new tokens with verified status
      const tokenPayload = {
        userId: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        provider: updatedUser.provider,
        emailVerified: true
      };

      const newToken = generateToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      // Return user without sensitive data
      const { password: _, ...userResponse } = updatedUser;

      return {
        user: userResponse,
        token: newToken,
        refreshToken: newRefreshToken,
        message: 'Email verified successfully! Welcome to DigiKite!',
        verified: true
      };
    } catch (error) {
      logger.error('Email verification with code failed', { error: error.message, email });
      throw error;
    }
  }

  async resendVerificationEmail(email) {
    try {
      // Find user by email
      const user = await this.db.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if already verified
      if (user.emailVerified) {
        throw new Error('Email is already verified');
      }

      // Generate new verification code and token
      const verificationCode = emailService.generateVerificationCode();
      const verificationToken = emailService.generateVerificationToken();

      // Update user with new verification details
      const updatedUser = await this.db.updateUser(user.id, {
        verificationToken,
        verificationCode,
        verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Send verification email
      await emailService.sendVerificationEmail(updatedUser.email, updatedUser.name, verificationToken, verificationCode);

      logger.info('Verification email resent', { userId: updatedUser.id, email: updatedUser.email });

      return {
        message: 'Verification email sent successfully! Please check your inbox.',
        emailSent: true
      };
    } catch (error) {
      logger.error('Resend verification email failed', { error: error.message, email });
      throw error;
    }
  }
}

module.exports = new AuthService();