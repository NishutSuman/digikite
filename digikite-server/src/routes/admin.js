const { Router } = require('express');
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth/jwt');
const { adminOnly, superAdminOnly } = require('../middleware/auth/rbac');

const router = Router();

// All routes require authentication and admin access
router.use(authenticateToken);
router.use(adminOnly());

// Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/revenue', adminController.getRevenueAnalytics);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.put('/notifications/:id/read', adminController.markNotificationRead);
router.put('/notifications/read-all', adminController.markAllNotificationsRead);

// Admin users (super admin only)
router.get('/users', superAdminOnly(), adminController.getAdminUsers);

// Guild integration
router.get('/guild/health', adminController.getGuildHealth);
router.get('/guild/dashboard', adminController.getGuildDashboard);

// Subscription reminders (super admin only)
router.post('/reminders/trigger', superAdminOnly(), adminController.triggerSubscriptionReminders);

module.exports = router;
