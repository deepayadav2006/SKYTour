const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Home page
router.get('/home', async (req, res) => {
    try {
        const [destinations] = await db.query(
            'SELECT * FROM destinations WHERE is_active = 1 ORDER BY id LIMIT 8'
        );
        const [packages] = await db.query(`
            SELECT p.*,
                   COALESCE(p.name, p.package_name) AS name,
                   COALESCE(p.package_name, p.name) AS package_name,
                   COALESCE(d.name, p.destination, 'Popular Destination') AS destination_name,
                   COALESCE(p.destination, d.name, 'Popular Destination') AS destination,
                   COALESCE(p.image_url, p.image, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80') AS image_url,
                   COALESCE(p.short_desc, SUBSTRING(p.description, 1, 120), 'Experience an unforgettable journey with SkyTour.') AS short_desc,
                   COALESCE(p.category, 'adventure') AS category,
                   COALESCE(p.rating, 4.5) AS rating,
                   COALESCE(p.duration_days, 4) AS duration_days,
                   COALESCE(p.duration_nights, 3) AS duration_nights,
                   COALESCE(p.duration, CONCAT(COALESCE(p.duration_days, 4), ' Days / ', COALESCE(p.duration_nights, 3), ' Nights')) AS duration
            FROM packages p
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE (p.is_available = 1 OR p.is_available IS NULL)
            ORDER BY p.rating DESC, p.id ASC
            LIMIT 6
        `);
        res.render('home', {
            title: 'SkyTour – Discover the World. Create Memories.',
            destinations,
            packages
        });
    } catch (err) {
        console.error('Home route error:', err);
        res.render('home', { title: 'SkyTour', destinations: [], packages: [] });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', { title: 'About Us – SkyTour' });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us – SkyTour' });
});

// Contact form submission
router.post('/contact', async (req, res) => {
    const { name, email, phone, destination, message } = req.body;
    if (!name || !email || !message) {
        req.session.error = 'Please fill in all required fields (Name, Email, Message).';
        return res.redirect('/contact');
    }

    try {
        await db.query(`
            INSERT INTO contact_messages (name, email, phone, destination, message)
            VALUES (?, ?, ?, ?, ?)
        `, [name, email, phone || null, destination || null, message]);

        req.session.success = '🎉 Thank you for contacting SkyTour! Our team will reply to you within 24 hours.';
    } catch (err) {
        console.error('Contact submission error:', err);
        req.session.error = 'Could not submit your message. Please try again.';
    }
    res.redirect('/contact');
});

// Newsletter subscribe
router.post('/newsletter', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.redirect('/home#newsletter');
    try {
        await db.query(
            'INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)',
            [email]
        );
        req.session.success = '🎉 You are subscribed to our newsletter!';
    } catch (err) {
        req.session.error = 'Could not subscribe. Please try again.';
    }
    res.redirect('/home#newsletter');
});

module.exports = router;
