const Redis = require('ioredis');
const { Redis: UpstashRedis } = require('@upstash/redis');

let client;
const MOVIE_CACHE_KEY = 'cineverse:movies';

function isRedisReady() {
  return client && client.status === 'ready';
}

async function initRedis() {
  if (isRedisReady()) {
    return client;
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Use Upstash Redis for serverless
    client = new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('[Upstash Redis] Connected to cache');
  } else {
    // Use regular Redis for local
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    client = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    client.on('error', err => {
      console.error('[Redis] Client Error', err);
    });

    client.on('connect', () => {
      console.log('[Redis] Connected to cache');
    });
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
