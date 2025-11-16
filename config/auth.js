module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/users/login');
    },
    ensureAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.isAdmin) {
            return next();
        }
        req.flash('error_msg', 'You do not have permission to view that resource');
        res.redirect('/');
    }
};

