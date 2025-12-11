const { Router } = require('express');
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth/jwt');
const { adminOnly } = require('../middleware/auth/rbac');

const router = Router();

// Public endpoint - submit contact form
router.post('/submit', contactController.submitContactForm);

// Admin endpoints
router.get('/', authenticateToken, adminOnly(), contactController.getContactSubmissions);
router.put('/:id', authenticateToken, adminOnly(), contactController.updateContactSubmission);

module.exports = router;
