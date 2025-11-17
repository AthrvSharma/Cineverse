const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authJwt = require('../middlewares/authJwt');
const rateLimiterRedis = require('../middlewares/rateLimiterRedis');
const { issueToken } = require('../services/jwtService');
const movieController = require('../controllers/movieController');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.post('/auth/login', rateLimiterRedis({ prefix: 'api-login', windowInSeconds: 60, allowedHits: 10 }), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = issueToken(user);
  res.json({ token, expiresIn: '1h' });
});

router.get('/movies', authJwt(), async (req, res) => {
  const movies = await movieController.fetchMovies();
  res.json({ movies });
});

router.get('/movies/analytics', authJwt(true), async (req, res) => {
  const movieMetrics = await movieController.getMovieAnalytics();
  res.json(movieMetrics);
});

router.get('/system/insights', authJwt(true), dashboardController.getDashboardMetrics);

module.exports = router;
