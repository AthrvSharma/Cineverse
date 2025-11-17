const { getRedisClient } = require('../services/redisCache');

function rateLimiterRedis({ windowInSeconds = 60, allowedHits = 20, prefix = 'rate-limit' } = {}) {
  return async (req, res, next) => {
    const client = getRedisClient();
    if (!client) {
      return next();
    }

    try {
      const identifier = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
      const key = `${prefix}:${identifier}`;

      const tx = client.multi();
      tx.incr(key);
      tx.expire(key, windowInSeconds);

      const [requestCount] = await tx.exec();
      const count = Array.isArray(requestCount) ? requestCount[1] : requestCount;

      if (count > allowedHits) {
        return res.status(429).json({ message: 'Slow down. Please retry shortly.' });
      }

      return next();
    } catch (error) {
      console.warn('[RateLimiter] Falling back due to redis error', error.message);
      return next();
    }
  };
}

module.exports = rateLimiterRedis;
