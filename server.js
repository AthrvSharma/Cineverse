require('dotenv').config();
const http = require('http');
const https = require('https');
const mongoose = require('mongoose');
const { initRedis } = require('./services/redisCache');
const { getTlsOptions } = require('./services/securityService');
const { initSocketServer } = require('./sockets');
const { ensureMovieIndexes } = require('./services/databaseScaling');
const app = require('./app');

// Suppress deprecation warnings
process.noDeprecation = true;

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize shared services
initRedis().catch(err => console.error('Redis init error:', err));

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(async () => {
    console.log('MongoDB Connected...');
    await ensureMovieIndexes();
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 3000;
const tlsOptions = getTlsOptions();
const server = tlsOptions ? https.createServer(tlsOptions, app) : http.createServer(app);

initSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT} ${tlsOptions ? '(HTTPS)' : '(HTTP)'}`);
});
