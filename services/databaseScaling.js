const { ensureMovieStore } = require('../models/Movie');

async function ensureMovieIndexes() {
  try {
    const mongo = await ensureMovieStore();
    return { status: 'applied', mongo };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function getShardingGuidance() {
  return {
    status: 'documented',
    steps: [
      'Keep the MongoDB Atlas movie catalog in a single cluster with predictable shard keys (e.g., platform or release decade) once scale requires it.',
      'Co-locate users and movies in the same Atlas project to reduce cross-region latency.',
      'Use Redis pub/sub strictly for fan-out while MongoDB holds the canonical catalog.'
    ]
  };
}

function getReplicationGuidance() {
  return {
    status: 'documented',
    steps: [
      'Enable MongoDB Atlas multi-region replicas for both users and movies to keep logins and catalog reads resilient.',
      'Promote Redis replicas for read scaling and configure Sentinel-style failover.',
      'Regularly run `atlas deployments watch` or monitoring dashboards to validate replication health.'
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
