const { Pool } = require('pg');

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

let pgPool;
let loggedSslFallback = { pg: false };

function isLocalHost(hostname = '') {
  return LOCAL_HOSTS.has(hostname.replace(/[\[\]]/g, '').toLowerCase());
}

function resolvePostgresSsl(connectionString) {
  const rawSetting = (process.env.POSTGRES_SSL || '').toLowerCase();
  let hostname;
  try {
    hostname = new URL(connectionString).hostname;
  } catch (err) {
    hostname = '';
  }
  const local = isLocalHost(hostname);
  if (rawSetting === 'true' && local && !loggedSslFallback.pg) {
    loggedSslFallback.pg = true;
    console.warn('[PostgreSQL] SSL was requested but host appears local; continuing without SSL.');
  }

  if (rawSetting === 'true' && !local) {
    return { rejectUnauthorized: false };
  }
  if (rawSetting === 'false') {
    return undefined;
  }
  if (!local) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

function getPostgresPool() {
  if (!process.env.POSTGRES_URL) {
    return null;
  }
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: resolvePostgresSsl(process.env.POSTGRES_URL)
    });
  }
  return pgPool;
}

async function getPostgresStatus() {
  const pool = getPostgresPool();
  if (!pool) {
    return { engine: 'PostgreSQL', status: 'disabled' };
  }
  try {
    const { rows } = await pool.query('SELECT NOW() as now');
    return { engine: 'PostgreSQL', status: 'online', timestamp: rows[0].now };
  } catch (error) {
    return { engine: 'PostgreSQL', status: 'error', error: error.message };
  }
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
