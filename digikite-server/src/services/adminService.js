const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

class AdminService {
  // Get dashboard overview stats
  async getDashboardStats() {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      const [
        // Demo stats
        totalDemos,
        newDemos,
        demosThisMonth,
        demosLastMonth,

        // Client stats
        totalClients,
        activeClients,
        clientsThisMonth,

        // Subscription stats
        totalSubscriptions,
        activeSubscriptions,
        trialSubscriptions,

        // Revenue stats
        totalRevenue,
        revenueThisMonth,
        revenueLastMonth,

        // Recent activities
        recentDemos,
        recentPayments,
      ] = await Promise.all([
        // Demos
        prisma.demoRequest.count(),
        prisma.demoRequest.count({ where: { status: 'NEW' } }),
        prisma.demoRequest.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.demoRequest.count({
          where: {
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),

        // Clients
        prisma.clientOrganization.count(),
        prisma.clientOrganization.count({ where: { status: 'ACTIVE' } }),
        prisma.clientOrganization.count({ where: { createdAt: { gte: startOfMonth } } }),

        // Subscriptions
        prisma.subscription.count(),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.subscription.count({ where: { status: 'TRIAL' } }),

        // Revenue
        prisma.payment.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: 'SUCCESS',
            createdAt: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: 'SUCCESS',
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
          _sum: { amount: true },
        }),

        // Recent items
        prisma.demoRequest.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            organizationName: true,
            contactName: true,
            contactEmail: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.payment.findMany({
          where: { status: 'SUCCESS' },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            currency: true,
            createdAt: true,
            clientOrganization: {
              select: { name: true },
            },
          },
        }),
      ]);

      // Count converted demos (status = CONVERTED)
      const convertedDemos = await prisma.demoRequest.count({ where: { status: 'CONVERTED' } });

      return {
        // Flat structure for frontend compatibility
        totalClients: totalClients,
        activeClients: activeClients,
        activeSubscriptions: activeSubscriptions,
        trialSubscriptions: trialSubscriptions,
        pendingDemos: newDemos,
        totalDemos: totalDemos,
        convertedDemos: convertedDemos,
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: revenueThisMonth._sum.amount || 0,

        // Nested structure for detailed views
        demos: {
          total: totalDemos,
          new: newDemos,
          thisMonth: demosThisMonth,
          lastMonth: demosLastMonth,
          growth: demosLastMonth > 0
            ? (((demosThisMonth - demosLastMonth) / demosLastMonth) * 100).toFixed(1)
            : 0,
        },
        clients: {
          total: totalClients,
          active: activeClients,
          thisMonth: clientsThisMonth,
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          trial: trialSubscriptions,
        },
        revenue: {
          total: totalRevenue._sum.amount || 0,
          thisMonth: revenueThisMonth._sum.amount || 0,
          lastMonth: revenueLastMonth._sum.amount || 0,
          growth: revenueLastMonth._sum.amount > 0
            ? ((((revenueThisMonth._sum.amount || 0) - (revenueLastMonth._sum.amount || 0)) / revenueLastMonth._sum.amount) * 100).toFixed(1)
            : 0,
        },
        recent: {
          demos: recentDemos,
          payments: recentPayments,
        },
      };
    } catch (error) {
      logger.error('Failed to get dashboard stats', { error: error.message });
      throw error;
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(options = {}) {
    try {
      const { period = 'month', year = new Date().getFullYear() } = options;

      let groupBy;
      let dateFormat;

      if (period === 'month') {
        // Monthly revenue for the year
        const payments = await prisma.payment.findMany({
          where: {
            status: 'SUCCESS',
            createdAt: {
              gte: new Date(year, 0, 1),
              lt: new Date(year + 1, 0, 1),
            },
          },
          select: {
            amount: true,
            createdAt: true,
          },
        });

        // Group by month
        const monthlyRevenue = Array(12).fill(0);
        payments.forEach((payment) => {
          const month = payment.createdAt.getMonth();
          monthlyRevenue[month] += payment.amount;
        });

        return {
          period: 'monthly',
          year,
          data: monthlyRevenue.map((amount, index) => ({
            month: index + 1,
            monthName: new Date(year, index).toLocaleString('default', { month: 'short' }),
            revenue: amount,
          })),
          total: monthlyRevenue.reduce((a, b) => a + b, 0),
        };
      }

      // Default: return overall stats
      return this.getDashboardStats();
    } catch (error) {
      logger.error('Failed to get revenue analytics', { error: error.message });
      throw error;
    }
  }

  // Get all admin notifications
  async getNotifications(options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const skip = (page - 1) * limit;

      const where = {};
      if (unreadOnly) where.isRead = false;

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.adminNotification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.adminNotification.count({ where }),
        prisma.adminNotification.count({ where: { isRead: false } }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      };
    } catch (error) {
      logger.error('Failed to get notifications', { error: error.message });
      throw error;
    }
  }

  // Create admin notification
  async createNotification(type, title, message, data = null) {
    try {
      const notification = await prisma.adminNotification.create({
        data: {
          type,
          title,
          message,
          data,
        },
      });

      logger.info('Admin notification created', { id: notification.id, type });
      return notification;
    } catch (error) {
      logger.error('Failed to create notification', { error: error.message });
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationRead(id) {
    try {
      const notification = await prisma.adminNotification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return notification;
    } catch (error) {
      logger.error('Failed to mark notification as read', { error: error.message, id });
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllNotificationsRead() {
    try {
      await prisma.adminNotification.updateMany({
        where: { isRead: false },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to mark all notifications as read', { error: error.message });
      throw error;
    }
  }

  // Get all admin users
  async getAdminUsers() {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return users;
    } catch (error) {
      logger.error('Failed to get admin users', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AdminService();
