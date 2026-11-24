const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { isLoggedIn } = require('../middleware/auth');

// GET /dashboard
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const userEmail = req.session.user.email;

        const [bookings] = await db.query(`
            SELECT b.*,
                   COALESCE(p.name, p.package_name, 'Tour Package') AS package_name,
                   COALESCE(p.image_url, p.image, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80') AS package_image,
                   COALESCE(d.name, p.destination, b.destination, 'Popular Destination') AS destination_name,
                   COALESCE(b.total_price, 0) AS total_price,
                   COALESCE(b.num_travelers, b.travelers, 1) AS num_travelers,
                   COALESCE(b.booking_ref, CONCAT('SKY', b.id)) AS booking_ref
            FROM bookings b
            LEFT JOIN packages p ON b.package_id = p.id
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE b.customer_id = ? OR b.email = ?
            ORDER BY b.created_at DESC
            LIMIT 5
        `, [userId, userEmail]);

        const [statsResult] = await db.query(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN LOWER(status) = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
                SUM(CASE WHEN LOWER(status) = 'completed' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN LOWER(status) = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
            FROM bookings
            WHERE customer_id = ? OR email = ?
        `, [userId, userEmail]);

        // Upcoming trips
        const [upcoming] = await db.query(`
            SELECT b.*,
                   COALESCE(p.name, p.package_name, 'Tour Package') AS package_name,
                   COALESCE(d.name, p.destination, b.destination, 'Popular Destination') AS destination_name
            FROM bookings b
            LEFT JOIN packages p ON b.package_id = p.id
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE (b.customer_id = ? OR b.email = ?)
              AND b.travel_date >= CURDATE()
              AND LOWER(b.status) IN ('pending','confirmed')
            ORDER BY b.travel_date ASC
            LIMIT 3
        `, [userId, userEmail]);

        res.render('dashboard', {
            title: 'My Dashboard – SkyTour',
            bookings,
            stats: statsResult[0] || {},
            upcoming
        });
    } catch (err) {
        console.error('Dashboard route error:', err);
        res.render('dashboard', { title: 'Dashboard', bookings: [], stats: {}, upcoming: [] });
    }
});

// GET /dashboard/bookings
router.get('/bookings', isLoggedIn, async (req, res) => {
    try {
        const { status } = req.query;
        const userId = req.session.user.id;
        const userEmail = req.session.user.email;

        let query = `
            SELECT b.*,
                   COALESCE(p.name, p.package_name, 'Tour Package') AS package_name,
                   COALESCE(p.image_url, p.image, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80') AS package_image,
                   COALESCE(d.name, p.destination, b.destination, 'Popular Destination') AS destination_name,
                   COALESCE(p.duration_days, 4) AS duration_days,
                   COALESCE(p.duration_nights, 3) AS duration_nights,
                   COALESCE(b.total_price, 0) AS total_price,
                   COALESCE(b.num_travelers, b.travelers, 1) AS num_travelers,
                   COALESCE(b.booking_ref, CONCAT('SKY', b.id)) AS booking_ref
            FROM bookings b
            LEFT JOIN packages p ON b.package_id = p.id
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE (b.customer_id = ? OR b.email = ?)
        `;
        const params = [userId, userEmail];

        if (status && ['pending','confirmed','cancelled','completed'].includes(status.toLowerCase())) {
            query += ' AND LOWER(b.status) = ?';
            params.push(status.toLowerCase());
        }
        query += ' ORDER BY b.created_at DESC';

        const [bookings] = await db.query(query, params);
        res.render('my-bookings', {
            title: 'My Bookings – SkyTour',
            bookings,
            filterStatus: status || ''
        });
    } catch (err) {
        console.error('My bookings error:', err);
        res.render('my-bookings', { title: 'My Bookings', bookings: [], filterStatus: '' });
    }
});

// GET /dashboard/profile
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const [results] = await db.query(
            'SELECT * FROM customers WHERE id = ? OR email = ?',
            [req.session.user.id, req.session.user.email]
        );
        res.render('profile', {
            title: 'My Profile – SkyTour',
            customer: results[0] || req.session.user
        });
    } catch (err) {
        res.redirect('/dashboard');
    }
});

// POST /dashboard/profile — update profile
router.post('/profile', isLoggedIn, async (req, res) => {
    const { fullName, phone } = req.body;
    if (!fullName || !phone) {
        req.session.error = 'Name and phone are required.';
        return res.redirect('/dashboard/profile');
    }
    try {
        await db.query(`
            UPDATE customers SET
                full_name = ?,
                name = ?,
                phone = ?
            WHERE id = ? OR email = ?
        `, [fullName, fullName, phone, req.session.user.id, req.session.user.email]);

        // Update session
        req.session.user.full_name = fullName;
        req.session.user.phone = phone;
        req.session.success = 'Profile updated successfully!';
        res.redirect('/dashboard/profile');
    } catch (err) {
        req.session.error = 'Could not update profile.';
        res.redirect('/dashboard/profile');
    }
});

// POST /dashboard/change-password
router.post('/change-password', isLoggedIn, async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        req.session.error = 'All password fields are required.';
        return res.redirect('/dashboard/profile');
    }
    if (newPassword.length < 6) {
        req.session.error = 'New password must be at least 6 characters.';
        return res.redirect('/dashboard/profile');
    }
    if (newPassword !== confirmNewPassword) {
        req.session.error = 'New passwords do not match.';
        return res.redirect('/dashboard/profile');
    }

    try {
        const [results] = await db.query(
            'SELECT password FROM customers WHERE id = ? OR email = ?',
            [req.session.user.id, req.session.user.email]
        );
        if (results.length === 0) {
            req.session.error = 'Customer account not found.';
            return res.redirect('/dashboard/profile');
        }

        const match = await bcrypt.compare(currentPassword, results[0].password);
        if (!match) {
            req.session.error = 'Current password is incorrect.';
            return res.redirect('/dashboard/profile');
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query(
            'UPDATE customers SET password = ? WHERE id = ? OR email = ?',
            [hashed, req.session.user.id, req.session.user.email]
        );
        req.session.success = 'Password changed successfully!';
        res.redirect('/dashboard/profile');
    } catch (err) {
        req.session.error = 'Could not change password.';
        res.redirect('/dashboard/profile');
    }
});

module.exports = router;
