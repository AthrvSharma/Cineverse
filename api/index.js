const mongoose = require('mongoose');
const app = require('../app');
const { initRedis } = require('../services/redisCache');
const { MongoURI } = require('../config/keys');
const { ensureMovieIndexes } = require('../services/databaseScaling');

// Initialize Redis
initRedis().catch(err => console.error('[Redis] Init Error:', err));

// Connect to MongoDB
mongoose
  .connect(MongoURI)
  .then(async () => {
    console.log('MongoDB Connected via api/index.js...');
    await ensureMovieIndexes();
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

/*
NOTE: The original WebSocket implementation from server.js has been removed.
Standard WebSockets are not supported in Vercel's default serverless environment
as the functions are not long-running processes. To restore real-time features,
you will need to migrate to a service designed for serverless WebSockets,
such as Pusher, Ably, or Vercel's own offerings.
*/

// Export the Express app for Vercel
module.exports = app;
