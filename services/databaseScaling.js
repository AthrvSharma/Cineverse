const { ensureMovieStore } = require('../models/Movie');

async function ensureMovieIndexes() {
  try {
    const postgres = await ensureMovieStore();
    return { status: 'applied', postgres };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function getShardingGuidance() {
  return {
    status: 'documented',
    steps: [
      'Partition the PostgreSQL movie catalog by release decade for fast range scans.',
      'Keep MongoDB Atlas login data on its own cluster with per-tenant shard keys.',
      'Leverage Redis pub/sub for low-latency fan-out while Postgres handles canonical film data.'
    ]
  };
}

function getReplicationGuidance() {
  return {
    status: 'documented',
    steps: [
      'Promote MongoDB Atlas multi-region replicas for login resilience.',
      'Enable PostgreSQL streaming replication with hot standbys for the movie catalog.',
      'Create Redis replica for read scaling and Sentinel for failover.'
    ]
  };
}

async function collectScalingInsights() {
  const [indexes, sharding, replication] = await Promise.all([
    ensureMovieIndexes(),
    getShardingGuidance(),
    getReplicationGuidance()
  ]);

  return {
    indexes,
    sharding,
    replication
  };
}

module.exports = {
  ensureMovieIndexes,
  collectScalingInsights
};
