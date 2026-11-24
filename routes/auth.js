const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { isGuest } = require('../middleware/auth');

// GET /register
router.get('/register', isGuest, (req, res) => {
    res.render('register', { title: 'Create Account – SkyTour', formData: {} });
});

// POST /register
router.post('/register', isGuest, async (req, res) => {
    const { fullName, email, phone, password, confirmPassword } = req.body;
    const formData = { fullName, email, phone };

    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
        return res.render('register', {
            title: 'Create Account – SkyTour',
            error: 'Please fill in all fields.',
            formData
        });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render('register', {
            title: 'Create Account – SkyTour',
            error: 'Please enter a valid email address.',
            formData
        });
    }
    if (password.length < 6) {
        return res.render('register', {
            title: 'Create Account – SkyTour',
            error: 'Password must be at least 6 characters.',
            formData
        });
    }
    if (password !== confirmPassword) {
        return res.render('register', {
            title: 'Create Account – SkyTour',
            error: 'Passwords do not match.',
            formData
        });
    }

    try {
        const [existing] = await db.query('SELECT id FROM customers WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.render('register', {
                title: 'Create Account – SkyTour',
                error: 'An account with this email already exists.',
                formData
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO customers (full_name, email, phone, password) VALUES (?, ?, ?, ?)',
            [fullName, email, phone, hashedPassword]
        );
        req.session.success = '🎉 Account created! Welcome to SkyTour. Please log in.';
        res.redirect('/login');
    } catch (err) {
        console.error('Register error:', err);
        res.render('register', {
            title: 'Create Account – SkyTour',
            error: 'Registration failed. Please try again.',
            formData
        });
    }
});

// GET /login
router.get('/login', isGuest, (req, res) => {
    res.render('login', { title: 'Login – SkyTour' });
});

// POST /login
router.post('/login', isGuest, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', {
            title: 'Login – SkyTour',
            error: 'Please enter your email and password.'
        });
    }

    try {
        const [results] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
        if (results.length === 0) {
            return res.render('login', {
                title: 'Login – SkyTour',
                error: 'No account found with that email address.'
            });
        }

        const customer = results[0];
        const match = await bcrypt.compare(password, customer.password);
        if (!match) {
            return res.render('login', {
                title: 'Login – SkyTour',
                error: 'Incorrect password. Please try again.'
            });
        }

        // Store only safe fields in session
        req.session.user = {
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone
        };

        const returnTo = req.session.returnTo || '/dashboard';
        delete req.session.returnTo;
        res.redirect(returnTo);
    } catch (err) {
        console.error('Login error:', err);
        res.render('login', {
            title: 'Login – SkyTour',
            error: 'Login failed. Please try again.'
        });
    }
});

// GET /logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;
