function getPostgresPool() {
  // Movie catalog now lives in MongoDB Atlas. Postgres connections are intentionally disabled.
  return null;
}

async function getPostgresStatus() {
  return {
    engine: 'PostgreSQL',
    status: 'disabled',
    error: 'Movie catalog now served from MongoDB Atlas (collection: movies).'
  };
}

async function runRelationalHealthChecks() {
  const postgres = await getPostgresStatus();
  return { postgres };
}

module.exports = {
  getPostgresPool,
  getPostgresStatus,
  runRelationalHealthChecks
};
