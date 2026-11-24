require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./config/database');
const seedDatabase = require('./config/seeder');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── View Engine ───────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files with guaranteed MIME types ────────────────
const staticOptions = {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        }
    }
};

app.use(express.static(path.join(__dirname, 'public'), staticOptions));
app.use('/public', express.static(path.join(__dirname, 'public'), staticOptions));
app.use('/css', express.static(path.join(__dirname, 'public', 'css'), staticOptions));
app.use('/js', express.static(path.join(__dirname, 'public', 'js'), staticOptions));
app.use('/images', express.static(path.join(__dirname, 'public', 'images'), staticOptions));

// ─── Body Parsers ──────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── Session ───────────────────────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET || 'skytour-secret-key-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// ─── Global Template Locals ────────────────────────────────
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null;
    res.locals.success = req.session.success || null;
    res.locals.error = req.session.error || null;
    res.locals.currentPath = req.path;
    // Clear flash messages after reading
    delete req.session.success;
    delete req.session.error;
    next();
});

// ─── Routes ────────────────────────────────────────────────
const homeRoutes        = require('./routes/home');
const authRoutes        = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const packageRoutes     = require('./routes/packages');
const bookingRoutes     = require('./routes/bookings');
const dashboardRoutes   = require('./routes/dashboard');
const adminRoutes       = require('./routes/admin');

app.use('/',             homeRoutes);
app.use('/',             authRoutes);
app.use('/destinations', destinationRoutes);
app.use('/packages',     packageRoutes);
app.use('/booking',      bookingRoutes);
app.use('/dashboard',    dashboardRoutes);
app.use('/admin',        adminRoutes);

// ─── Root Redirect ─────────────────────────────────────────
app.get('/', (req, res) => {
    res.redirect('/home');
});

// ─── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found – SkyTour' });
});

// ─── Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).render('error', {
        title: 'Server Error – SkyTour',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on our end.'
    });
});

// ─── Start Server & Run Seeder ──────────────────────────────
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, async () => {
        console.log(`\n=================================================`);
        console.log(`🚀 SkyTour server running at: http://localhost:${PORT}`);
        console.log(`👤 Admin dashboard:           http://localhost:${PORT}/admin`);
        console.log(`📧 Default Admin Account:     admin@skytour.com / Admin@123`);
        console.log(`=================================================\n`);

        // Run database seeder safely in background
        try {
            await seedDatabase(db);
        } catch (seederErr) {
            console.warn('⚠️ Seeder notice:', seederErr.message);
        }
    });
}

module.exports = app;
