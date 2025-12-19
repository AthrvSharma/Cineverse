function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to view that resource');
  return res.redirect('/users/login');
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  req.flash('error_msg', 'You do not have permission to view that resource');
  return res.redirect('/');
}

function ensureSubscribed(req, res, next) {
  if (!req.user || req.user.isAdmin) {
    return next();
  }
  if (req.user.subscriptionPlan && Array.isArray(req.user.subscriptionPlatforms) && req.user.subscriptionPlatforms.length) {
    return next();
  }
  return res.redirect('/subscribe');
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  ensureSubscribed
};
