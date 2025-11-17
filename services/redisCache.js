const redis = require('redis');

let client;
const MOVIE_CACHE_KEY = 'cineverse:movies';

async function initRedis() {
  if (client) {
    return client;
  }

  client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  });

  client.on('error', err => {
    console.error('[Redis] Client Error', err);
  });

  await client.connect().catch(err => {
    console.warn('[Redis] Unable to establish connection. Continuing without cache.', err.message);
  });

  return client;
}

function getRedisClient() {
  return client;
}

async function getCachedMovies() {
  if (!client) return null;
  const cached = await client.get(MOVIE_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
}

async function setCachedMovies(movies) {
  if (!client) return;
  await client.set(MOVIE_CACHE_KEY, JSON.stringify(movies), { EX: 60 });
}

async function invalidateMovieCache() {
  if (!client) return;
  await client.del(MOVIE_CACHE_KEY);
}

async function cacheResponse(key, data, ttlSeconds = 120) {
  if (!client) return;
  await client.set(key, JSON.stringify(data), { EX: ttlSeconds });
}

async function getCachedResponse(key) {
  if (!client) return null;
  const payload = await client.get(key);
  return payload ? JSON.parse(payload) : null;
}

async function getCacheHealth() {
  if (!client) {
    return { status: 'offline' };
  }
  try {
    const info = await client.info();
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
