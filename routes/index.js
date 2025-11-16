const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Movie = require('../models/Movie');

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    // lean() returns plain objects (faster) and includes _id
    const movieDocs = await Movie.find({}).lean();

    // Map to include _id and all the fields you already use
    const movies = movieDocs.map(m => ({
      _id: m._id.toString(),
      title: m.title,
      poster: m.poster,
      backdrop: m.backdrop,
      genres: m.genres,
      description: m.description,
      year: m.year,
      director: m.director,
      cast: m.cast,
      rating: m.rating,
      runtime: m.runtime
    }));

    // Keyed-by-title object (what index.ejs expects)
    const movieObject = movies.reduce((acc, m) => {
      acc[m.title] = m;
      return acc;
    }, {});

    res.render('index', { movies: movieObject, user: req.user });
  } catch (err) {
    console.error('Error fetching movies from database:', err);
    req.flash('error_msg', 'Could not load movies.');
    res.render('index', { movies: {}, user: req.user });
  }
});

module.exports = router;
