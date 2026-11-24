const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /destinations — list all
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM destinations WHERE is_active = 1';
        let params = [];
        if (search) {
            query += ' AND (name LIKE ? OR country LIKE ?)';
            params = [`%${search}%`, `%${search}%`];
        }
        query += ' ORDER BY name';
        const [destinations] = await db.query(query, params);
        res.render('destinations', {
            title: 'Destinations – SkyTour',
            destinations,
            search: search || ''
        });
    } catch (err) {
        console.error('Destinations route error:', err);
        res.render('destinations', { title: 'Destinations – SkyTour', destinations: [], search: '' });
    }
});

// GET /destinations/:id — destination detail
router.get('/:id', async (req, res) => {
    try {
        const [dest] = await db.query('SELECT * FROM destinations WHERE id = ? AND is_active = 1', [req.params.id]);
        if (dest.length === 0) return res.redirect('/destinations');

        const destination = dest[0];
        const [packages] = await db.query(`
            SELECT p.*,
                   COALESCE(p.name, p.package_name) AS name,
                   COALESCE(p.package_name, p.name) AS package_name,
                   COALESCE(p.image_url, p.image, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80') AS image_url,
                   COALESCE(p.short_desc, SUBSTRING(p.description, 1, 100)) AS short_desc,
                   COALESCE(p.duration_days, 4) AS duration_days,
                   COALESCE(p.rating, 4.5) AS rating
            FROM packages p
            WHERE (p.destination_id = ? OR p.destination = ?) AND (p.is_available = 1 OR p.is_available IS NULL)
            ORDER BY p.price ASC
        `, [destination.id, destination.name]);

        res.render('destination-details', {
            title: `${destination.name} – SkyTour`,
            destination,
            packages
        });
    } catch (err) {
        console.error('Destination detail error:', err);
        res.redirect('/destinations');
    }
});

module.exports = router;
