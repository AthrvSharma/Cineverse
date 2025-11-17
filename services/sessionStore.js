const { RedisStore } = require('connect-redis');
const { getRedisClient } = require('./redisCache');

function createSessionStore(session) {
  const client = getRedisClient();
  if (!client) {
    return undefined;
  }

  return new RedisStore({
    client,
    prefix: 'cineverse:sess:',
    ttl: 60 * 60 * 24
  });
}

module.exports = createSessionStore;
