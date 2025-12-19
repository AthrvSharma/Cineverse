const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { Types } = require('mongoose');
const movieStore = require('../models/Movie');
const User  = require('../models/User');
const movieController = require('../controllers/movieController');
const { ensureAuthenticated, ensureAdmin } = require('../config/auth');
const { adjustWatchlistCount, recordTrailerView } = require('../services/engagementService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// --- Helpers ---
const isUrl = (s = '') => /^https?:\/\/.+/i.test(s);
const isValidId = value => Types.ObjectId.isValid(String(value));

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
      description, year, director, cast, rating, runtime, trailerUrl, platform
    } = req.body;

    const errors = [];

    if (!title || !poster || !backdrop || !genres || !description || !year || !director || !cast || !rating || !runtime) {
      errors.push({ msg: 'All fields are required.' });
    }
    if (!isUrl(poster))   errors.push({ msg: 'Poster must be a valid URL (http/https).' });
    if (!isUrl(backdrop)) errors.push({ msg: 'Backdrop must be a valid URL (http/https).' });
    if (trailerUrl && !isUrl(trailerUrl)) errors.push({ msg: 'Trailer must be a valid URL (YouTube embed, Vimeo embed, or MP4).' });

    if (errors.length) {
      return res.render('add-movie', {
        editing: false,
        errors,
        title, poster, backdrop, genres, description, year, director, cast, rating, runtime, trailerUrl, platform
      });
    }

    const moviePayload = {
      title: title.trim(),
      poster: poster.trim(),
      backdrop: backdrop.trim(),
      genres: genres.split(',').map(s => s.trim()).filter(Boolean),
      description: description.trim(),
      year: Number(year),
      director: director.trim(),
      cast: cast.split(',').map(s => s.trim()).filter(Boolean),
      rating: Number(rating),
      runtime: runtime.trim(),
      trailerUrl: (trailerUrl || '').trim(),
      platform: (platform || '').trim() || 'Featured'
    };

    await movieController.createMovie(moviePayload);
    req.flash('success_msg', 'Movie added successfully!');
    res.redirect('/');
  } catch (err) {
    if (err && (err.code === 11000 || err.code === '23505')) {
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
    if (!isValidId(id)) {
      req.flash('error_msg', 'Invalid movie id.');
      return res.redirect('/');
    }

    const m = await movieStore.findMovieById(id);
    if (!m) {
      req.flash('error_msg', 'Movie not found.');
      return res.redirect('/');
    }

    const normalizedId = m._id || m.id;
    res.render('add-movie', {
      editing: true,
      errors: [],
      _id: normalizedId ? normalizedId.toString() : '',
      title: m.title,
      poster: m.poster,
      backdrop: m.backdrop,
      genres: (m.genres || []).join(', '),
      description: m.description,
      year: m.year,
      director: m.director,
      cast: (m.cast || []).join(', '),
      rating: m.rating,
      runtime: m.runtime,
      trailerUrl: m.trailerUrl || '',
      platform: m.platform || 'Featured'
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
    if (!isValidId(id)) {
      req.flash('error_msg', 'Invalid movie id.');
      return res.redirect('/');
    }

    const {
      title, poster, backdrop, genres,
      description, year, director, cast, rating, runtime, trailerUrl, platform
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
      rating: Number(rating),
      runtime: (runtime || '').trim(),
      trailerUrl: (trailerUrl || '').trim(),
      platform: (platform || '').trim() || 'Featured'
    };

    if (!isUrl(update.poster) || !isUrl(update.backdrop)) {
      req.flash('error_msg', 'Poster/Backdrop must be valid URLs.');
      return res.redirect(`/movies/edit/${id}`);
    }
    if (update.trailerUrl && !isUrl(update.trailerUrl)) {
      req.flash('error_msg', 'Trailer must be a valid URL (YouTube embed, Vimeo embed, or MP4).');
      return res.redirect(`/movies/edit/${id}`);
    }

    await movieController.updateMovie(id, update);
    req.flash('success_msg', 'Movie updated successfully!');
    res.redirect('/');
  } catch (err) {
    if (err && (err.code === 11000 || err.code === '23505')) {
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
    if (!isValidId(id)) {
      req.flash('error_msg', 'Invalid movie id.');
      return res.redirect('/');
    }

    await movieController.deleteMovie(id);
    req.flash('success_msg', 'Movie deleted successfully!');
    res.redirect('/');
  } catch (err) {
    console.error('Delete movie error:', err);
    req.flash('error_msg', 'Failed to delete movie.');
    res.redirect('/');
  }
});

// =========================
// Bulk Upload (Admin Only)
// =========================

router.post('/bulk-upload', ensureAuthenticated, ensureAdmin, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error_msg', 'Please attach a CSV file.');
      return res.redirect('back');
    }
    const csv = req.file.buffer.toString('utf8');
    const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
    if (!rows.length) {
      req.flash('error_msg', 'CSV appears empty.');
      return res.redirect('back');
    }
    const movies = rows
      .map(row => {
        const normalized = Object.keys(row).reduce((acc, key) => {
          acc[key.trim().toLowerCase()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
          return acc;
        }, {});
        const title = normalized.title;
        const poster = normalized.poster;
        const backdrop = normalized.backdrop;
        const genres = (normalized.genres || '')
          .split(/[,|]/)
          .map(item => item.trim())
          .filter(Boolean);
        const cast = (normalized.cast || normalized.cast_members || '')
          .split(/[,|]/)
          .map(item => item.trim())
          .filter(Boolean);
        if (!title || !poster || !backdrop) {
          return null;
        }
        return {
          title,
          poster,
          backdrop,
          genres,
          description: normalized.description || 'No description provided.',
          year: Number(normalized.year) || new Date().getFullYear(),
          director: normalized.director || 'Unknown',
          cast,
          rating: Number(normalized.rating || normalized.score || 0) || 0,
          runtime: normalized.runtime || '—',
          trailerUrl: normalized.trailer_url || normalized.trailer || '',
          platform: normalized.platform || normalized.service || 'Featured'
        };
      })
      .filter(Boolean);

    if (!movies.length) {
      req.flash('error_msg', 'No valid rows were detected in the CSV.');
      return res.redirect('back');
    }

    const inserted = await movieController.createMoviesBulk(movies);
    req.flash('success_msg', `Bulk upload complete. Added ${inserted.length} new movies.`);
    res.redirect('back');
  } catch (error) {
    console.error('Bulk upload error:', error);
    req.flash('error_msg', 'Failed to import CSV file.');
    res.redirect('back');
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

    const result = await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { myList: movieTitle } }
    );
    if (result.modifiedCount) {
      await adjustWatchlistCount(movieTitle, 1);
    }

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

    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { myList: movieTitle } }
    );
    if (result.modifiedCount) {
      await adjustWatchlistCount(movieTitle, -1);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Remove from my list error:', err);
    res.status(500).json({ success: false });
  }
});

router.post('/engagement/trailer', ensureAuthenticated, async (req, res) => {
  try {
    const { movieTitle } = req.body;
    if (!movieTitle) return res.status(400).json({ success: false, msg: 'movieTitle required' });
    await recordTrailerView(movieTitle, { userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    console.error('Trailer engagement error:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
