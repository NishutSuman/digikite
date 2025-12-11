const adminService = require('../services/adminService');
const guildIntegrationService = require('../services/guildIntegrationService');
const subscriptionReminderService = require('../services/subscriptionReminderService');
const { logger } = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

class AdminController {
  // Get dashboard overview
  async getDashboard(req, res) {
    try {
      const stats = await adminService.getDashboardStats();

      return successResponse(res, 'Dashboard stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get dashboard stats', { error: error.message });
      return errorResponse(res, 'Failed to get dashboard stats', 500);
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(req, res) {
    try {
      const { period, year } = req.query;

      const analytics = await adminService.getRevenueAnalytics({
        period,
        year: year ? parseInt(year) : new Date().getFullYear(),
      });

      return successResponse(res, 'Revenue analytics retrieved successfully', analytics);
    } catch (error) {
      logger.error('Failed to get revenue analytics', { error: error.message });
      return errorResponse(res, 'Failed to get revenue analytics', 500);
    }
  }

  // Get notifications
  async getNotifications(req, res) {
    try {
      const { page, limit, unreadOnly } = req.query;

      const result = await adminService.getNotifications({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        unreadOnly: unreadOnly === 'true',
      });

      return successResponse(res, 'Notifications retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get notifications', { error: error.message });
      return errorResponse(res, 'Failed to get notifications', 500);
    }
  }

  // Mark notification as read
  async markNotificationRead(req, res) {
    try {
      const { id } = req.params;

      const notification = await adminService.markNotificationRead(id);

      return successResponse(res, 'Notification marked as read', notification);
    } catch (error) {
      logger.error('Failed to mark notification as read', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to mark notification as read', 500);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsRead(req, res) {
    try {
      await adminService.markAllNotificationsRead();

      return successResponse(res, 'All notifications marked as read');
    } catch (error) {
      logger.error('Failed to mark all notifications as read', { error: error.message });
      return errorResponse(res, 'Failed to mark all notifications as read', 500);
    }
  }

  // Get admin users
  async getAdminUsers(req, res) {
    try {
      const users = await adminService.getAdminUsers();

      return successResponse(res, 'Admin users retrieved successfully', users);
    } catch (error) {
      logger.error('Failed to get admin users', { error: error.message });
      return errorResponse(res, 'Failed to get admin users', 500);
    }
  }

  // Get Guild integration health
  async getGuildHealth(req, res) {
    try {
      const health = await guildIntegrationService.healthCheck();

      return successResponse(res, 'Guild health check completed', health);
    } catch (error) {
      logger.error('Failed to check Guild health', { error: error.message });
      return errorResponse(res, 'Failed to check Guild health', 500);
    }
  }

  // Get Guild dashboard stats (aggregate from all clients)
  async getGuildDashboard(req, res) {
    try {
      const stats = await guildIntegrationService.getDashboardStats();

      return successResponse(res, 'Guild dashboard stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get Guild dashboard stats', { error: error.message });
      return errorResponse(res, 'Failed to get Guild dashboard stats', 500);
    }
  }

  // Trigger subscription reminders manually (super admin only)
  async triggerSubscriptionReminders(req, res) {
    try {
      const result = await subscriptionReminderService.runAllReminders();

      return successResponse(res, 'Subscription reminders triggered successfully', result);
    } catch (error) {
      logger.error('Failed to trigger subscription reminders', { error: error.message });
      return errorResponse(res, 'Failed to trigger subscription reminders', 500);
    }
  }
}

module.exports = new AdminController();
