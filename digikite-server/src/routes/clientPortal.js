const { Router } = require('express');
const clientPortalController = require('../controllers/clientPortalController');
const { authenticateToken } = require('../middleware/auth/jwt');
const { userPortalAccess } = require('../middleware/auth/rbac');

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// User portal routes (for USER role)
// Admin can also access these routes to help users
router.get('/dashboard', userPortalAccess(), clientPortalController.getDashboard);
router.get('/organization', userPortalAccess(), clientPortalController.getMyOrganization);
router.get('/subscription', userPortalAccess(), clientPortalController.getMySubscription);
router.get('/invoices', userPortalAccess(), clientPortalController.getMyInvoices);
router.get('/payments', userPortalAccess(), clientPortalController.getMyPayments);
router.get('/guild', userPortalAccess(), clientPortalController.getGuildAccess);
router.get('/guild/stats', userPortalAccess(), clientPortalController.getMyGuildStats);

// Payment endpoints for subscription
router.post('/subscription/renew', userPortalAccess(), clientPortalController.initiateRenewalPayment);

module.exports = router;
