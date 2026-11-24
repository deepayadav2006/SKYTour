const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /packages — list all with search, filter, and sort
router.get('/', async (req, res) => {
    try {
        const { destination, min_price, max_price, category, sort } = req.query;

        let query = `
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
                   COALESCE(p.duration, CONCAT(COALESCE(p.duration_days, 4), ' Days / ', COALESCE(p.duration_nights, 3), ' Nights')) AS duration,
                   COALESCE(p.max_travelers, 20) AS max_travelers
            FROM packages p
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE (p.is_available = 1 OR p.is_available IS NULL)
        `;
        let params = [];

        if (destination) {
            query += ' AND (p.destination_id = ? OR p.destination = ? OR d.name = ?)';
            params.push(destination, destination, destination);
        }
        if (min_price) {
            query += ' AND p.price >= ?';
            params.push(parseFloat(min_price));
        }
        if (max_price) {
            query += ' AND p.price <= ?';
            params.push(parseFloat(max_price));
        }
        if (category) {
            query += ' AND (p.category = ? OR p.category LIKE ?)';
            params.push(category, `%${category}%`);
        }

        const sortMap = {
            'price_asc':  'p.price ASC',
            'price_desc': 'p.price DESC',
            'rating':     'p.rating DESC',
            'duration':   'p.duration_days ASC'
        };
        query += ' ORDER BY ' + (sortMap[sort] || 'p.rating DESC, p.id ASC');

        const [packages] = await db.query(query, params);
        const [destinations] = await db.query('SELECT id, name FROM destinations WHERE is_active = 1 ORDER BY name');

        res.render('packages', {
            title: 'Tour Packages – SkyTour',
            packages,
            destinations,
            filters: { destination, min_price, max_price, category, sort }
        });
    } catch (err) {
        console.error('Packages route error:', err);
        res.render('packages', { title: 'Tour Packages – SkyTour', packages: [], destinations: [], filters: {} });
    }
});

// GET /packages/:id — package detail
router.get('/:id', async (req, res) => {
    try {
        const [pkgResult] = await db.query(`
            SELECT p.*,
                   COALESCE(p.name, p.package_name) AS name,
                   COALESCE(p.package_name, p.name) AS package_name,
                   COALESCE(d.name, p.destination, 'Popular Destination') AS destination_name,
                   COALESCE(p.destination, d.name, 'Popular Destination') AS destination,
                   COALESCE(d.country, '') AS country,
                   COALESCE(p.image_url, p.image, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80') AS image_url,
                   COALESCE(d.image_url, p.image_url, p.image) AS dest_image,
                   COALESCE(p.category, 'adventure') AS category,
                   COALESCE(p.rating, 4.5) AS rating,
                   COALESCE(p.duration_days, 4) AS duration_days,
                   COALESCE(p.duration_nights, 3) AS duration_nights,
                   COALESCE(p.duration, CONCAT(COALESCE(p.duration_days, 4), ' Days / ', COALESCE(p.duration_nights, 3), ' Nights')) AS duration,
                   COALESCE(p.max_travelers, 20) AS max_travelers
            FROM packages p
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE p.id = ?
        `, [req.params.id]);

        if (pkgResult.length === 0) return res.redirect('/packages');

        const pkg = pkgResult[0];
        pkg.included_list = pkg.included ? pkg.included.split('|') : [
            'Hotel accommodation',
            'Daily breakfast',
            'Airport and city transfers',
            'Sightseeing excursions',
            'Local guide support'
        ];
        pkg.excluded_list = pkg.excluded ? pkg.excluded.split('|') : [
            'Flight tickets',
            'Lunch and dinner (unless specified)',
            'Personal expenses and shopping',
            'Travel insurance'
        ];

        // Related packages
        const [related] = await db.query(`
            SELECT p.*,
                   COALESCE(p.name, p.package_name) AS name,
                   COALESCE(d.name, p.destination) AS destination_name,
                   COALESCE(p.image_url, p.image) AS image_url,
                   COALESCE(p.category, 'adventure') AS category,
                   COALESCE(p.rating, 4.5) AS rating
            FROM packages p
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE (p.destination = ? OR p.destination_id = ? OR d.name = ?) AND p.id != ?
            LIMIT 3
        `, [pkg.destination, pkg.destination_id || 0, pkg.destination_name, pkg.id]);

        res.render('package-details', {
            title: `${pkg.name} – SkyTour`,
            pkg,
            related
        });
    } catch (err) {
        console.error('Package detail error:', err);
        res.redirect('/packages');
    }
});

module.exports = router;
