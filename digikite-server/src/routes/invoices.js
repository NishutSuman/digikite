const { Router } = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken } = require('../middleware/auth/jwt');
const { adminOnly } = require('../middleware/auth/rbac');

const router = Router();

// All routes require authentication and admin access
router.use(authenticateToken);
router.use(adminOnly());

// Invoice management
router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/stats', invoiceController.getInvoiceStats);
router.get('/:id', invoiceController.getInvoiceById);
router.get('/:id/pdf', invoiceController.downloadInvoicePdf);
router.post('/:id/send', invoiceController.sendInvoice);
router.put('/:id/cancel', invoiceController.cancelInvoice);

module.exports = router;
