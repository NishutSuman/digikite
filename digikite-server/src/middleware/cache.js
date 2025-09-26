const NodeCache = require('node-cache');
const { logger } = require('../utils/logger');

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes in seconds
  checkperiod: 60, // Check for expired keys every 60 seconds
  deleteOnExpire: true,
  useClones: false,
  maxKeys: 1000 // Maximum number of keys
});

// Cache middleware for GET requests
const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query parameters
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Check if cached data exists
      const cachedData = cache.get(key);

      if (cachedData) {
        logger.info('Cache hit', { key, url: req.url });
        return res.json(cachedData);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(key, data, ttl);
          logger.info('Data cached', { key, ttl, url: req.url });
        }

        // Call original json method
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', error);
      next();
    }
  };
};

// Clear cache by pattern
const clearCache = (pattern) => {
  try {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.includes(pattern));

    keysToDelete.forEach(key => {
      cache.del(key);
    });

    logger.info('Cache cleared', { pattern, deletedKeys: keysToDelete.length });
    return keysToDelete.length;
  } catch (error) {
    logger.error('Clear cache error', error);
    return 0;
  }
};

// Clear all cache
const clearAllCache = () => {
  try {
    const keys = cache.keys();
    cache.flushAll();
    logger.info('All cache cleared', { clearedKeys: keys.length });
    return keys.length;
  } catch (error) {
    logger.error('Clear all cache error', error);
    return 0;
  }
};

// Get cache statistics
const getCacheStats = () => {
  return {
    keys: cache.getStats().keys,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

// Cache for user sessions (longer TTL)
const userCache = new NodeCache({
  stdTTL: 1800, // 30 minutes
  checkperiod: 120,
  deleteOnExpire: true,
  useClones: false,
  maxKeys: 500
});

// Set user cache
const setUserCache = (userId, data, ttl = 1800) => {
  try {
    const key = `user:${userId}`;
    userCache.set(key, data, ttl);
    logger.info('User data cached', { userId, ttl });
  } catch (error) {
    logger.error('Set user cache error', error);
  }
};

// Get user cache
const getUserCache = (userId) => {
  try {
    const key = `user:${userId}`;
    const data = userCache.get(key);
    if (data) {
      logger.info('User cache hit', { userId });
    }
    return data;
  } catch (error) {
    logger.error('Get user cache error', error);
    return null;
  }
};

// Clear user cache
const clearUserCache = (userId) => {
  try {
    const key = `user:${userId}`;
    const deleted = userCache.del(key);
    logger.info('User cache cleared', { userId, deleted });
    return deleted;
  } catch (error) {
    logger.error('Clear user cache error', error);
    return false;
  }
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearAllCache,
  getCacheStats,
  setUserCache,
  getUserCache,
  clearUserCache
};