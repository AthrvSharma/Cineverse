const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin, ensureSubscribed } = require('../config/auth');
const movieController = require('../controllers/movieController');
const { PLAN_CONFIG } = require('../config/plans');

router.get('/', ensureAuthenticated, ensureSubscribed, movieController.renderLandingPage);
router.get('/platform/:platform', ensureAuthenticated, ensureSubscribed, movieController.renderLandingPage);
router.get('/platform/:platform/catalog', ensureAuthenticated, ensureSubscribed, movieController.renderPlatformGrid);
router.get('/admin/films', ensureAuthenticated, ensureAdmin, movieController.renderAdminFilms);

router.get('/subscribe', ensureAuthenticated, (req, res) => {
  res.render('subscribe', {
    plans: Object.values(PLAN_CONFIG),
    currentPlan: req.user ? req.user.subscriptionPlan : null,
    canManagePlan: Boolean(req.user && req.user.subscriptionPlan),
    upiHandle: process.env.UPI_HANDLE || 'sharmaathrv389@oksbi'
  });
});

router.post('/subscribe', ensureAuthenticated, async (req, res) => {
  try {
    const { plan } = req.body;
    const planConfig = PLAN_CONFIG[plan];
    if (!planConfig) {
      req.flash('error_msg', 'Please choose a plan to continue.');
      return res.redirect('/subscribe');
    }
    req.user.subscriptionPlan = planConfig.id;
    req.user.subscriptionPlatforms = planConfig.platforms;
    req.user.subscribedAt = new Date();
    await req.user.save();
    req.login(req.user, (err) => {
      if (err) {
        console.error('Login error after subscription:', err);
        req.flash('error_msg', 'Subscription saved but session error. Please log in again.');
        return res.redirect('/users/login');
      }
      req.flash('success_msg', `You are now on the ${planConfig.name} plan.`);
      res.redirect('/');
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    req.flash('error_msg', 'Unable to save your subscription. Please try again.');
    res.redirect('/subscribe');
  }
});

module.exports = router;
