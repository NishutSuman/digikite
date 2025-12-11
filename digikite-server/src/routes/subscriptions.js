const { Router } = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth/jwt');
const { adminOnly, superAdminOnly } = require('../middleware/auth/rbac');

const router = Router();

// Public route - get active plans for pricing page
router.get('/plans', subscriptionController.getPlans);

// Admin routes
router.get('/plans/all', authenticateToken, adminOnly(), subscriptionController.getAllPlans);
router.get('/plans/:id', authenticateToken, adminOnly(), subscriptionController.getPlanById);
router.post('/plans', authenticateToken, superAdminOnly(), subscriptionController.createPlan);
router.put('/plans/:id', authenticateToken, superAdminOnly(), subscriptionController.updatePlan);

// Subscription management (admin)
router.get('/', authenticateToken, adminOnly(), subscriptionController.getAllSubscriptions);
router.get('/stats', authenticateToken, adminOnly(), subscriptionController.getSubscriptionStats);
router.get('/expiring', authenticateToken, adminOnly(), subscriptionController.getExpiringSubscriptions);
router.get('/:id', authenticateToken, adminOnly(), subscriptionController.getSubscriptionById);
router.put('/:id/activate', authenticateToken, adminOnly(), subscriptionController.activateSubscription);
router.put('/:id/renew', authenticateToken, adminOnly(), subscriptionController.renewSubscription);
router.put('/:id/cancel', authenticateToken, adminOnly(), subscriptionController.cancelSubscription);

module.exports = router;
