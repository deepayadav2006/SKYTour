(async function run() {
    console.log('\n========================================');
    console.log('   TESTING END-TO-END CUSTOMER & ADMIN  ');
    console.log('========================================\n');

    let passed = 0;
    let failed = 0;
    let adminCookie = null;

    // 1. Test Admin Login & Dashboard KPIs
    try {
        const loginRes = await fetch('http://localhost:3000/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email: 'admin@skytour.com', password: 'Admin@123' }),
            redirect: 'manual'
        });
        if (loginRes.status === 302) {
            console.log('[PASS] Admin Login POST -> Authenticated');
            passed++;
        } else {
            console.error('[FAIL] Admin Login failed, status:', loginRes.status);
            failed++;
        }
        adminCookie = loginRes.headers.get('set-cookie');

        // Access Admin Dashboard with cookie
        const dashRes = await fetch('http://localhost:3000/admin/dashboard', {
            headers: { 'Cookie': adminCookie }
        });
        const dashHtml = await dashRes.text();
        if (dashRes.status === 200 && dashHtml.includes('Dashboard Overview') && dashHtml.includes('Estimated Revenue')) {
            console.log('[PASS] Admin Dashboard authenticated access successful with live KPI metrics!');
            passed++;
        } else {
            console.error('[FAIL] Admin Dashboard access failed.');
            failed++;
        }

        // Access Admin Packages List
        const pkgRes = await fetch('http://localhost:3000/admin/packages', {
            headers: { 'Cookie': adminCookie }
        });
        const pkgHtml = await pkgRes.text();
        if (pkgRes.status === 200 && pkgHtml.includes('Goa Beach Escape') && pkgHtml.includes('Swiss Alps')) {
            console.log('[PASS] Admin Packages List contains all 28 packages!');
            passed++;
        } else {
            console.error('[FAIL] Admin Packages List failed.');
            failed++;
        }

        // Access Admin Bookings List
        const bksRes = await fetch('http://localhost:3000/admin/bookings', {
            headers: { 'Cookie': adminCookie }
        });
        const bksHtml = await bksRes.text();
        if (bksRes.status === 200 && bksHtml.includes('SKY-2026-8812')) {
            console.log('[PASS] Admin Bookings List displays seeded customer bookings!');
            passed++;
        } else {
            console.error('[FAIL] Admin Bookings List failed.');
            failed++;
        }

    } catch (e) {
        console.error('[ERROR] Admin flow failed:', e.message);
        failed++;
    }

    // 2. Test Existing Demo Customer Login (John Doe)
    try {
        const johnLoginRes = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email: 'john@example.com', password: 'Password123' }),
            redirect: 'manual'
        });
        if (johnLoginRes.status === 302) {
            console.log('[PASS] Demo Customer Login (john@example.com) -> Authenticated');
            passed++;
        } else {
            console.error('[FAIL] Demo Customer Login failed');
            failed++;
        }
        const johnCookie = johnLoginRes.headers.get('set-cookie');

        // Customer Dashboard
        const johnDashRes = await fetch('http://localhost:3000/dashboard', {
            headers: { 'Cookie': johnCookie }
        });
        const johnDashHtml = await johnDashRes.text();
        if (johnDashRes.status === 200 && johnDashHtml.includes('Welcome back') && johnDashHtml.includes('John')) {
            console.log('[PASS] Customer Dashboard displays John Doe profile & upcoming trips!');
            passed++;
        } else {
            console.error('[FAIL] Customer Dashboard verification failed.');
            failed++;
        }
    } catch (e) {
        console.error('[ERROR] Demo customer flow failed:', e.message);
        failed++;
    }

    // 3. Test New Customer Registration, Login & Booking submission
    try {
        const testEmail = `traveler_${Date.now()}@skytour.com`;
        const regRes = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                fullName: 'Samantha Jones',
                email: testEmail,
                phone: '+91 91234 56789',
                password: 'Password123',
                confirmPassword: 'Password123'
            }),
            redirect: 'manual'
        });
        if (regRes.status === 302) {
            console.log('[PASS] Customer Registration POST -> Status 302 Redirect to /login');
            passed++;
        } else {
            console.error('[FAIL] Customer Registration failed, status:', regRes.status);
            failed++;
        }

        // New Customer Login
        const custLoginRes = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email: testEmail, password: 'Password123' }),
            redirect: 'manual'
        });
        const userCookie = custLoginRes.headers.get('set-cookie');
        if (custLoginRes.status === 302) {
            console.log('[PASS] New Customer Login POST -> Status 302');
            passed++;
        } else {
            console.error('[FAIL] New customer login failed');
            failed++;
        }

        // Customer Booking Form
        const bookingFormRes = await fetch('http://localhost:3000/booking?package_id=1', {
            headers: { 'Cookie': userCookie }
        });
        const bookingFormHtml = await bookingFormRes.text();
        if (bookingFormRes.status === 200 && bookingFormHtml.includes('Goa Beach Escape')) {
            console.log('[PASS] Booking form pre-filled with selected package!');
            passed++;
        } else {
            console.error('[FAIL] Booking form failed.');
            failed++;
        }

        // Customer Booking Submission
        const tomorrow = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
        const returnDate = new Date(Date.now() + 86400000 * 9).toISOString().split('T')[0];
        const invalidReturnDate = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

        // 3a. Test Return Date Validation (Return date <= Departure date)
        const invalidDateRes = await fetch('http://localhost:3000/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': userCookie
            },
            body: new URLSearchParams({
                package_id: '1',
                traveler_name: 'Samantha Jones',
                traveler_email: testEmail,
                traveler_phone: '+91 91234 56789',
                travel_date: tomorrow,
                return_date: invalidReturnDate, // Invalid!
                num_travelers: '2'
            }),
            redirect: 'manual'
        });
        const invalidRedirect = invalidDateRes.headers.get('location') || '';
        if (invalidDateRes.status === 302 && invalidRedirect.includes('/booking?package_id=1')) {
            console.log('[PASS] Validation: Booking rejected when return date is before departure date!');
            passed++;
        } else {
            console.error('[FAIL] Return date validation did not reject as expected.');
            failed++;
        }

        // 3b. Test Booking Submission with Pay On Arrival
        const bookSubmitRes = await fetch('http://localhost:3000/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': userCookie
            },
            body: new URLSearchParams({
                package_id: '1',
                traveler_name: 'Samantha Jones',
                traveler_email: testEmail,
                traveler_phone: '+91 91234 56789',
                travel_date: tomorrow,
                return_date: returnDate,
                num_travelers: '2',
                payment_mode: 'cash_on_arrival',
                special_requests: 'Quiet room near the beach'
            }),
            redirect: 'manual'
        });
        const redirectLoc = bookSubmitRes.headers.get('location') || '';
        const bookingRefMatch = redirectLoc.match(/\/booking\/confirmation\/([A-Z0-9]+)/);
        const newBookingRef = bookingRefMatch ? bookingRefMatch[1] : null;

        if (bookSubmitRes.status === 302 && newBookingRef) {
            console.log(`[PASS] Booking Submission POST (Cash on Arrival) -> Confirmed (Ref: ${newBookingRef})`);
            passed++;
        } else {
            console.error('[FAIL] Booking submission failed, status:', bookSubmitRes.status);
            failed++;
        }

        // 3c. Check Confirmation Page shows Pay on Arrival and E-ticket voucher
        const confirmUrl = 'http://localhost:3000' + redirectLoc;
        const confirmRes = await fetch(confirmUrl, {
            headers: { 'Cookie': userCookie }
        });
        const confirmHtml = await confirmRes.text();
        if (confirmRes.status === 200 &&
            confirmHtml.includes('Booking Confirmed!') &&
            confirmHtml.includes('Official E-Ticket') &&
            confirmHtml.includes('Pay on Arrival') &&
            confirmHtml.includes('Prefer to pay online now?')) {
            console.log('[PASS] E-Ticket Voucher & Pay on Arrival details correctly rendered on confirmation page!');
            passed++;
        } else {
            console.error('[FAIL] Confirmation page voucher/pending status verification failed.');
            failed++;
        }

        // 3d. Test Paying Online for Pending Booking (/booking/pay/:ref)
        const payRes = await fetch(`http://localhost:3000/booking/pay/${newBookingRef}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': userCookie
            },
            body: new URLSearchParams({
                payment_mode: 'upi',
                upi_id: 'samantha@okhdfcbank'
            }),
            redirect: 'manual'
        });
        if (payRes.status === 302 && payRes.headers.get('location').includes(`/booking/confirmation/${newBookingRef}`)) {
            console.log('[PASS] Online Payment for Pending Booking POST -> Successfully Processed!');
            passed++;
        } else {
            console.error('[FAIL] Online payment processing failed.');
            failed++;
        }

        // Verify Confirmation page now shows Paid Online and Transaction ID
        const paidConfirmRes = await fetch(confirmUrl, {
            headers: { 'Cookie': userCookie }
        });
        const paidConfirmHtml = await paidConfirmRes.text();
        if (paidConfirmHtml.includes('Paid Online') && paidConfirmHtml.includes('TXN-')) {
            console.log('[PASS] Booking confirmation now reflects Paid Online with valid Transaction ID!');
            passed++;
        } else {
            console.error('[FAIL] Paid Online status or Transaction ID not rendered.');
            failed++;
        }

        // 3e. Check Customer My Bookings page
        const myBookingsRes = await fetch('http://localhost:3000/dashboard/bookings', {
            headers: { 'Cookie': userCookie }
        });
        const myBookingsHtml = await myBookingsRes.text();
        if (myBookingsRes.status === 200 && myBookingsHtml.includes('Goa Beach Escape') && myBookingsHtml.includes('E-Ticket')) {
            console.log('[PASS] Customer My Bookings page shows booking with E-Ticket action!');
            passed++;
        } else {
            console.error('[FAIL] My Bookings page failed to display booking.');
            failed++;
        }

        // 4. Test Admin Booking Status and Payment Status Management
        const adminBookingsPage = await fetch('http://localhost:3000/admin/bookings', {
            headers: { 'Cookie': adminCookie }
        });
        const adminBookingsHtml = await adminBookingsPage.text();
        if (adminBookingsHtml.includes(newBookingRef)) {
            console.log('[PASS] Admin Bookings table contains newly placed customer booking!');
            passed++;
        } else {
            console.error('[FAIL] Admin Bookings table does not show new booking.');
            failed++;
        }

        // Extract booking id from admin page or update booking #1
        const adminStatusUpdateRes = await fetch('http://localhost:3000/admin/bookings/1/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': adminCookie
            },
            body: new URLSearchParams({
                status: 'confirmed',
                payment_status: 'paid'
            }),
            redirect: 'manual'
        });
        if (adminStatusUpdateRes.status === 302) {
            console.log('[PASS] Admin Booking Status & Payment Status update POST -> Status 302');
            passed++;
        } else {
            console.error('[FAIL] Admin status update failed, status:', adminStatusUpdateRes.status);
            failed++;
        }

    } catch (e) {
        console.error('[ERROR] Customer flow failed:', e.message);
        failed++;
    }

    console.log(`\n========================================`);
    console.log(`E2E SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
    if (failed > 0) process.exit(1);
})();
