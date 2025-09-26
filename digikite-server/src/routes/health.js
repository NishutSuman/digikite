const { Router } = require('express');
const { ResponseUtil } = require('../utils/response');
const { prisma } = require('../config/database');
const { env } = require('../config/env');

const router = Router();

router.get('/', async (req, res) => {
  const startTime = Date.now();
  let dbConnected = false;
  let dbResponseTime = 0;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
    dbResponseTime = Date.now() - startTime;
  } catch (error) {
    dbConnected = false;
  }

  const memoryUsage = process.memoryUsage();
  const healthData = {
    status: dbConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    database: {
      connected: dbConnected,
      responseTime: dbResponseTime,
    },
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      usage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`,
    },
  };

  const statusCode = healthData.status === 'healthy' ? 200 : 503;
  return ResponseUtil.success(res, healthData, 'Health check completed', statusCode);
});

router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ResponseUtil.success(res, { ready: true }, 'Service is ready');
  } catch (error) {
    return ResponseUtil.error(res, 'Service is not ready', 503);
  }
});

router.get('/live', (req, res) => {
  return ResponseUtil.success(res, { alive: true }, 'Service is alive');
});

module.exports = router;