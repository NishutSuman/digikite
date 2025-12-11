const { Router } = require('express');
const clientController = require('../controllers/clientController');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth/jwt');
const { adminOnly } = require('../middleware/auth/rbac');

const router = Router();

// All routes require authentication and admin access
router.use(authenticateToken);
router.use(adminOnly());

// Client CRUD
router.post('/', clientController.createClient);
router.get('/', clientController.getAllClients);
router.get('/stats', clientController.getClientStats);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);

// Client admin management
router.post('/:id/admins', clientController.createClientAdmin);

// Guild integration
router.post('/:id/provision', clientController.provisionGuild);
router.get('/:id/guild-stats', clientController.getGuildStats);

// Client subscriptions
router.post('/:clientId/subscription', subscriptionController.createSubscription);

module.exports = router;
