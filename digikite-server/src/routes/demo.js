const { Router } = require('express');
const demoController = require('../controllers/demoController');
const { authenticateToken } = require('../middleware/auth/jwt');
const { adminOnly } = require('../middleware/auth/rbac');

const router = Router();

// Public routes
router.post('/request', demoController.submitDemoRequest);

// Admin routes
router.get('/requests', authenticateToken, adminOnly(), demoController.getAllDemoRequests);
router.get('/requests/stats', authenticateToken, adminOnly(), demoController.getDemoStats);
router.get('/requests/:id', authenticateToken, adminOnly(), demoController.getDemoRequestById);
router.put('/requests/:id', authenticateToken, adminOnly(), demoController.updateDemoRequest);
router.put('/requests/:id/schedule', authenticateToken, adminOnly(), demoController.scheduleDemo);
router.put('/requests/:id/complete', authenticateToken, adminOnly(), demoController.completeDemo);

module.exports = router;
