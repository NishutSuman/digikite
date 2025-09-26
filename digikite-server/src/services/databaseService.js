const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

class DatabaseService {
  constructor() {
    this.prisma = null;
    this.isConnected = false;
    // Removed fallback storage - using Prisma only
    this.init();
  }

  async init() {
    try {
      this.prisma = new PrismaClient();
      await this.prisma.$connect();
      this.isConnected = true;
      logger.info('Database connected successfully (Prisma)');
      logger.info(`DatabaseService connection status: isConnected=${this.isConnected}, prisma=${!!this.prisma}`);
    } catch (error) {
      logger.warn('Database connection failed, using in-memory storage', { error: error.message });
      this.isConnected = false;
      this.prisma = null;
      logger.info(`DatabaseService connection status: isConnected=${this.isConnected}, prisma=${!!this.prisma}`);
    }
  }

  async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }

  // User operations
  async createUser(userData) {
    logger.info(`DatabaseService.createUser called - isConnected: ${this.isConnected}, prisma: ${!!this.prisma}`);
    if (this.isConnected && this.prisma) {
      try {
        logger.info('Creating user with Prisma...');
        const user = await this.prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            password: userData.password,
            provider: userData.provider || 'EMAIL',
            googleId: userData.googleId || null,
            emailVerified: userData.emailVerified || false,
            verificationToken: userData.verificationToken || null,
            verificationCode: userData.verificationCode || null,
            verificationCodeExpires: userData.verificationCodeExpires || null,
            avatar: userData.avatar || null,
          }
        });
        logger.info('User created successfully with Prisma:', user.id);
        return user;
      } catch (error) {
        logger.error('Database createUser failed:', error.message);
        throw error;
      }
    } else {
      logger.error('Database not connected - cannot create user');
      throw new Error('Database not available');
    }
  }

  async findUserByEmail(email) {
    logger.info(`DatabaseService.findUserByEmail(${email}) called - isConnected: ${this.isConnected}, prisma: ${!!this.prisma}`);
    if (this.isConnected && this.prisma) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { email }
        });
        logger.info(`Prisma findUserByEmail(${email}): ${user ? 'FOUND' : 'NOT FOUND'}`);
        return user;
      } catch (error) {
        logger.error('Database findUserByEmail failed:', error.message);
        return null;
      }
    } else {
      logger.error('Database not connected - cannot find user by email');
      return null;
    }
  }

  async findUserById(id) {
    if (this.isConnected && this.prisma) {
      try {
        return await this.prisma.user.findUnique({
          where: { id }
        });
      } catch (error) {
        logger.error('Database findUserById failed:', error.message);
        return null;
      }
    } else {
      logger.error('Database not connected - cannot find user by id');
      return null;
    }
  }

  async findUserByVerificationToken(token) {
    if (this.isConnected && this.prisma) {
      try {
        return await this.prisma.user.findUnique({
          where: { verificationToken: token }
        });
      } catch (error) {
        logger.error('Database findUserByVerificationToken failed:', error.message);
        return null;
      }
    } else {
      logger.error('Database not connected - cannot find user by verification token');
      return null;
    }
  }

  async findUserByGoogleId(googleId) {
    if (this.isConnected && this.prisma) {
      try {
        return await this.prisma.user.findUnique({
          where: { googleId }
        });
      } catch (error) {
        logger.error('Database findUserByGoogleId failed:', error.message);
        return null;
      }
    } else {
      logger.error('Database not connected - cannot find user by Google ID');
      return null;
    }
  }

  async updateUser(id, updateData) {
    if (this.isConnected && this.prisma) {
      try {
        return await this.prisma.user.update({
          where: { id },
          data: {
            ...updateData,
            updatedAt: new Date()
          }
        });
      } catch (error) {
        logger.error('Database updateUser failed:', error.message);
        throw error;
      }
    } else {
      logger.error('Database not connected - cannot update user');
      throw new Error('Database not available');
    }
  }

  async deleteUser(id) {
    if (this.isConnected && this.prisma) {
      try {
        return await this.prisma.user.delete({
          where: { id }
        });
      } catch (error) {
        logger.error('Database deleteUser failed:', error.message);
        throw error;
      }
    } else {
      logger.error('Database not connected - cannot delete user');
      throw new Error('Database not available');
    }
  }

  // Health check
  async healthCheck() {
    if (this.isConnected && this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        return { status: 'healthy', database: 'prisma' };
      } catch (error) {
        return { status: 'unhealthy', database: 'prisma', error: error.message };
      }
    } else {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: 'Prisma connection failed'
      };
    }
  }
}

module.exports = new DatabaseService();