const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function hashMd5(value) {
  return crypto.createHash('md5').update(value).digest('hex');
}

function hashSha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function getTlsOptions() {
  if (process.env.ENABLE_TLS !== 'true') {
    return null;
  }
  const keyPath = process.env.TLS_KEY_PATH;
  const certPath = process.env.TLS_CERT_PATH;

  if (!keyPath || !certPath) {
    console.warn('[Security] TLS requested but TLS_KEY_PATH / TLS_CERT_PATH not set.');
    return null;
  }

  try {
    return {
      key: fs.readFileSync(path.resolve(keyPath)),
      cert: fs.readFileSync(path.resolve(certPath))
    };
  } catch (error) {
    console.error('[Security] Unable to load TLS certificates', error.message);
    return null;
  }
}

function applySecurityHeaders(app) {
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.ENABLE_TLS === 'true') {
      res.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }
    next();
  });
}

function getSecurityOverview() {
  const sample = 'cineverse-security-sample';
  return {
    md5: hashMd5(sample),
    sha256: hashSha256(sample),
    tlsEnabled: process.env.ENABLE_TLS === 'true',
    httpsRecommendation: 'Serve Express behind a TLS terminator or enable HTTPS certificates.'
  };
}

module.exports = {
  hashMd5,
  hashSha256,
  getTlsOptions,
  applySecurityHeaders,
  getSecurityOverview
};
