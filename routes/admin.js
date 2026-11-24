const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { isAdmin, isAdminGuest } = require('../middleware/adminAuth');

// ─── Admin Auth ─────────────────────────────────────────────

// GET /admin or /admin/login
router.get('/', (req, res) => res.redirect('/admin/login'));

router.get('/login', isAdminGuest, (req, res) => {
    res.render('admin/login', { title: 'Admin Login – SkyTour', layout: false });
});

router.post('/login', isAdminGuest, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.render('admin/login', { title: 'Admin Login', error: 'Email and password required.', layout: false });
    }
    try {
        const [results] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (results.length === 0) {
            return res.render('admin/login', { title: 'Admin Login', error: 'Invalid admin credentials.', layout: false });
        }
        const admin = results[0];
        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.render('admin/login', { title: 'Admin Login', error: 'Invalid admin credentials.', layout: false });
        }
        req.session.admin = { id: admin.id, full_name: admin.full_name, email: admin.email, role: admin.role };
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Admin login error:', err);
        res.render('admin/login', { title: 'Admin Login', error: 'Login failed. Please try again.', layout: false });
    }
});

router.get('/logout', (req, res) => {
    req.session.admin = null;
    res.redirect('/admin/login');
});

// ─── Admin Dashboard ────────────────────────────────────────

router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const [[{ totalCustomers }]] = await db.query('SELECT COUNT(*) AS totalCustomers FROM customers');
        const [[{ totalBookings }]]  = await db.query('SELECT COUNT(*) AS totalBookings FROM bookings');
        const [[{ pending }]]        = await db.query("SELECT COUNT(*) AS pending FROM bookings WHERE LOWER(status)='pending'");
        const [[{ confirmed }]]      = await db.query("SELECT COUNT(*) AS confirmed FROM bookings WHERE LOWER(status)='confirmed'");
        const [[{ completed }]]      = await db.query("SELECT COUNT(*) AS completed FROM bookings WHERE LOWER(status)='completed'");
        const [[{ cancelled }]]      = await db.query("SELECT COUNT(*) AS cancelled FROM bookings WHERE LOWER(status)='cancelled'");
        const [[{ totalPackages }]]  = await db.query('SELECT COUNT(*) AS totalPackages FROM packages');
        const [[{ totalDests }]]     = await db.query('SELECT COUNT(*) AS totalDests FROM destinations');
        const [[{ totalRevenue }]]   = await db.query("SELECT COALESCE(SUM(total_price),0) AS totalRevenue FROM bookings WHERE LOWER(status) IN ('confirmed','completed')");

        // Recent bookings
        const [recentBookings] = await db.query(`
            SELECT b.*,
                   COALESCE(b.booking_ref, CONCAT('SKY', b.id)) AS booking_ref,
                   COALESCE(b.customer_name, b.traveler_name, c.full_name, 'Guest') AS customer_name,
                   COALESCE(p.name, p.package_name, 'Tour Package') AS package_name,
                   COALESCE(d.name, p.destination, b.destination, 'Popular Destination') AS destination_name,
                   COALESCE(b.total_price, 0) AS total_price,
                   COALESCE(b.num_travelers, b.travelers, 1) AS num_travelers
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN packages p ON b.package_id = p.id
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            ORDER BY b.created_at DESC LIMIT 8
        `);

        res.render('admin/dashboard', {
            title: 'Admin Dashboard – SkyTour',
            stats: { totalCustomers, totalBookings, pending, confirmed, completed, cancelled, totalPackages, totalDests, totalRevenue },
            recentBookings
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        res.render('admin/dashboard', { title: 'Admin Dashboard', stats: {}, recentBookings: [] });
    }
});

// ─── Booking Management ─────────────────────────────────────

router.get('/bookings', isAdmin, async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = `
            SELECT b.*,
                   COALESCE(b.booking_ref, CONCAT('SKY', b.id)) AS booking_ref,
                   COALESCE(b.traveler_name, b.customer_name, c.full_name, 'Guest') AS traveler_name,
                   COALESCE(b.traveler_email, b.email, c.email, '') AS traveler_email,
                   COALESCE(b.traveler_phone, b.phone, c.phone, '') AS traveler_phone,
                   COALESCE(p.name, p.package_name, 'Tour Package') AS package_name,
                   COALESCE(d.name, p.destination, b.destination, 'Popular Destination') AS destination_name,
                   COALESCE(b.total_price, 0) AS total_price,
                   COALESCE(b.num_travelers, b.travelers, 1) AS num_travelers
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN packages p ON b.package_id = p.id
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE 1=1
        `;
        const params = [];
        if (status && ['pending','confirmed','cancelled','completed'].includes(status.toLowerCase())) {
            query += ' AND LOWER(b.status) = ?';
            params.push(status.toLowerCase());
        }
        if (search) {
            query += ' AND (b.booking_ref LIKE ? OR b.customer_name LIKE ? OR b.traveler_name LIKE ? OR b.email LIKE ? OR b.traveler_email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        query += ' ORDER BY b.created_at DESC';
        const [bookings] = await db.query(query, params);
        res.render('admin/bookings', { title: 'Bookings – Admin', bookings, filters: { status, search } });
    } catch (err) {
        console.error('Admin bookings error:', err);
        res.render('admin/bookings', { title: 'Bookings – Admin', bookings: [], filters: {} });
    }
});

router.post('/bookings/:id/status', isAdmin, async (req, res) => {
    const { status, payment_status } = req.body;
    const allowedStatus = ['pending', 'confirmed', 'cancelled', 'completed'];
    const allowedPayment = ['paid', 'pending', 'refunded', 'failed'];

    let updates = [];
    let params = [];
    if (status && allowedStatus.includes(status.toLowerCase())) {
        updates.push('status = ?');
        params.push(status.toLowerCase());
    }
    if (payment_status && allowedPayment.includes(payment_status.toLowerCase())) {
        updates.push('payment_status = ?');
        params.push(payment_status.toLowerCase());
    }
    if (updates.length > 0) {
        params.push(req.params.id);
        await db.query(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`, params);
        req.session.success = 'Booking details updated successfully.';
    }
    res.redirect('/admin/bookings');
});

// ─── Customer Management ────────────────────────────────────

router.get('/customers', isAdmin, async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT c.*,
                   COALESCE(c.full_name, c.name, 'Customer') AS full_name,
                   COUNT(b.id) AS total_bookings
            FROM customers c
            LEFT JOIN bookings b ON (c.id = b.customer_id OR c.email = b.email)
            WHERE 1=1
        `;
        const params = [];
        if (search) {
            query += ' AND (c.full_name LIKE ? OR c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        query += ' GROUP BY c.id ORDER BY c.created_at DESC';
        const [customers] = await db.query(query, params);
        res.render('admin/customers', { title: 'Customers – Admin', customers, search: search || '' });
    } catch (err) {
        console.error('Admin customers error:', err);
        res.render('admin/customers', { title: 'Customers – Admin', customers: [], search: '' });
    }
});

router.get('/customers/:id', isAdmin, async (req, res) => {
    try {
        const [cust] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        if (cust.length === 0) return res.redirect('/admin/customers');
        const customer = cust[0];
        customer.full_name = customer.full_name || customer.name || 'Customer';

        const [bookings] = await db.query(`
            SELECT b.*,
                   COALESCE(b.booking_ref, CONCAT('SKY', b.id)) AS booking_ref,
                   COALESCE(p.name, p.package_name, 'Tour Package') AS package_name,
                   COALESCE(d.name, p.destination, b.destination, 'Popular Destination') AS destination_name,
                   COALESCE(b.total_price, 0) AS total_price,
                   COALESCE(b.num_travelers, b.travelers, 1) AS num_travelers
            FROM bookings b
            LEFT JOIN packages p ON b.package_id = p.id
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE b.customer_id = ? OR b.email = ?
            ORDER BY b.created_at DESC
        `, [customer.id, customer.email]);

        res.render('admin/customer-detail', {
            title: `${customer.full_name} – Admin`, customer, bookings
        });
    } catch (err) {
        console.error('Admin customer detail error:', err);
        res.redirect('/admin/customers');
    }
});

// ─── Package Management ─────────────────────────────────────

router.get('/packages', isAdmin, async (req, res) => {
    try {
        const [packages] = await db.query(`
            SELECT p.*,
                   COALESCE(p.name, p.package_name) AS name,
                   COALESCE(d.name, p.destination, 'Popular Destination') AS destination_name,
                   COALESCE(p.image_url, p.image) AS image_url,
                   COALESCE(p.duration_days, 4) AS duration_days,
                   COALESCE(p.duration_nights, 3) AS duration_nights,
                   COALESCE(p.category, 'adventure') AS category,
                   COALESCE(p.rating, 4.5) AS rating
            FROM packages p
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            ORDER BY p.id DESC
        `);
        res.render('admin/packages', { title: 'Packages – Admin', packages });
    } catch (err) {
        console.error('Admin packages error:', err);
        res.render('admin/packages', { title: 'Packages – Admin', packages: [] });
    }
});

router.get('/packages/add', isAdmin, async (req, res) => {
    const [destinations] = await db.query('SELECT id, name FROM destinations WHERE is_active=1 ORDER BY name');
    res.render('admin/package-form', { title: 'Add Package – Admin', pkg: {}, destinations, isEdit: false });
});

router.post('/packages/add', isAdmin, async (req, res) => {
    const { destination_id, name, description, short_desc, price, duration_days, duration_nights,
            image_url, included, excluded, rating, max_travelers, category, is_available } = req.body;

    try {
        // Find destination name
        let destName = 'Popular Destination';
        if (destination_id) {
            const [d] = await db.query('SELECT name FROM destinations WHERE id = ?', [destination_id]);
            if (d.length > 0) destName = d[0].name;
        }

        const days = parseInt(duration_days) || 4;
        const nights = parseInt(duration_nights) || 3;
        const durationStr = `${days} Days / ${nights} Nights`;

        await db.query(`
            INSERT INTO packages
            (package_name, name, destination, destination_id,
             duration, duration_days, duration_nights, price,
             description, short_desc, image, image_url,
             included, excluded, rating, max_travelers, category, is_available)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
            name, name, destName, destination_id || null,
            durationStr, days, nights, parseFloat(price) || 0,
            description, short_desc || description.substring(0, 150),
            image_url, image_url,
            included, excluded, parseFloat(rating) || 4.5,
            parseInt(max_travelers) || 20, category || 'adventure',
            is_available ? 1 : 0
        ]);
        req.session.success = 'Tour package created successfully!';
        res.redirect('/admin/packages');
    } catch (err) {
        console.error('Add package error:', err);
        req.session.error = 'Failed to add package.';
        res.redirect('/admin/packages/add');
    }
});

router.get('/packages/edit/:id', isAdmin, async (req, res) => {
    try {
        const [pkgs] = await db.query(`
            SELECT p.*,
                   COALESCE(p.name, p.package_name) AS name,
                   COALESCE(p.image_url, p.image) AS image_url,
                   COALESCE(p.duration_days, 4) AS duration_days,
                   COALESCE(p.duration_nights, 3) AS duration_nights
            FROM packages p WHERE p.id = ?
        `, [req.params.id]);

        if (pkgs.length === 0) return res.redirect('/admin/packages');
        const [destinations] = await db.query('SELECT id, name FROM destinations WHERE is_active=1 ORDER BY name');
        res.render('admin/package-form', {
            title: 'Edit Package – Admin', pkg: pkgs[0], destinations, isEdit: true
        });
    } catch (err) {
        console.error('Edit package error:', err);
        res.redirect('/admin/packages');
    }
});

router.post('/packages/edit/:id', isAdmin, async (req, res) => {
    const { destination_id, name, description, short_desc, price, duration_days, duration_nights,
            image_url, included, excluded, rating, max_travelers, category, is_available } = req.body;
    try {
        let destName = 'Popular Destination';
        if (destination_id) {
            const [d] = await db.query('SELECT name FROM destinations WHERE id = ?', [destination_id]);
            if (d.length > 0) destName = d[0].name;
        }

        const days = parseInt(duration_days) || 4;
        const nights = parseInt(duration_nights) || 3;
        const durationStr = `${days} Days / ${nights} Nights`;

        await db.query(`
            UPDATE packages SET
                package_name=?, name=?, destination=?, destination_id=?,
                duration=?, duration_days=?, duration_nights=?, price=?,
                description=?, short_desc=?, image=?, image_url=?,
                included=?, excluded=?, rating=?, max_travelers=?, category=?, is_available=?
            WHERE id=?
        `, [
            name, name, destName, destination_id || null,
            durationStr, days, nights, parseFloat(price) || 0,
            description, short_desc, image_url, image_url,
            included, excluded, parseFloat(rating) || 4.5,
            parseInt(max_travelers) || 20, category,
            is_available ? 1 : 0, req.params.id
        ]);
        req.session.success = 'Package updated successfully!';
        res.redirect('/admin/packages');
    } catch (err) {
        console.error('Update package error:', err);
        req.session.error = 'Failed to update package.';
        res.redirect(`/admin/packages/edit/${req.params.id}`);
    }
});

router.post('/packages/delete/:id', isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM packages WHERE id = ?', [req.params.id]);
        req.session.success = 'Package deleted successfully.';
    } catch (err) {
        console.error('Delete package error:', err);
        req.session.error = 'Cannot delete package. It may be referenced in existing bookings.';
    }
    res.redirect('/admin/packages');
});

// ─── Destination Management ─────────────────────────────────

router.get('/destinations', isAdmin, async (req, res) => {
    try {
        const [destinations] = await db.query('SELECT * FROM destinations ORDER BY name');
        res.render('admin/destinations', { title: 'Destinations – Admin', destinations });
    } catch (err) {
        console.error('Admin destinations error:', err);
        res.render('admin/destinations', { title: 'Destinations – Admin', destinations: [] });
    }
});

router.get('/destinations/add', isAdmin, (req, res) => {
    res.render('admin/destination-form', { title: 'Add Destination – Admin', dest: {}, isEdit: false });
});

router.post('/destinations/add', isAdmin, async (req, res) => {
    const { name, country, description, short_desc, image_url, best_time, climate, language, currency } = req.body;
    try {
        await db.query(`
            INSERT INTO destinations (name, country, description, short_desc, image_url, best_time, climate, language, currency)
            VALUES (?,?,?,?,?,?,?,?,?)
        `, [name, country, description, short_desc, image_url, best_time, climate, language, currency]);
        req.session.success = 'Destination added successfully!';
        res.redirect('/admin/destinations');
    } catch (err) {
        console.error('Add destination error:', err);
        req.session.error = 'Failed to add destination.';
        res.redirect('/admin/destinations/add');
    }
});

router.get('/destinations/edit/:id', isAdmin, async (req, res) => {
    try {
        const [dests] = await db.query('SELECT * FROM destinations WHERE id = ?', [req.params.id]);
        if (dests.length === 0) return res.redirect('/admin/destinations');
        res.render('admin/destination-form', { title: 'Edit Destination – Admin', dest: dests[0], isEdit: true });
    } catch (err) {
        console.error('Edit destination error:', err);
        res.redirect('/admin/destinations');
    }
});

router.post('/destinations/edit/:id', isAdmin, async (req, res) => {
    const { name, country, description, short_desc, image_url, best_time, climate, language, currency, is_active } = req.body;
    try {
        await db.query(`
            UPDATE destinations SET
                name=?, country=?, description=?, short_desc=?, image_url=?,
                best_time=?, climate=?, language=?, currency=?, is_active=?
            WHERE id=?
        `, [name, country, description, short_desc, image_url, best_time, climate, language, currency,
            is_active ? 1 : 0, req.params.id]);
        req.session.success = 'Destination updated successfully!';
        res.redirect('/admin/destinations');
    } catch (err) {
        console.error('Update destination error:', err);
        req.session.error = 'Failed to update destination.';
        res.redirect('/admin/destinations');
    }
});

router.post('/destinations/delete/:id', isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM destinations WHERE id = ?', [req.params.id]);
        req.session.success = 'Destination deleted successfully.';
    } catch (err) {
        console.error('Delete destination error:', err);
        req.session.error = 'Cannot delete destination. Linked packages exist.';
    }
    res.redirect('/admin/destinations');
});

module.exports = router;
