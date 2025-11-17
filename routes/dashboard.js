const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/', ensureAuthenticated, dashboardController.renderDashboard);
router.get('/metrics', ensureAuthenticated, dashboardController.getDashboardMetrics);

module.exports = router;
