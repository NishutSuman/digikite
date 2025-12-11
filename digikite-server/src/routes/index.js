const { Router } = require('express');
const { env } = require('../config/env');
const healthRoutes = require('./health');
const authRoutes = require('./auth');
const analyticsRoutes = require('./analytics');
const demoRoutes = require('./demo');
const clientRoutes = require('./clients');
const subscriptionRoutes = require('./subscriptions');
const adminRoutes = require('./admin');
const clientPortalRoutes = require('./clientPortal');
const paymentRoutes = require('./payments');
const invoiceRoutes = require('./invoices');
const contactRoutes = require('./contact');

const router = Router();

// Core routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);

// B2B Management routes
router.use('/demo', demoRoutes);
router.use('/clients', clientRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/contact', contactRoutes);

// Client Portal routes
router.use('/my', clientPortalRoutes);

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Digikite Infomatrix Technology API',
    version: env.API_VERSION,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: `/api/${env.API_VERSION}/health`,
      auth: `/api/${env.API_VERSION}/auth`,
      analytics: `/api/${env.API_VERSION}/analytics`,
      demo: `/api/${env.API_VERSION}/demo`,
      clients: `/api/${env.API_VERSION}/clients`,
      subscriptions: `/api/${env.API_VERSION}/subscriptions`,
      payments: `/api/${env.API_VERSION}/payments`,
      invoices: `/api/${env.API_VERSION}/invoices`,
      admin: `/api/${env.API_VERSION}/admin`,
      clientPortal: `/api/${env.API_VERSION}/my`,
      docs: `/api/${env.API_VERSION}/docs`,
    },
  });
});

module.exports = router;
