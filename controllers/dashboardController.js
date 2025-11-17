const { getMovieAnalytics } = require('./movieController');
const { runRelationalHealthChecks } = require('../services/relationalService');
const { gatherNoSqlInsights } = require('../services/nosqlService');
const { collectScalingInsights } = require('../services/databaseScaling');
const { getSecurityOverview } = require('../services/securityService');
const eventBus = require('../sockets/eventBus');

async function renderDashboard(req, res) {
  res.render('dashboard', { user: req.user });
}

async function getDashboardMetrics(req, res) {
  try {
    const [movieMetrics, relational, nosql, scaling, security] = await Promise.all([
      getMovieAnalytics(),
      runRelationalHealthChecks(),
      gatherNoSqlInsights(),
      collectScalingInsights(),
      Promise.resolve(getSecurityOverview())
    ]);

    const payload = {
      movieMetrics,
      relational,
      nosql,
      scaling,
      security
    };

    eventBus.emit('dashboard:metrics', payload);
    res.json(payload);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ message: 'Unable to build dashboard metrics', error: error.message });
  }
}

module.exports = {
  renderDashboard,
  getDashboardMetrics
};
