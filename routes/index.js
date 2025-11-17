const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const movieController = require('../controllers/movieController');

router.get('/', ensureAuthenticated, movieController.renderLandingPage);

module.exports = router;
