const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

class ActivityService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Log an activity
   * @param {Object} params - Activity parameters
   * @param {string} params.type - Activity type from ActivityType enum
   * @param {string} params.description - Human-readable description
   * @param {string|null} params.userId - User ID (optional for guest activities)
   * @param {Object} params.req - Express request object (optional)
   * @param {Object} params.metadata - Additional metadata (optional)
   * @param {boolean} params.success - Whether the activity was successful (default: true)
   * @param {string} params.errorMessage - Error message if failed (optional)
   * @param {number} params.duration - Duration in milliseconds (optional)
   * @param {number} params.revenue - Revenue associated with activity (optional)
   */
  async logActivity({
    type,
    description,
    userId = null,
    req = null,
    metadata = null,
    success = true,
    errorMessage = null,
    duration = null,
    revenue = null
  }) {
    try {
      const activityData = {
        type,
        description,
        userId,
        success,
        errorMessage,
        duration,
        revenue,
        metadata
      };

      // Extract request information if available
      if (req) {
        activityData.ipAddress = this.getClientIp(req);
        activityData.userAgent = req.get('User-Agent');
        activityData.referrer = req.get('Referer');
        activityData.sessionId = req.sessionID || req.session?.id;

        // Device info from user agent
        activityData.deviceInfo = this.parseDeviceInfo(req.get('User-Agent'));

        // Location info (can be enhanced with IP geolocation service)
        activityData.location = this.getLocationInfo(req);
      }

      const activity = await this.prisma.activity.create({
        data: activityData
      });

      logger.info('Activity logged', {
        activityId: activity.id,
        type,
        userId,
        success,
        description
      });

      return activity;
    } catch (error) {
      logger.error('Failed to log activity', {
        error: error.message,
        type,
        userId,
        description
      });
      // Don't throw - activity logging should not break the main flow
      return null;
    }
  }

  /**
   * Log user registration activity
   */
  async logUserRegistration(userId, req, success = true, errorMessage = null) {
    return this.logActivity({
      type: 'USER_REGISTER',
      description: success ? 'User registered successfully' : 'User registration failed',
      userId,
      req,
      success,
      errorMessage
    });
  }

  /**
   * Log user login activity
   */
  async logUserLogin(userId, req, success = true, errorMessage = null) {
    return this.logActivity({
      type: 'USER_LOGIN',
      description: success ? 'User logged in successfully' : 'User login failed',
      userId,
      req,
      success,
      errorMessage
    });
  }

  /**
   * Log user logout activity
   */
  async logUserLogout(userId, req) {
    return this.logActivity({
      type: 'USER_LOGOUT',
      description: 'User logged out',
      userId,
      req,
      success: true
    });
  }

  /**
   * Log email verification activity
   */
  async logEmailVerification(userId, req, success = true, errorMessage = null) {
    return this.logActivity({
      type: 'EMAIL_VERIFY',
      description: success ? 'Email verified successfully' : 'Email verification failed',
      userId,
      req,
      success,
      errorMessage
    });
  }

  /**
   * Log payment activity
   */
  async logPaymentActivity(userId, req, type, amount, success = true, errorMessage = null) {
    return this.logActivity({
      type,
      description: `Payment ${success ? 'succeeded' : 'failed'}: ${amount}`,
      userId,
      req,
      success,
      errorMessage,
      revenue: success ? amount : null,
      metadata: { amount, currency: 'INR' }
    });
  }

  /**
   * Log page view activity
   */
  async logPageView(userId, req, page) {
    return this.logActivity({
      type: 'PAGE_VIEW',
      description: `Page viewed: ${page}`,
      userId,
      req,
      metadata: { page, url: req?.originalUrl }
    });
  }

  /**
   * Log API call activity
   */
  async logApiCall(userId, req, endpoint, method, success = true, duration = null, errorMessage = null) {
    return this.logActivity({
      type: 'API_CALL',
      description: `API call: ${method} ${endpoint}`,
      userId,
      req,
      success,
      errorMessage,
      duration,
      metadata: {
        endpoint,
        method,
        statusCode: req?.res?.statusCode
      }
    });
  }

  /**
   * Log feature usage activity
   */
  async logFeatureUse(userId, req, feature, metadata = null) {
    return this.logActivity({
      type: 'FEATURE_USE',
      description: `Feature used: ${feature}`,
      userId,
      req,
      metadata: { feature, ...metadata }
    });
  }

  /**
   * Log error activity
   */
  async logError(userId, req, error, context = null) {
    return this.logActivity({
      type: 'ERROR_OCCURRED',
      description: `Error: ${error.message}`,
      userId,
      req,
      success: false,
      errorMessage: error.message,
      metadata: {
        stack: error.stack,
        context,
        statusCode: req?.res?.statusCode
      }
    });
  }

  /**
   * Get business analytics
   */
  async getAnalytics(startDate, endDate = new Date(), userId = null) {
    try {
      const whereClause = {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      };

      if (userId) {
        whereClause.userId = userId;
      }

      const [
        totalActivities,
        userRegistrations,
        userLogins,
        paymentSuccess,
        paymentFailed,
        totalRevenue,
        errorCount,
        popularFeatures,
        dailyStats
      ] = await Promise.all([
        // Total activities
        this.prisma.activity.count({ where: whereClause }),

        // User registrations
        this.prisma.activity.count({
          where: { ...whereClause, type: 'USER_REGISTER', success: true }
        }),

        // User logins
        this.prisma.activity.count({
          where: { ...whereClause, type: 'USER_LOGIN', success: true }
        }),

        // Successful payments
        this.prisma.activity.count({
          where: { ...whereClause, type: 'PAYMENT_SUCCESS' }
        }),

        // Failed payments
        this.prisma.activity.count({
          where: { ...whereClause, type: 'PAYMENT_FAILED' }
        }),

        // Total revenue
        this.prisma.activity.aggregate({
          where: { ...whereClause, type: 'PAYMENT_SUCCESS' },
          _sum: { revenue: true }
        }),

        // Error count
        this.prisma.activity.count({
          where: { ...whereClause, success: false }
        }),

        // Popular features
        this.prisma.activity.groupBy({
          by: ['metadata'],
          where: { ...whereClause, type: 'FEATURE_USE' },
          _count: { _all: true },
          orderBy: { _count: { _all: 'desc' } },
          take: 10
        }),

        // Daily stats
        this.prisma.$queryRaw`
          SELECT
            DATE(created_at) as date,
            COUNT(*) as total_activities,
            COUNT(CASE WHEN type = 'USER_REGISTER' AND success = true THEN 1 END) as registrations,
            COUNT(CASE WHEN type = 'USER_LOGIN' AND success = true THEN 1 END) as logins,
            SUM(CASE WHEN type = 'PAYMENT_SUCCESS' THEN revenue ELSE 0 END) as daily_revenue
          FROM activities
          WHERE created_at BETWEEN ${startDate} AND ${endDate}
          ${userId ? `AND user_id = '${userId}'` : ''}
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 30
        `
      ]);

      return {
        summary: {
          totalActivities,
          userRegistrations,
          userLogins,
          paymentSuccess,
          paymentFailed,
          totalRevenue: totalRevenue._sum.revenue || 0,
          errorCount,
          successRate: totalActivities > 0 ? ((totalActivities - errorCount) / totalActivities * 100).toFixed(2) : 100
        },
        popularFeatures: popularFeatures.map(f => ({
          feature: f.metadata?.feature || 'Unknown',
          count: f._count._all
        })),
        dailyStats,
        period: {
          startDate,
          endDate,
          userId
        }
      };
    } catch (error) {
      logger.error('Failed to get analytics', error);
      throw error;
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserTimeline(userId, limit = 50, offset = 0) {
    try {
      const activities = await this.prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          description: true,
          success: true,
          errorMessage: true,
          metadata: true,
          createdAt: true,
          ipAddress: true,
          deviceInfo: true
        }
      });

      return activities;
    } catch (error) {
      logger.error('Failed to get user timeline', error);
      throw error;
    }
  }

  // Helper methods
  getClientIp(req) {
    return req.ip ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           '127.0.0.1';
  }

  parseDeviceInfo(userAgent) {
    if (!userAgent) return null;

    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const browser = this.getBrowserInfo(userAgent);
    const os = this.getOSInfo(userAgent);

    return {
      isMobile,
      browser,
      os
    };
  }

  getBrowserInfo(userAgent) {
    if (/Chrome/.test(userAgent)) return 'Chrome';
    if (/Firefox/.test(userAgent)) return 'Firefox';
    if (/Safari/.test(userAgent)) return 'Safari';
    if (/Edge/.test(userAgent)) return 'Edge';
    if (/Opera/.test(userAgent)) return 'Opera';
    return 'Unknown';
  }

  getOSInfo(userAgent) {
    if (/Windows/.test(userAgent)) return 'Windows';
    if (/Mac OS/.test(userAgent)) return 'macOS';
    if (/Linux/.test(userAgent)) return 'Linux';
    if (/Android/.test(userAgent)) return 'Android';
    if (/iOS/.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  getLocationInfo(req) {
    // This can be enhanced with IP geolocation services like MaxMind or ipapi.co
    // For now, return basic info from headers
    return {
      country: req.get('CF-IPCountry') || req.get('X-Country-Code') || null,
      timezone: req.get('CF-Timezone') || null
    };
  }
}

module.exports = new ActivityService();