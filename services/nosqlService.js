const mongoose = require('mongoose');
const { getCacheHealth } = require('./redisCache');

async function getMongoStats() {
  if (!mongoose.connection.readyState) {
    return { engine: 'MongoDB', status: 'disconnected' };
  }
  try {
    const stats = await mongoose.connection.db.stats();
    return { engine: 'MongoDB', status: 'online', stats };
  } catch (error) {
    return { engine: 'MongoDB', status: 'error', error: error.message };
  }
}

async function getRedisStats() {
  return { engine: 'Redis', ...(await getCacheHealth()) };
}

async function gatherNoSqlInsights() {
  const [mongo, redis] = await Promise.all([
    getMongoStats(),
    getRedisStats()
  ]);
  return { mongo, redis };
}

module.exports = {
  gatherNoSqlInsights
};
