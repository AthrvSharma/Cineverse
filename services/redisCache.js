const redis = require('redis');

let client;
const MOVIE_CACHE_KEY = 'cineverse:movies';

function isRedisReady() {
  return client && client.isReady;
}

async function initRedis() {
  if (isRedisReady()) {
    return client;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const tempClient = redis.createClient({
    url: redisUrl,
    socket: {
      // Limit retries so local dev doesn't get spammed when the host is unreachable
      reconnectStrategy: attempts => (attempts <= 3 ? Math.min(attempts * 200, 1000) : false)
    }
  });

  tempClient.on('error', err => {
    if (!tempClient.isReady) return;
    console.error('[Redis] Client Error', err);
  });

  try {
    await tempClient.connect();
    client = tempClient;
    console.log('[Redis] Connected to cache');
  } catch (err) {
    console.warn('[Redis] Unable to establish connection. Continuing without cache.', err.message);
    try {
      if (tempClient.isOpen) {
        await tempClient.disconnect();
      }
    } catch (_) {
      // Swallow disconnect errors; we're intentionally disabling redis when unavailable
    }
    client = null;
  }

  return client;
}

function getRedisClient() {
  return isRedisReady() ? client : null;
}

async function getCachedMovies() {
  const redisClient = getRedisClient();
  if (!redisClient) return null;
  const cached = await redisClient.get(MOVIE_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
}

async function setCachedMovies(movies) {
  const redisClient = getRedisClient();
  if (!redisClient) return;
  await redisClient.set(MOVIE_CACHE_KEY, JSON.stringify(movies), { EX: 60 });
}

async function invalidateMovieCache() {
  const redisClient = getRedisClient();
  if (!redisClient) return;
  await redisClient.del(MOVIE_CACHE_KEY);
}

async function cacheResponse(key, data, ttlSeconds = 120) {
  const redisClient = getRedisClient();
  if (!redisClient) return;
  await redisClient.set(key, JSON.stringify(data), { EX: ttlSeconds });
}

async function getCachedResponse(key) {
  const redisClient = getRedisClient();
  if (!redisClient) return null;
  const payload = await redisClient.get(key);
  return payload ? JSON.parse(payload) : null;
}

async function getCacheHealth() {
  const redisClient = getRedisClient();
  if (!redisClient) {
    return { status: 'offline' };
  }
  try {
    const info = await redisClient.info();
    return { status: 'online', info };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

module.exports = {
  initRedis,
  getRedisClient,
  getCachedMovies,
  setCachedMovies,
  invalidateMovieCache,
  cacheResponse,
  getCachedResponse,
  getCacheHealth,
  MOVIE_CACHE_KEY
};
