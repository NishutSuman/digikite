const { Router } = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken, optionalAuth } = require('../middleware/auth/jwt');
const { adminOnly } = require('../middleware/auth/rbac');

const router = Router();

// Public webhook endpoint (no auth required, Razorpay calls this)
router.post('/webhook', paymentController.webhook);

// Public lookup endpoint (for prefilling organization form on retry)
router.get('/lookup-organization', paymentController.lookupOrganization);

// Self-service checkout (optional auth - user may or may not be logged in)
router.post('/checkout', optionalAuth, paymentController.initiateCheckout);

// Payment verification (optional auth - called after Razorpay redirect)
router.post('/verify-checkout', optionalAuth, paymentController.verifyPayment);

// Protected routes
router.use(authenticateToken);

// Payment initiation (admin only)
router.post('/create-order', adminOnly(), paymentController.createOrder);
router.post('/verify', adminOnly(), paymentController.verifyPayment);
router.post('/failure', adminOnly(), paymentController.handleFailure);

// Admin only routes
router.get('/', adminOnly(), paymentController.getAllPayments);
router.get('/stats', adminOnly(), paymentController.getPaymentStats);
router.get('/:id', adminOnly(), paymentController.getPaymentById);

module.exports = router;
