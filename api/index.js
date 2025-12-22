const app = require('../app');
const { initMongo } = require('../models/Movie');
const { initRedis } = require('../services/redisCache');

// Initialize database and cache connections.
// In a serverless environment, these might be re-established on cold starts.
initMongo().catch(err => console.error('Mongo init error:', err));
initRedis().catch(err => console.error('Redis init error:', err));

/*
NOTE: The original WebSocket implementation from server.js has been removed.
Standard WebSockets are not supported in Vercel's default serverless environment
as the functions are not long-running processes. To restore real-time features,
you will need to migrate to a service designed for serverless WebSockets,
such as Pusher, Ably, or Vercel's own offerings.
*/

// Export the Express app for Vercel
module.exports = app;
