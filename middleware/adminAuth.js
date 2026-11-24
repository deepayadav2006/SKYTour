// Middleware: protect admin routes
function isAdmin(req, res, next) {
    if (req.session && req.session.admin) {
        return next();
    }
    res.redirect('/admin/login');
}

// Middleware: redirect logged-in admin away from login
function isAdminGuest(req, res, next) {
    if (req.session && req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    next();
}

module.exports = { isAdmin, isAdminGuest };
