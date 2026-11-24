// Middleware: protect customer routes
function isLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
}

// Middleware: redirect logged-in customers away from login/register
function isGuest(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
}

module.exports = { isLoggedIn, isGuest };
