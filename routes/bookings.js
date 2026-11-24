const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isLoggedIn } = require('../middleware/auth');

// Generate unique booking reference
function generateRef() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref = 'SKY';
    for (let i = 0; i < 7; i++) ref += chars[Math.floor(Math.random() * chars.length)];
    return ref;
}

// GET /booking?package_id=X — show booking form
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const { package_id } = req.query;
        let pkg = null;
        if (package_id) {
            const [pkgResult] = await db.query(`
                SELECT p.*,
                       COALESCE(p.name, p.package_name) AS name,
                       COALESCE(d.name, p.destination, 'Popular Destination') AS destination_name,
                       COALESCE(p.image_url, p.image) AS image_url,
                       COALESCE(p.duration_days, 4) AS duration_days,
                       COALESCE(p.duration_nights, 3) AS duration_nights,
                       COALESCE(p.rating, 4.5) AS rating
                FROM packages p
                LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
                WHERE p.id = ? AND (p.is_available = 1 OR p.is_available IS NULL)
            `, [package_id]);
            pkg = pkgResult[0] || null;
        }

        const [packages] = await db.query(`
            SELECT p.*,
                   COALESCE(p.name, p.package_name) AS name,
                   COALESCE(d.name, p.destination, 'Popular Destination') AS destination_name,
                   COALESCE(p.duration_days, 4) AS duration_days
            FROM packages p
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE (p.is_available = 1 OR p.is_available IS NULL)
            ORDER BY COALESCE(d.name, p.destination), p.name
        `);

        const user = req.session.user;
        res.render('booking', {
            title: 'Book Your Trip – SkyTour',
            pkg,
            packages,
            user,
            formData: {
                traveler_name: user.full_name || user.name || '',
                traveler_email: user.email || '',
                traveler_phone: user.phone || '',
                package_id: package_id || ''
            }
        });
    } catch (err) {
        console.error('Booking form error:', err);
        res.redirect('/packages');
    }
});

// POST /booking — submit booking
router.post('/', isLoggedIn, async (req, res) => {
    console.log('RECEIVED BODY IN POST /booking:', req.body);
    const {
        package_id, traveler_name, traveler_email, traveler_phone,
        travel_date, return_date, num_travelers, special_requests
    } = req.body;

    // Validation
    if (!package_id || !traveler_name || !traveler_email || !traveler_phone || !travel_date || !num_travelers) {
        req.session.error = 'Please fill in all required fields.';
        return res.redirect(`/booking?package_id=${package_id || ''}`);
    }

    const travelers = parseInt(num_travelers);
    if (isNaN(travelers) || travelers < 1 || travelers > 50) {
        req.session.error = 'Number of travelers must be between 1 and 50.';
        return res.redirect(`/booking?package_id=${package_id}`);
    }

    const travelDate = new Date(travel_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (travelDate <= today) {
        req.session.error = 'Travel date must be in the future.';
        return res.redirect(`/booking?package_id=${package_id}`);
    }

    if (return_date) {
        const returnDate = new Date(return_date);
        if (returnDate <= travelDate) {
            req.session.error = 'Return date must be after the departure travel date.';
            return res.redirect(`/booking?package_id=${package_id}`);
        }
    }

    try {
        const [pkgResult] = await db.query(
            'SELECT * FROM packages WHERE id = ? AND (is_available = 1 OR is_available IS NULL)',
            [package_id]
        );
        if (pkgResult.length === 0) {
            req.session.error = 'Selected package is not available.';
            return res.redirect('/packages');
        }
        const pkg = pkgResult[0];
        const basePrice = parseFloat(pkg.price) * travelers;
        const taxRate = 0.05; // 5% GST
        const taxes = Math.round(basePrice * taxRate);
        const totalPrice = basePrice + taxes;

        const bookingRef = generateRef();
        const destinationName = pkg.destination || 'SkyTour Destination';

        // Payment Mode Handling
        const rawPaymentMode = (req.body.payment_mode || 'card').toLowerCase();
        const validModes = ['upi', 'card', 'netbanking', 'cash_on_arrival'];
        const paymentMode = validModes.includes(rawPaymentMode) ? rawPaymentMode : 'card';

        let paymentStatus = 'pending';
        let bookingStatus = 'confirmed';
        let transactionId = null;
        let paidAmount = 0.00;

        if (paymentMode !== 'cash_on_arrival') {
            paymentStatus = 'paid';
            transactionId = 'TXN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
            paidAmount = totalPrice;
        }

        await db.query(`
            INSERT INTO bookings
            (booking_ref, customer_id, package_id,
             traveler_name, customer_name,
             traveler_email, email,
             traveler_phone, phone,
             destination,
             travel_date, return_date,
             num_travelers, travelers,
             special_requests, message,
             total_price, status,
             payment_mode, payment_status,
             transaction_id, paid_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            bookingRef, req.session.user.id, package_id,
            traveler_name, traveler_name,
            traveler_email, traveler_email,
            traveler_phone, traveler_phone,
            destinationName,
            travel_date, return_date || null,
            travelers, travelers,
            special_requests || null, special_requests || null,
            totalPrice, bookingStatus,
            paymentMode, paymentStatus,
            transactionId, paidAmount
        ]);

        req.session.success = paymentStatus === 'paid'
            ? '🎉 Payment successful! Your trip is fully confirmed.'
            : '🎉 Booking request confirmed! Pay remaining amount on arrival.';

        res.redirect(`/booking/confirmation/${bookingRef}`);
    } catch (err) {
        console.log('CRITICAL BOOKING SUBMISSION ERROR:', err.message, err.code, err.sqlMessage);
        req.session.error = 'Booking failed. Please try again.';
        res.redirect(`/booking?package_id=${package_id}`);
    }
});

// GET /booking/confirmation/:ref
router.get('/confirmation/:ref', isLoggedIn, async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT b.*,
                   COALESCE(p.name, p.package_name, 'Tour Package') AS package_name,
                   COALESCE(p.duration_days, 4) AS duration_days,
                   COALESCE(p.duration_nights, 3) AS duration_nights,
                   COALESCE(p.image_url, p.image, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80') AS package_image,
                   COALESCE(d.name, p.destination, b.destination, 'Popular Destination') AS destination_name,
                   COALESCE(d.country, '') AS country
            FROM bookings b
            LEFT JOIN packages p ON b.package_id = p.id
            LEFT JOIN destinations d ON (p.destination_id = d.id OR p.destination = d.name)
            WHERE b.booking_ref = ? AND (b.customer_id = ? OR b.email = ?)
        `, [req.params.ref, req.session.user.id, req.session.user.email]);

        if (results.length === 0) return res.redirect('/dashboard');

        res.render('booking-confirmation', {
            title: 'Booking Confirmed – SkyTour',
            booking: results[0]
        });
    } catch (err) {
        console.error('Confirmation error:', err);
        res.redirect('/dashboard');
    }
});

// POST /booking/pay/:ref — process online payment for a pending booking
router.post('/pay/:ref', isLoggedIn, async (req, res) => {
    try {
        const [results] = await db.query(
            'SELECT * FROM bookings WHERE booking_ref = ? AND (customer_id = ? OR email = ?)',
            [req.params.ref, req.session.user.id, req.session.user.email]
        );
        if (results.length === 0) {
            req.session.error = 'Booking not found.';
            return res.redirect('/dashboard/bookings');
        }
        const b = results[0];
        const rawPaymentMode = (req.body.payment_mode || 'card').toLowerCase();
        const validModes = ['upi', 'card', 'netbanking'];
        const paymentMode = validModes.includes(rawPaymentMode) ? rawPaymentMode : 'card';
        const transactionId = 'TXN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

        await db.query(`
            UPDATE bookings SET
                payment_mode = ?,
                payment_status = 'paid',
                transaction_id = ?,
                paid_amount = ?,
                status = 'confirmed'
            WHERE id = ?
        `, [paymentMode, transactionId, b.total_price, b.id]);

        req.session.success = '🎉 Payment of ₹' + Number(b.total_price).toLocaleString('en-IN') + ' received successfully!';
        res.redirect(`/booking/confirmation/${b.booking_ref}`);
    } catch (err) {
        console.error('Payment error:', err);
        req.session.error = 'Payment processing failed. Please try again.';
        res.redirect(`/booking/confirmation/${req.params.ref}`);
    }
});

// POST /booking/cancel/:id
router.post('/cancel/:id', isLoggedIn, async (req, res) => {
    try {
        const [booking] = await db.query(
            'SELECT * FROM bookings WHERE id = ? AND (customer_id = ? OR email = ?)',
            [req.params.id, req.session.user.id, req.session.user.email]
        );
        if (booking.length === 0) {
            req.session.error = 'Booking not found.';
            return res.redirect('/dashboard/bookings');
        }

        const b = booking[0];
        const statusLower = (b.status || '').toLowerCase();
        if (!['pending', 'confirmed'].includes(statusLower)) {
            req.session.error = 'This booking cannot be cancelled.';
            return res.redirect('/dashboard/bookings');
        }

        const travelDate = new Date(b.travel_date);
        const today = new Date();
        const diffDays = Math.ceil((travelDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 2) {
            req.session.error = 'Bookings can only be cancelled at least 2 days before the travel date.';
            return res.redirect('/dashboard/bookings');
        }

        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
        req.session.success = 'Booking cancelled successfully.';
        res.redirect('/dashboard/bookings');
    } catch (err) {
        console.error('Cancel booking error:', err);
        req.session.error = 'Could not cancel booking.';
        res.redirect('/dashboard/bookings');
    }
});

module.exports = router;
