const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureSubscribed } = require('../config/auth');
const movieController = require('../controllers/movieController');
const { getPersonalizedRecommendations, getConversationalSuggestions } = require('../services/aiRecommender');

router.get('/personalized', ensureAuthenticated, ensureSubscribed, async (req, res) => {
  try {
    const movies = await movieController.fetchMovies();
    const { scopedMovies } = movieController.scopeMoviesForUser(req.user, movies);
    const recommendations = await getPersonalizedRecommendations({
      user: req.user,
      movies: scopedMovies,
      limit: 8
    });
    res.json({ recommendations });
  } catch (error) {
    console.error('AI personalized endpoint error:', error);
    res.status(500).json({ message: 'Unable to build AI recommendations' });
  }
});

router.post('/chat', ensureAuthenticated, ensureSubscribed, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: 'Please describe what you want to watch.' });
    }
    const movies = await movieController.fetchMovies();
    const { scopedMovies } = movieController.scopeMoviesForUser(req.user, movies);
    const payload = await getConversationalSuggestions(prompt, {
      movies: scopedMovies,
      limit: 5,
      user: req.user
    });
    res.json(payload);
  } catch (error) {
    console.error('AI chat endpoint error:', error);
    res.status(500).json({ message: 'Unable to process your prompt.' });
  }
});

module.exports = router;
