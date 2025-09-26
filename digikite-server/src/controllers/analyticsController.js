const activityService = require('../services/activityService');
const { logger } = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

class AnalyticsController {
  /**
   * Get business analytics dashboard data
   */
  async getDashboard(req, res) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate = new Date(),
        userId = null
      } = req.query;

      const analytics = await activityService.getAnalytics(
        new Date(startDate),
        new Date(endDate),
        userId
      );

      logger.info('Analytics dashboard requested', {
        userId: req.user?.id,
        requestedUserId: userId,
        dateRange: { startDate, endDate }
      });

      return successResponse(res, 'Analytics retrieved successfully', analytics);
    } catch (error) {
      logger.error('Get analytics dashboard failed', {
        error: error.message,
        userId: req.user?.id
      });
      return errorResponse(res, 'Failed to retrieve analytics', 500);
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserTimeline(req, res) {
    try {
      const userId = req.params.userId || req.user?.id;
      const { limit = 50, offset = 0 } = req.query;

      // Check permission - users can only see their own timeline unless admin
      if (userId !== req.user?.id && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
        return errorResponse(res, 'Access denied', 403);
      }

      const timeline = await activityService.getUserTimeline(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      logger.info('User timeline requested', {
        requestorId: req.user?.id,
        targetUserId: userId,
        limit,
        offset
      });

      return successResponse(res, 'User timeline retrieved successfully', {
        userId,
        activities: timeline,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: timeline.length === parseInt(limit)
        }
      });
    } catch (error) {
      logger.error('Get user timeline failed', {
        error: error.message,
        userId: req.user?.id,
        targetUserId: req.params.userId
      });
      return errorResponse(res, 'Failed to retrieve user timeline', 500);
    }
  }

  /**
   * Get real-time activity stats
   */
  async getRealTimeStats(req, res) {
    try {
      // Get stats for last 24 hours
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const now = new Date();

      const stats = await activityService.getAnalytics(last24Hours, now);

      // Add real-time metrics
      const realTimeStats = {
        ...stats.summary,
        period: '24h',
        activeUsers: await this.getActiveUsersCount(last24Hours),
        averageSessionDuration: await this.getAverageSessionDuration(last24Hours),
        topPages: await this.getTopPages(last24Hours),
        errorRate: parseFloat(((stats.summary.errorCount / stats.summary.totalActivities) * 100 || 0).toFixed(2))
      };

      logger.info('Real-time stats requested', {
        userId: req.user?.id
      });

      return successResponse(res, 'Real-time stats retrieved successfully', realTimeStats);
    } catch (error) {
      logger.error('Get real-time stats failed', {
        error: error.message,
        userId: req.user?.id
      });
      return errorResponse(res, 'Failed to retrieve real-time stats', 500);
    }
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(req, res) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date()
      } = req.query;

      const whereClause = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };

      // Define funnel steps
      const [
        pageViews,
        registrationAttempts,
        emailVerifications,
        firstLogins,
        paymentAttempts,
        successfulPayments
      ] = await Promise.all([
        activityService.prisma.activity.count({
          where: { ...whereClause, type: 'PAGE_VIEW' }
        }),
        activityService.prisma.activity.count({
          where: { ...whereClause, type: 'USER_REGISTER' }
        }),
        activityService.prisma.activity.count({
          where: { ...whereClause, type: 'EMAIL_VERIFY', success: true }
        }),
        activityService.prisma.activity.count({
          where: { ...whereClause, type: 'USER_LOGIN', success: true }
        }),
        activityService.prisma.activity.count({
          where: { ...whereClause, type: 'PAYMENT_INITIATE' }
        }),
        activityService.prisma.activity.count({
          where: { ...whereClause, type: 'PAYMENT_SUCCESS' }
        })
      ]);

      const funnel = [
        { step: 'Page Views', count: pageViews, percentage: 100 },
        {
          step: 'Registration Attempts',
          count: registrationAttempts,
          percentage: pageViews > 0 ? ((registrationAttempts / pageViews) * 100).toFixed(2) : 0
        },
        {
          step: 'Email Verifications',
          count: emailVerifications,
          percentage: registrationAttempts > 0 ? ((emailVerifications / registrationAttempts) * 100).toFixed(2) : 0
        },
        {
          step: 'First Logins',
          count: firstLogins,
          percentage: emailVerifications > 0 ? ((firstLogins / emailVerifications) * 100).toFixed(2) : 0
        },
        {
          step: 'Payment Attempts',
          count: paymentAttempts,
          percentage: firstLogins > 0 ? ((paymentAttempts / firstLogins) * 100).toFixed(2) : 0
        },
        {
          step: 'Successful Payments',
          count: successfulPayments,
          percentage: paymentAttempts > 0 ? ((successfulPayments / paymentAttempts) * 100).toFixed(2) : 0
        }
      ];

      logger.info('Conversion funnel requested', {
        userId: req.user?.id,
        dateRange: { startDate, endDate }
      });

      return successResponse(res, 'Conversion funnel retrieved successfully', {
        funnel,
        period: { startDate, endDate },
        overallConversionRate: pageViews > 0 ? ((successfulPayments / pageViews) * 100).toFixed(4) : 0
      });
    } catch (error) {
      logger.error('Get conversion funnel failed', {
        error: error.message,
        userId: req.user?.id
      });
      return errorResponse(res, 'Failed to retrieve conversion funnel', 500);
    }
  }

  /**
   * Get user behavior insights
   */
  async getUserBehaviorInsights(req, res) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date()
      } = req.query;

      const insights = await this.calculateUserBehaviorInsights(
        new Date(startDate),
        new Date(endDate)
      );

      logger.info('User behavior insights requested', {
        userId: req.user?.id,
        dateRange: { startDate, endDate }
      });

      return successResponse(res, 'User behavior insights retrieved successfully', insights);
    } catch (error) {
      logger.error('Get user behavior insights failed', {
        error: error.message,
        userId: req.user?.id
      });
      return errorResponse(res, 'Failed to retrieve user behavior insights', 500);
    }
  }

  // Helper methods
  async getActiveUsersCount(since) {
    try {
      return await activityService.prisma.activity.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: since },
          userId: { not: null }
        },
        _count: { userId: true }
      }).then(results => results.length);
    } catch (error) {
      logger.error('Get active users count failed', error);
      return 0;
    }
  }

  async getAverageSessionDuration(since) {
    try {
      // This is a simplified calculation - in real implementation,
      // you'd track session start/end times more precisely
      const activities = await activityService.prisma.activity.findMany({
        where: {
          createdAt: { gte: since },
          userId: { not: null }
        },
        select: {
          userId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });

      if (activities.length < 2) return 0;

      const sessionDurations = new Map();
      activities.forEach(activity => {
        if (!sessionDurations.has(activity.userId)) {
          sessionDurations.set(activity.userId, {
            start: activity.createdAt,
            end: activity.createdAt
          });
        } else {
          sessionDurations.get(activity.userId).end = activity.createdAt;
        }
      });

      const totalDuration = Array.from(sessionDurations.values())
        .reduce((sum, session) => sum + (session.end - session.start), 0);

      return Math.round(totalDuration / sessionDurations.size / 60000); // Convert to minutes
    } catch (error) {
      logger.error('Get average session duration failed', error);
      return 0;
    }
  }

  async getTopPages(since) {
    try {
      return await activityService.prisma.activity.groupBy({
        by: ['metadata'],
        where: {
          createdAt: { gte: since },
          type: 'PAGE_VIEW'
        },
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 10
      }).then(results =>
        results.map(r => ({
          page: r.metadata?.page || 'Unknown',
          views: r._count._all
        }))
      );
    } catch (error) {
      logger.error('Get top pages failed', error);
      return [];
    }
  }

  async calculateUserBehaviorInsights(startDate, endDate) {
    const whereClause = {
      createdAt: { gte: startDate, lte: endDate }
    };

    const [
      userEngagement,
      featureUsage,
      deviceBreakdown,
      timeOfDayDistribution
    ] = await Promise.all([
      this.getUserEngagementMetrics(whereClause),
      this.getFeatureUsageMetrics(whereClause),
      this.getDeviceBreakdown(whereClause),
      this.getTimeOfDayDistribution(whereClause)
    ]);

    return {
      userEngagement,
      featureUsage,
      deviceBreakdown,
      timeOfDayDistribution,
      period: { startDate, endDate }
    };
  }

  async getUserEngagementMetrics(whereClause) {
    // Implementation for user engagement metrics
    return {
      averageSessionsPerUser: 0,
      averageActivitiesPerUser: 0,
      returnUserPercentage: 0
    };
  }

  async getFeatureUsageMetrics(whereClause) {
    return await activityService.prisma.activity.groupBy({
      by: ['type'],
      where: whereClause,
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } }
    }).then(results =>
      results.map(r => ({
        feature: r.type,
        usage: r._count._all
      }))
    );
  }

  async getDeviceBreakdown(whereClause) {
    const activities = await activityService.prisma.activity.findMany({
      where: whereClause,
      select: { deviceInfo: true }
    });

    const deviceCounts = { mobile: 0, desktop: 0, unknown: 0 };
    activities.forEach(activity => {
      if (activity.deviceInfo?.isMobile) {
        deviceCounts.mobile++;
      } else if (activity.deviceInfo?.isMobile === false) {
        deviceCounts.desktop++;
      } else {
        deviceCounts.unknown++;
      }
    });

    return deviceCounts;
  }

  async getTimeOfDayDistribution(whereClause) {
    // Simplified implementation - would need more sophisticated analysis
    return {
      morning: 0,    // 6-12
      afternoon: 0,  // 12-18
      evening: 0,    // 18-24
      night: 0       // 0-6
    };
  }
}

module.exports = new AnalyticsController();