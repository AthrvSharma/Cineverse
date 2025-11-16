const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Movie = require('../models/Movie');   // <-- adjust path if needed
const User  = require('../models/User');    // <-- adjust path if needed

// If you already have these, import from your auth middleware file:
 // <-- adjust path
const { ensureAuthenticated, ensureAdmin } = require('../config/auth');

// --- Helpers ---
const isUrl = (s = '') => /^https?:\/\/.+/i.test(s);

// =========================
// Add Movie (Admin Only)
// =========================

// Show Add form
router.get('/add', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('add-movie', {
    editing: false,
    errors: []
  });
});

// Create Movie
router.post('/add', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const {
      title, poster, backdrop, genres,
      description, year, director, cast, rating, runtime
    } = req.body;

    const errors = [];

    if (!title || !poster || !backdrop || !genres || !description || !year || !director || !cast || !rating || !runtime) {
      errors.push({ msg: 'All fields are required.' });
    }
    if (!isUrl(poster))   errors.push({ msg: 'Poster must be a valid URL (http/https).' });
    if (!isUrl(backdrop)) errors.push({ msg: 'Backdrop must be a valid URL (http/https).' });

    if (errors.length) {
      return res.render('add-movie', {
        editing: false,
        errors,
        title, poster, backdrop, genres, description, year, director, cast, rating, runtime
      });
    }

    const movie = new Movie({
      title: title.trim(),
      poster: poster.trim(),
      backdrop: backdrop.trim(),
      genres: genres.split(',').map(s => s.trim()).filter(Boolean),
      description: description.trim(),
      year: Number(year),
      director: director.trim(),
      cast: cast.split(',').map(s => s.trim()).filter(Boolean),
      rating: rating.trim(),
      runtime: runtime.trim()
    });

    await movie.save();
    req.flash('success_msg', 'Movie added successfully!');
    res.redirect('/');
  } catch (err) {
    if (err && err.code === 11000) {
      req.flash('error_msg', 'A movie with that title already exists.');
      return res.redirect('/movies/add');
    }
    console.error('Add movie error:', err);
    req.flash('error_msg', 'Failed to add movie. Please try again.');
    res.redirect('/movies/add');
  }
});

// =========================
// Edit Movie (Admin Only)
// =========================

// Show Edit form (reuses add-movie.ejs)
router.get('/edit/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      req.flash('error_msg', 'Invalid movie id.');
      return res.redirect('/');
    }

    const m = await Movie.findById(id);
    if (!m) {
      req.flash('error_msg', 'Movie not found.');
      return res.redirect('/');
    }

    res.render('add-movie', {
      editing: true,
      errors: [],
      _id: m._id.toString(),
      title: m.title,
      poster: m.poster,
      backdrop: m.backdrop,
      genres: (m.genres || []).join(', '),
      description: m.description,
      year: m.year,
      director: m.director,
      cast: (m.cast || []).join(', '),
      rating: m.rating,
      runtime: m.runtime
    });
  } catch (err) {
    console.error('Load edit form error:', err);
    req.flash('error_msg', 'Failed to load edit form.');
    res.redirect('/');
  }
});

// Update Movie
router.post('/edit/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      req.flash('error_msg', 'Invalid movie id.');
      return res.redirect('/');
    }

    const {
      title, poster, backdrop, genres,
      description, year, director, cast, rating, runtime
    } = req.body;

    const update = {
      title: (title || '').trim(),
      poster: (poster || '').trim(),
      backdrop: (backdrop || '').trim(),
      genres: (genres || '').split(',').map(s => s.trim()).filter(Boolean),
      description: (description || '').trim(),
      year: Number(year),
      director: (director || '').trim(),
      cast: (cast || '').split(',').map(s => s.trim()).filter(Boolean),
      rating: (rating || '').trim(),
      runtime: (runtime || '').trim()
    };

    if (!isUrl(update.poster) || !isUrl(update.backdrop)) {
      req.flash('error_msg', 'Poster/Backdrop must be valid URLs.');
      return res.redirect(`/movies/edit/${id}`);
    }

    await Movie.findByIdAndUpdate(id, update, { runValidators: true });
    req.flash('success_msg', 'Movie updated successfully!');
    res.redirect('/');
  } catch (err) {
    if (err && err.code === 11000) {
      req.flash('error_msg', 'A movie with that title already exists.');
      return res.redirect(`/movies/edit/${req.params.id}`);
    }
    console.error('Update movie error:', err);
    req.flash('error_msg', 'Failed to update movie.');
    res.redirect(`/movies/edit/${req.params.id}`);
  }
});

// =========================
// Delete Movie (Admin Only)
// =========================

router.post('/delete/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      req.flash('error_msg', 'Invalid movie id.');
      return res.redirect('/');
    }

    await Movie.findByIdAndDelete(id);
    req.flash('success_msg', 'Movie deleted successfully!');
    res.redirect('/');
  } catch (err) {
    console.error('Delete movie error:', err);
    req.flash('error_msg', 'Failed to delete movie.');
    res.redirect('/');
  }
});

// =========================
// My List (User-specific)
// =========================

// Add to My List
router.post('/list/add', ensureAuthenticated, async (req, res) => {
  try {
    const { movieTitle } = req.body;
    if (!movieTitle) return res.status(400).json({ success: false, msg: 'movieTitle required' });

    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { myList: movieTitle } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Add to my list error:', err);
    res.status(500).json({ success: false });
  }
});

// Remove from My List
router.post('/list/remove', ensureAuthenticated, async (req, res) => {
  try {
    const { movieTitle } = req.body;
    if (!movieTitle) return res.status(400).json({ success: false, msg: 'movieTitle required' });

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { myList: movieTitle } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Remove from my list error:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
