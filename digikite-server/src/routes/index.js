const { Router } = require('express');
const { env } = require('../config/env');
const healthRoutes = require('./health');
const authRoutes = require('./auth');
const analyticsRoutes = require('./analytics');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);

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
      docs: `/api/${env.API_VERSION}/docs`, // For future API documentation
    },
  });
});

module.exports = router;