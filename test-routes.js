(async function run() {
    console.log('\n========================================');
    console.log('   STARTING SKYTOUR ROUTE VERIFICATION  ');
    console.log('========================================\n');

    const tests = [
        { path: '/', expectedStatus: 302, desc: 'Root Redirect to /home' },
        { path: '/home', expectedStatus: 200, desc: 'Homepage' },
        { path: '/packages', expectedStatus: 200, desc: 'Tour Packages Listing' },
        { path: '/packages/1', expectedStatus: 200, desc: 'Tour Package Detail Page (ID 1)' },
        { path: '/destinations', expectedStatus: 200, desc: 'Destinations Listing' },
        { path: '/destinations/1', expectedStatus: 200, desc: 'Destination Detail Page (ID 1)' },
        { path: '/about', expectedStatus: 200, desc: 'About Us Page' },
        { path: '/contact', expectedStatus: 200, desc: 'Contact Us Page' },
        { path: '/login', expectedStatus: 200, desc: 'Customer Login Page' },
        { path: '/register', expectedStatus: 200, desc: 'Customer Register Page' },
        { path: '/admin/login', expectedStatus: 200, desc: 'Admin Login Page' },
        { path: '/css/style.css', expectedStatus: 200, expectedMime: 'text/css', desc: 'Main CSS Stylesheet' },
        { path: '/css/admin.css', expectedStatus: 200, expectedMime: 'text/css', desc: 'Admin CSS Stylesheet' },
        { path: '/js/main.js', expectedStatus: 200, expectedMime: 'application/javascript', desc: 'Client JavaScript' }
    ];

    let passed = 0;
    let failed = 0;

    for (const t of tests) {
        try {
            const res = await fetch('http://localhost:3000' + t.path, { redirect: 'manual' });
            const contentType = res.headers.get('content-type') || '';
            const isStatusOk = res.status === t.expectedStatus;
            const isMimeOk = !t.expectedMime || contentType.includes(t.expectedMime);

            if (isStatusOk && isMimeOk) {
                console.log(`[PASS] ${t.desc} (${t.path}) -> Status ${res.status}`);
                passed++;
            } else {
                console.error(`[FAIL] ${t.desc} (${t.path}) -> Got status ${res.status} (expected ${t.expectedStatus}), Content-Type: ${contentType}`);
                failed++;
            }

            // Verify content on packages page
            if (t.path === '/packages') {
                const html = await res.text();
                const countMatch = html.match(/class="package-card"/g);
                const count = countMatch ? countMatch.length : 0;
                console.log(`   -> Total packages rendered: ${count}`);
                if (count >= 20 && html.includes('Goa Beach Escape') && html.includes('Swiss Alps')) {
                    console.log('   -> [VERIFIED] All rich tour packages properly rendered!');
                } else {
                    console.error('   -> [ERROR] Tour packages missing from /packages!');
                    failed++;
                }
            }

            // Verify content on home page
            if (t.path === '/home') {
                const html = await res.text();
                const pkgCountMatch = html.match(/class="package-card"/g);
                const destCountMatch = html.match(/class="destination-card"/g);
                const destCount = destCountMatch ? destCountMatch.length : 0;
                const pkgCount = pkgCountMatch ? pkgCountMatch.length : 0;
                console.log(`   -> Home destinations rendered: ${destCount}`);
                console.log(`   -> Home featured packages rendered: ${pkgCount}`);
                if (destCount >= 8 && pkgCount >= 6) {
                    console.log('   -> [VERIFIED] Homepage populated with destinations & packages!');
                } else {
                    console.error('   -> [ERROR] Incomplete cards on homepage!');
                    failed++;
                }
            }

            // Verify content on destinations page
            if (t.path === '/destinations') {
                const html = await res.text();
                const destCardMatch = html.match(/class="dest-page-card"/g);
                const count = destCardMatch ? destCardMatch.length : 0;
                console.log(`   -> Total destinations rendered: ${count}`);
                if (count >= 14 && html.includes('Goa') && html.includes('Maldives') && html.includes('Paris')) {
                    console.log('   -> [VERIFIED] All 14 destinations properly rendered!');
                } else {
                    console.error('   -> [ERROR] Destinations missing from /destinations!');
                    failed++;
                }
            }
        } catch(e) {
            console.error(`[ERROR] ${t.desc} -> ${e.message}`);
            failed++;
        }
    }

    // Test Contact Submission
    try {
        const contactRes = await fetch('http://localhost:3000/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                name: 'Automated Test User',
                email: 'autotest@skytour.com',
                phone: '+91 99999 88888',
                destination: 'Switzerland',
                message: 'Testing contact inquiry submission with all data.'
            }).toString(),
            redirect: 'manual'
        });
        if (contactRes.status === 302 && contactRes.headers.get('location') === '/contact') {
            console.log('[PASS] Contact Form Submission (POST /contact) -> 302 Redirect with success flash');
            passed++;
        } else {
            console.error('[FAIL] Contact form submission returned unexpected status:', contactRes.status);
            failed++;
        }
    } catch (e) {
        console.error('[ERROR] Contact submission failed:', e.message);
        failed++;
    }

    // Test Newsletter Subscription
    try {
        const newsRes = await fetch('http://localhost:3000/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email: 'newssub@test.com' }).toString(),
            redirect: 'manual'
        });
        if (newsRes.status === 302) {
            console.log('[PASS] Newsletter Subscription (POST /newsletter) -> 302 Redirect with success flash');
            passed++;
        } else {
            console.error('[FAIL] Newsletter subscription failed');
            failed++;
        }
    } catch (e) {
        console.error('[ERROR] Newsletter failed:', e.message);
        failed++;
    }

    console.log(`\n================================`);
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================\n`);
    if (failed > 0) process.exit(1);
})();
