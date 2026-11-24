const bcrypt = require('bcryptjs');

async function seedDatabase(db) {
    try {
        console.log('🔄 Checking database tables and schema...');

        // 1. Ensure tables exist (compatible with both MySQL and SQLite)
        await db.query(`
            CREATE TABLE IF NOT EXISTS destinations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                country VARCHAR(100) NOT NULL,
                description TEXT,
                short_desc VARCHAR(255),
                image_url VARCHAR(500),
                best_time VARCHAR(100),
                climate VARCHAR(100),
                language VARCHAR(100),
                currency VARCHAR(50),
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(async () => {
            // MySQL syntax fallback if INTEGER PRIMARY KEY AUTOINCREMENT throws in MySQL
            await db.query(`
                CREATE TABLE IF NOT EXISTS destinations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    country VARCHAR(100) NOT NULL,
                    description TEXT,
                    short_desc VARCHAR(255),
                    image_url VARCHAR(500),
                    best_time VARCHAR(100),
                    climate VARCHAR(100),
                    language VARCHAR(100),
                    currency VARCHAR(50),
                    is_active TINYINT(1) DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        });

        await db.query(`
            CREATE TABLE IF NOT EXISTS packages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                destination_id INTEGER,
                package_name VARCHAR(150),
                name VARCHAR(150),
                destination VARCHAR(100),
                duration VARCHAR(50),
                duration_days INTEGER DEFAULT 3,
                duration_nights INTEGER DEFAULT 2,
                price DECIMAL(10,2) DEFAULT 0.00,
                description TEXT,
                short_desc VARCHAR(300),
                image VARCHAR(500),
                image_url VARCHAR(500),
                category VARCHAR(50) DEFAULT 'adventure',
                rating DECIMAL(2,1) DEFAULT 4.5,
                max_travelers INTEGER DEFAULT 20,
                included TEXT,
                excluded TEXT,
                is_available INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(async () => {
            await db.query(`
                CREATE TABLE IF NOT EXISTS packages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    destination_id INT,
                    package_name VARCHAR(150),
                    name VARCHAR(150),
                    destination VARCHAR(100),
                    duration VARCHAR(50),
                    duration_days INT DEFAULT 3,
                    duration_nights INT DEFAULT 2,
                    price DECIMAL(10,2) DEFAULT 0.00,
                    description TEXT,
                    short_desc VARCHAR(300),
                    image VARCHAR(500),
                    image_url VARCHAR(500),
                    category VARCHAR(50) DEFAULT 'adventure',
                    rating DECIMAL(2,1) DEFAULT 4.5,
                    max_travelers INT DEFAULT 20,
                    included TEXT,
                    excluded TEXT,
                    is_available TINYINT(1) DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        });

        await db.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(async () => {
            await db.query(`
                CREATE TABLE IF NOT EXISTS admins (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'admin',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        });

        await db.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(20),
                password VARCHAR(255) NOT NULL,
                profile_pic VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(async () => {
            await db.query(`
                CREATE TABLE IF NOT EXISTS customers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    phone VARCHAR(20),
                    password VARCHAR(255) NOT NULL,
                    profile_pic VARCHAR(255) DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        });

        await db.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                booking_ref VARCHAR(50) UNIQUE,
                customer_id INTEGER,
                package_id INTEGER,
                customer_name VARCHAR(100),
                traveler_name VARCHAR(100),
                email VARCHAR(150),
                traveler_email VARCHAR(150),
                phone VARCHAR(20),
                traveler_phone VARCHAR(20),
                destination VARCHAR(100),
                travel_date DATE,
                return_date DATE,
                travelers INTEGER DEFAULT 1,
                num_travelers INTEGER DEFAULT 1,
                total_price DECIMAL(10,2) DEFAULT 0.00,
                special_requests TEXT,
                message TEXT,
                status VARCHAR(30) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(async () => {
            await db.query(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    booking_ref VARCHAR(50) UNIQUE,
                    customer_id INT,
                    package_id INT,
                    customer_name VARCHAR(100),
                    traveler_name VARCHAR(100),
                    email VARCHAR(150),
                    traveler_email VARCHAR(150),
                    phone VARCHAR(20),
                    traveler_phone VARCHAR(20),
                    destination VARCHAR(100),
                    travel_date DATE,
                    return_date DATE,
                    travelers INT DEFAULT 1,
                    num_travelers INT DEFAULT 1,
                    total_price DECIMAL(10,2) DEFAULT 0.00,
                    special_requests TEXT,
                    message TEXT,
                    status VARCHAR(30) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        });

        await db.query(`
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(100) NOT NULL UNIQUE,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(async () => {
            await db.query(`
                CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        });

        await db.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                destination VARCHAR(100),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(async () => {
            await db.query(`
                CREATE TABLE IF NOT EXISTS contact_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    phone VARCHAR(20),
                    destination VARCHAR(100),
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        });

        // 2. Seed Destinations (14 Destinations)
        const [existingDests] = await db.query('SELECT COUNT(*) AS c FROM destinations');
        if (existingDests[0].c === 0) {
            console.log('🌱 Seeding 14 world-class destinations...');
            const sampleDestinations = [
                ['Goa', 'India', "India's beach paradise with stunning coastlines, Portuguese colonial architecture, vibrant nightlife, and water sports along Baga, Calangute and Palolem beaches.", "India's beach paradise with golden sands, nightlife & heritage.", 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', 'November to February', 'Tropical', 'Konkani, English, Hindi', 'Indian Rupee (INR)'],
                ['Manali', 'India', 'Breathtaking hill station in the Himalayas of Himachal Pradesh, known for snow-capped peaks, Solang Valley paragliding, Rohtang Pass, and riverside camping.', 'Himalayan paradise for adventure lovers with snow peaks & valleys.', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', 'October to June', 'Alpine', 'Hindi, Pahari', 'Indian Rupee (INR)'],
                ['Kashmir', 'India', 'Paradise on Earth, famous for Dal Lake shikara rides, snow-covered Gulmarg ski slopes, Mughal gardens of Srinagar, and scenic valleys of Pahalgam.', 'Paradise on Earth with Dal Lake, Mughal gardens & snow peaks.', 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80', 'March to November', 'Temperate', 'Kashmiri, Urdu, Hindi', 'Indian Rupee (INR)'],
                ['Kerala', 'India', "God's Own Country, featuring serene backwater houseboats in Alleppey, rolling green tea hills of Munnar, wildlife in Periyar, and authentic Ayurvedic wellness.", "God's Own Country with backwaters, houseboats & Ayurveda.", 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 'September to March', 'Tropical', 'Malayalam, English', 'Indian Rupee (INR)'],
                ['Rajasthan', 'India', 'Land of Maharajas featuring royal palaces in Jaipur, romantic lakes in Udaipur, majestic Mehrangarh Fort in Jodhpur, and golden desert dunes in Jaisalmer.', 'Royal heritage, majestic desert forts & opulent lakeside palaces.', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80', 'October to March', 'Semi-Arid', 'Hindi, Rajasthani', 'Indian Rupee (INR)'],
                ['Andaman Islands', 'India', 'Tropical archipelago with turquoise waters, world-famous Radhanagar beach, vibrant coral reefs for scuba diving, and historic Cellular Jail in Port Blair.', 'Exotic turquoise waters, white sand beaches & marine coral reefs.', 'https://images.unsplash.com/photo-1589136777351-fdc9c9cab193?w=800&q=80', 'October to May', 'Tropical Maritime', 'Hindi, Bengali, English', 'Indian Rupee (INR)'],
                ['Bali', 'Indonesia', 'Island of the Gods with dramatic volcanic landscapes, iconic Hindu sea temples like Tanah Lot, lush Tegalalang rice terraces, and chic beach clubs in Seminyak.', 'Island of Gods with clifftop temples, rice terraces & surf beaches.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', 'April to October', 'Tropical', 'Balinese, Indonesian, English', 'Indonesian Rupiah (IDR)'],
                ['Dubai', 'United Arab Emirates', 'Futuristic desert metropolis featuring Burj Khalifa, Dubai Mall fountain spectacles, thrilling desert safaris with dune bashing, and luxury marina yacht cruises.', 'City of superlatives with skyscrapers, luxury & desert adventures.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', 'November to March', 'Arid/Desert', 'Arabic, English', 'UAE Dirham (AED)'],
                ['Thailand', 'Thailand', 'The Land of Smiles offering vibrant Bangkok street life and Grand Palace, Phuket turquoise beaches, Phi Phi Island boat tours, and world-renowned Thai cuisine.', 'Land of Smiles with ornate temples, limestone islands & night markets.', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80', 'November to April', 'Tropical', 'Thai, English', 'Thai Baht (THB)'],
                ['Singapore', 'Singapore', 'Modern Asian hub showcasing Marina Bay Sands, futuristic Gardens by the Bay Supertrees, Universal Studios Sentosa, and world-class street food havens.', 'Dazzling city-state of cultures, cuisine & futuristic architecture.', 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80', 'February to April', 'Tropical', 'English, Mandarin, Malay', 'Singapore Dollar (SGD)'],
                ['Maldives', 'Maldives', 'The ultimate luxury island getaway with overwater private villas perched atop clear blue lagoons, vibrant coral atolls, and breathtaking sunsets.', 'Ultimate luxury with turquoise lagoons, overwater villas & coral reefs.', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80', 'November to April', 'Tropical', 'Dhivehi, English', 'Maldivian Rufiyaa (MVR)'],
                ['Switzerland', 'Switzerland', 'Heart of the Swiss Alps featuring majestic Jungfraujoch, crystal lakes of Lucerne and Geneva, scenic alpine train journeys, and picturesque mountain chalets.', 'Majestic Swiss Alps, glacier peaks, scenic trains & chocolate.', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80', 'May to October & Dec to Mar', 'Temperate Alpine', 'German, French, English', 'Swiss Franc (CHF)'],
                ['Paris', 'France', 'The City of Light known for the iconic Eiffel Tower, world-renowned Louvre art treasures, romantic Seine River cruises, and historic Montmartre cafes.', 'The City of Light with Eiffel Tower, art museums & French cafes.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', 'April to October', 'Temperate', 'French, English', 'Euro (EUR)'],
                ['Tokyo', 'Japan', 'Electrifying fusion of ultra-modern technology and timeless tradition — from neon-lit Shibuya Crossing and Akihabara to tranquil Senso-ji temple and Mount Fuji.', 'Vibrant metropolis blending futuristic tech, historic temples & food.', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80', 'March to May & Sep to Nov', 'Temperate', 'Japanese, English', 'Japanese Yen (JPY)']
            ];

            for (const d of sampleDestinations) {
                await db.query(`
                    INSERT INTO destinations (name, country, description, short_desc, image_url, best_time, climate, language, currency)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, d);
            }
            console.log(`✅ Seeded ${sampleDestinations.length} destinations successfully!`);
        }

        // Fetch destination mapping for foreign keys
        const [dests] = await db.query('SELECT id, name FROM destinations');
        const destMap = {};
        dests.forEach(d => { destMap[d.name] = d.id; });

        // 3. Seed Tour Packages (28 Packages across all 6 categories)
        const [existingPkgs] = await db.query('SELECT COUNT(*) AS c FROM packages');
        if (existingPkgs[0].c === 0) {
            console.log('🌱 Seeding 28 comprehensive tour packages across 6 categories...');
            const samplePackages = [
                // 1. Goa
                {
                    name: 'Goa Beach Escape',
                    dest: 'Goa',
                    price: 12999.00,
                    duration: '4 Days / 3 Nights',
                    days: 4,
                    nights: 3,
                    desc: 'Experience the magic of Goa with our premium 4-day beach getaway. Stay at a beachfront resort in North Goa, enjoy parasailing and jet-skiing at Baga, explore Aguada Fort, and savor authentic seafood curries.',
                    short: 'Premium beach getaway with water sports & beachfront resort.',
                    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
                    cat: 'budget',
                    rating: 4.6,
                    inc: 'Resort stay (3 nights)|Daily buffet breakfast|Airport/railway transfers|Water sports session|South Goa heritage tour',
                    exc: 'Flight tickets|Lunch & dinner|Personal expenses|Alcoholic drinks'
                },
                {
                    name: 'Goa Luxury Villa Retreat',
                    dest: 'Goa',
                    price: 45999.00,
                    duration: '5 Days / 4 Nights',
                    days: 5,
                    nights: 4,
                    desc: 'Indulge in a 5-star beachfront private pool villa in South Goa. Includes private catamaran sunset cruise on the Arabian Sea, curated couples spa therapy, and private chauffeur-driven luxury vehicle.',
                    short: 'Ultra-luxury resort & spa experience with private beach access.',
                    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
                    cat: 'luxury',
                    rating: 4.9,
                    inc: '5-star luxury villa (4 nights)|All gourmet meals|Private airport transfer|Sunset yacht cruise|Spa package',
                    exc: 'Flights|Imported beverages|Shopping'
                },

                // 2. Manali
                {
                    name: 'Manali Adventure Expedition',
                    dest: 'Manali',
                    price: 15999.00,
                    duration: '5 Days / 4 Nights',
                    days: 5,
                    nights: 4,
                    desc: 'Embark on a thrilling mountain adventure featuring Solang Valley paragliding, snow activities at Rohtang Pass, riverside camping along the Beas River, and scenic trek to Jogini Waterfalls.',
                    short: 'Himalayan adventure with trekking, paragliding & snow activities.',
                    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
                    cat: 'adventure',
                    rating: 4.7,
                    inc: 'Mountain view hotel (4 nights)|Breakfast & dinner|Volvo transfers from Delhi|Solang Valley tour|Paragliding ticket',
                    exc: 'Rohtang special permit fee|Lunch|Personal expenses'
                },
                {
                    name: 'Manali Scenic Family Holiday',
                    dest: 'Manali',
                    price: 22999.00,
                    duration: '6 Days / 5 Nights',
                    days: 6,
                    nights: 5,
                    desc: 'A family-friendly vacation across the Kullu valley. Enjoy apple orchard walks, Hadimba temple visit, hot sulphur springs at Vashisht, Naggar Castle art museum, and serene valley viewpoints.',
                    short: 'Family-friendly Manali with scenic valleys & comfortable stays.',
                    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                    cat: 'family',
                    rating: 4.5,
                    inc: 'Family suite (5 nights)|All breakfasts & dinners|Private cab for sightseeing|Naggar Castle visit',
                    exc: 'Airfare|Personal shopping|Lunches'
                },

                // 3. Kashmir
                {
                    name: 'Kashmir Valley Paradise',
                    dest: 'Kashmir',
                    price: 22999.00,
                    duration: '6 Days / 5 Nights',
                    days: 6,
                    nights: 5,
                    desc: 'Witness paradise on Earth — stay in a traditional cedar houseboat on Dal Lake, sunrise shikara ride, Gulmarg gondola ride to Phase 1 snow peaks, and Betaab Valley exploration in Pahalgam.',
                    short: 'Complete Kashmir experience with Dal Lake shikara & Gulmarg gondola.',
                    img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80',
                    cat: 'cultural',
                    rating: 4.8,
                    inc: 'Luxury houseboat (1N) + Hotel (4N)|Breakfast & dinner|Shikara ride|Gulmarg & Pahalgam transfers',
                    exc: 'Flights|Gondola Phase 2 tickets|Pony rides'
                },
                {
                    name: 'Kashmir Honeymoon Special',
                    dest: 'Kashmir',
                    price: 38999.00,
                    duration: '7 Days / 6 Nights',
                    days: 7,
                    nights: 6,
                    desc: 'Crafted exclusively for couples: private shikara decorated with fresh flowers, romantic candlelit dinner overlooking Dal Lake, luxury boutique resort stays, and horse riding in Pahalgam.',
                    short: 'Romantic Kashmir with luxury houseboat & candlelit experiences.',
                    img: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&q=80',
                    cat: 'honeymoon',
                    rating: 4.9,
                    inc: 'Houseboat + 4-star stays (6 nights)|All meals|Flower bed decoration|Candlelight dinner|Chauffeur driven cab',
                    exc: 'Flights|Personal shopping'
                },

                // 4. Kerala
                {
                    name: 'Kerala Backwaters & Tea Gardens',
                    dest: 'Kerala',
                    price: 18999.00,
                    duration: '5 Days / 4 Nights',
                    days: 5,
                    nights: 4,
                    desc: 'Cruise through Alleppey backwaters on an authentic private houseboat, explore rolling tea plantations and waterfalls in Munnar, and visit Eravikulam National Park.',
                    short: 'Houseboat cruise, tea gardens & authentic Ayurveda retreat.',
                    img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
                    cat: 'cultural',
                    rating: 4.6,
                    inc: 'Deluxe houseboat (1N) + Resort (3N)|Daily breakfast|All meals on houseboat|Private cab transfers|Tea museum entry',
                    exc: 'Airfare|Ayurvedic massage charges|Lunch on hotel days'
                },
                {
                    name: 'Kerala Ayurvedic Luxury Retreat',
                    dest: 'Kerala',
                    price: 54999.00,
                    duration: '7 Days / 6 Nights',
                    days: 7,
                    nights: 6,
                    desc: 'An authentic rejuvenating wellness retreat with daily Ayurvedic massage sessions, 5-star clifftop resort in Kovalam, private pool villa, and organic gourmet cuisine.',
                    short: 'Holistic Ayurveda wellness retreat with 5-star beachfront villas.',
                    img: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800&q=80',
                    cat: 'luxury',
                    rating: 4.9,
                    inc: '5-star wellness resort (6 nights)|All Ayurvedic organic meals|Daily consultation & therapies|Yoga sessions|Transfers',
                    exc: 'Flights|Extra specialized medicines'
                },

                // 5. Rajasthan
                {
                    name: 'Royal Rajasthan Heritage',
                    dest: 'Rajasthan',
                    price: 24999.00,
                    duration: '6 Days / 5 Nights',
                    days: 6,
                    nights: 5,
                    desc: 'Explore the Pink City Jaipur, majestic Amer Fort with elephant view, City Palace, Hawa Mahal, and romantic lake city Udaipur with boat ride on Lake Pichola.',
                    short: 'Grand forts, royal palaces & romantic lakes of Jaipur & Udaipur.',
                    img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
                    cat: 'cultural',
                    rating: 4.8,
                    inc: 'Heritage haveli hotels (5 nights)|Breakfast & dinner|AC Sedan transfers|Monument entries|Lake Pichola boat ride',
                    exc: 'Airfare|Camera fees at monuments|Lunches'
                },
                {
                    name: 'Thar Desert Safari & Camp',
                    dest: 'Rajasthan',
                    price: 16999.00,
                    duration: '4 Days / 3 Nights',
                    days: 4,
                    nights: 3,
                    desc: 'Experience the golden city of Jaisalmer, overnight luxury desert camping in Sam Dunes, camel safari during sunset, Rajasthani folk dance, and star gazing.',
                    short: 'Overnight desert camp, camel safari & Rajasthani cultural evening.',
                    img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
                    cat: 'adventure',
                    rating: 4.7,
                    inc: 'Swiss desert tent (1N) + Hotel (2N)|All meals in camp|Camel safari|Folk dance show|Jeep dune bashing',
                    exc: 'Train/Flight tickets|Personal shopping'
                },

                // 6. Andaman
                {
                    name: 'Andaman Coral Scuba Explorer',
                    dest: 'Andaman Islands',
                    price: 26999.00,
                    duration: '5 Days / 4 Nights',
                    days: 5,
                    nights: 4,
                    desc: 'Discover Port Blair Cellular Jail light & sound show, high-speed cruise to Havelock Island, world-famous Radhanagar Beach sunset, and scuba diving at Elephant Beach.',
                    short: 'Havelock Island beaches, scuba diving & coral reef adventures.',
                    img: 'https://images.unsplash.com/photo-1589136777351-fdc9c9cab193?w=800&q=80',
                    cat: 'adventure',
                    rating: 4.8,
                    inc: 'Beach resorts (4 nights)|Daily breakfast|Makruzz luxury ferry tickets|Introductory scuba dive with photos|All cab transfers',
                    exc: 'Flights to Port Blair|Water sports beyond package|Lunch & dinner'
                },
                {
                    name: 'Andaman Island Honeymoon',
                    dest: 'Andaman Islands',
                    price: 44999.00,
                    duration: '6 Days / 5 Nights',
                    days: 6,
                    nights: 5,
                    desc: 'Romantic island escape featuring beachfront luxury cottages, candlelight beach dinner, private sunset cruise, Neil Island natural rock bridge, and snorkelling.',
                    short: 'Romantic island retreat with private beach dinner & luxury cruise.',
                    img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
                    cat: 'honeymoon',
                    rating: 4.9,
                    inc: '5-star beach resort (5 nights)|Breakfast & dinner|Beach candlelight dinner|Private cab|Ferry tickets|Couple spa',
                    exc: 'Flights|Personal shopping'
                },

                // 7. Bali
                {
                    name: 'Bali Island Paradise & Temples',
                    dest: 'Bali',
                    price: 45999.00,
                    duration: '6 Days / 5 Nights',
                    days: 6,
                    nights: 5,
                    desc: 'Explore Ubud rice terraces, Sacred Monkey Forest, Tanah Lot sea temple sunset, white-water rafting on Ayung River, and lively Seminyak beach clubs.',
                    short: 'Complete Bali with temples, rice terraces & beach clubs.',
                    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
                    cat: 'cultural',
                    rating: 4.7,
                    inc: '4-star resort stay (5 nights)|Daily breakfast|Airport transfers|Ubud tour|Ayung rafting with lunch|Tanah Lot sunset',
                    exc: 'International flights|Visa on arrival|Personal expenses'
                },
                {
                    name: 'Bali Honeymoon Private Villa',
                    dest: 'Bali',
                    price: 72999.00,
                    duration: '7 Days / 6 Nights',
                    days: 7,
                    nights: 6,
                    desc: 'Exclusive private pool villa in Seminyak, clifftop couple massage overlooking the Indian Ocean, romantic Jimbaran seafood sunset dinner, and Nusa Penida speed boat tour.',
                    short: 'Romantic Bali with private pool villa & clifftop spa.',
                    img: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80',
                    cat: 'honeymoon',
                    rating: 4.9,
                    inc: 'Private pool villa (6 nights)|All breakfasts|Floating breakfast experience|Couples spa|Jimbaran beach dinner|Nusa Penida speed boat',
                    exc: 'International flights|Shopping'
                },

                // 8. Dubai
                {
                    name: 'Dubai Highlights & Desert Safari',
                    dest: 'Dubai',
                    price: 55999.00,
                    duration: '5 Days / 4 Nights',
                    days: 5,
                    nights: 4,
                    desc: 'Ascend Burj Khalifa 124th floor, watch Dubai Mall fountain show, thrilling desert safari with 4x4 dune bashing and BBQ buffet, and Marina dhow dinner cruise.',
                    short: 'Iconic Dubai with Burj Khalifa, desert safari & dhow cruise.',
                    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
                    cat: 'luxury',
                    rating: 4.7,
                    inc: '4-star hotel stay (4 nights)|Daily breakfast|Burj Khalifa tickets|Desert safari with BBQ dinner|Dhow cruise dinner|Airport transfers',
                    exc: 'Flights|UAE visa fee|Tourism dirham fee|Personal shopping'
                },
                {
                    name: 'Dubai Ultra-Luxury Burj Escape',
                    dest: 'Dubai',
                    price: 149999.00,
                    duration: '6 Days / 5 Nights',
                    days: 6,
                    nights: 5,
                    desc: 'Stay at the iconic 7-star Burj Al Arab, take a private helicopter tour over The Palm, enjoy a private yacht cruise with chef dining, and VIP desert safari.',
                    short: 'Burj Al Arab suite, private yacht & helicopter tour over Palm Jumeirah.',
                    img: '/images/dubai-burj-khalifa.jpg',
                    cat: 'luxury',
                    rating: 5.0,
                    inc: 'Burj Al Arab + 5-star (5 nights)|All gourmet meals|Private Rolls-Royce transfers|Helicopter tour|Yacht cruise|VIP safari',
                    exc: 'Flights|Personal shopping'
                },

                // 9. Thailand
                {
                    name: 'Thailand Explorer: Bangkok & Phuket',
                    dest: 'Thailand',
                    price: 42999.00,
                    duration: '7 Days / 6 Nights',
                    days: 7,
                    nights: 6,
                    desc: 'The best of Thailand: Bangkok Grand Palace, Chao Phraya dinner cruise, Phi Phi Island speedboat tour with snorkelling, and Phuket nightlife & beaches.',
                    short: 'Complete Thailand from Bangkok temples to Phuket beaches.',
                    img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
                    cat: 'cultural',
                    rating: 4.6,
                    inc: 'Hotels (6 nights)|Daily breakfast|Bangkok city tour|Phi Phi Island speedboat tour|Transfers',
                    exc: 'International flights|National park fee|Water sports'
                },
                {
                    name: 'Phuket Beach & Islands Getaway',
                    dest: 'Thailand',
                    price: 32999.00,
                    duration: '5 Days / 4 Nights',
                    days: 5,
                    nights: 4,
                    desc: 'Sun, sand, and turquoise waters — stay at a beachfront resort in Patong, explore James Bond Island by canoe, enjoy authentic Thai massage and fresh seafood.',
                    short: 'Beachfront resort, James Bond Island tour & authentic Thai massage.',
                    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
                    cat: 'budget',
                    rating: 4.5,
                    inc: 'Beach resort (4 nights)|Daily breakfast|James Bond island tour with lunch|Airport transfers|Thai massage session',
                    exc: 'Flights|Personal shopping|Lunches'
                },

                // 10. Singapore
                {
                    name: 'Singapore City Wonders',
                    dest: 'Singapore',
                    price: 48999.00,
                    duration: '5 Days / 4 Nights',
                    days: 5,
                    nights: 4,
                    desc: 'Explore Marina Bay Sands Skypark, Gardens by the Bay Flower Dome & Cloud Forest, Sentosa Island cable car, and Universal Studios Singapore.',
                    short: 'Singapore highlights with Marina Bay, Sentosa & Universal Studios.',
                    img: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80',
                    cat: 'family',
                    rating: 4.8,
                    inc: '4-star city hotel (4 nights)|Daily breakfast|Airport transfers|Universal Studios 1-day pass|Gardens by the Bay pass|Sentosa ticket',
                    exc: 'Flights|Visa|Personal expenses'
                },
                {
                    name: 'Singapore Family Extravaganza',
                    dest: 'Singapore',
                    price: 68999.00,
                    duration: '6 Days / 5 Nights',
                    days: 6,
                    nights: 5,
                    desc: 'The ultimate family adventure: Singapore Zoo with jungle breakfast, Night Safari tram ride, S.E.A. Aquarium, Universal Studios, and Sentosa water park.',
                    short: 'Family fun with Universal Studios, Singapore Zoo & Night Safari.',
                    img: 'https://images.unsplash.com/photo-1555217851-6141535bd771?w=800&q=80',
                    cat: 'family',
                    rating: 4.9,
                    inc: 'Family hotel (5 nights)|Breakfast & dinner|All park combo tickets|Private transfers|Night safari VIP tram',
                    exc: 'Flights|Lunch|Shopping'
                },

                // 11. Maldives
                {
                    name: 'Maldives Overwater Villa Luxury',
                    dest: 'Maldives',
                    price: 99999.00,
                    duration: '5 Days / 4 Nights',
                    days: 5,
                    nights: 4,
                    desc: 'Live the dream in an overwater villa with direct ladder access into turquoise ocean. Includes speedboat transfer from Male, all-inclusive gourmet dining, and guided reef snorkelling.',
                    short: 'Overwater luxury villa, turquoise lagoon & all-inclusive dining.',
                    img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
                    cat: 'luxury',
                    rating: 4.9,
                    inc: 'Overwater villa (4 nights)|All-inclusive dining & drinks|Speedboat transfers|Reef snorkelling safari|Spa credit',
                    exc: 'International flights|Scuba diving courses|Motorized water sports'
                },
                {
                    name: 'Maldives Honeymoon Romance',
                    dest: 'Maldives',
                    price: 139999.00,
                    duration: '6 Days / 5 Nights',
                    days: 6,
                    nights: 5,
                    desc: 'The pinnacle of romance: private water villa with infinity pool, sunset dolphin cruise with champagne, sandbank picnic for two, and couples oceanfront massage.',
                    short: 'Private infinity pool water villa, dolphin cruise & sandbank picnic.',
                    img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80',
                    cat: 'honeymoon',
                    rating: 5.0,
                    inc: 'Pool water villa (5 nights)|All meals & sparkling wine|Seaplane transfers|Dolphin cruise|Sandbank lunch|Couples spa',
                    exc: 'International flights|Shopping'
                },

                // 12. Switzerland
                {
                    name: 'Swiss Alps & Glacier Express',
                    dest: 'Switzerland',
                    price: 119999.00,
                    duration: '7 Days / 6 Nights',
                    days: 7,
                    nights: 6,
                    desc: 'Journey through Switzerland: Zurich city walk, Lake Lucerne cruise, Jungfraujoch "Top of Europe" cogwheel train to 3,454m, and scenic Glacier Express train to Zermatt.',
                    short: 'Jungfraujoch Top of Europe, Swiss Alps rail pass & scenic lakes.',
                    img: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80',
                    cat: 'cultural',
                    rating: 4.9,
                    inc: '4-star Alpine hotels (6 nights)|Daily Swiss breakfast|8-day Swiss Travel Pass|Jungfraujoch summit ticket|Glacier train seat',
                    exc: 'Flights|Visa fees|Lunch & dinner|Personal expenses'
                },
                {
                    name: 'Swiss Alpine Honeymoon Bliss',
                    dest: 'Switzerland',
                    price: 159999.00,
                    duration: '8 Days / 7 Nights',
                    days: 8,
                    nights: 7,
                    desc: 'Boutique chalet stays in Interlaken and Zermatt with Matterhorn views, private fondue dinner, thermal spa in the mountains, and helicopter sightseeing over glaciers.',
                    short: 'Romantic chalet stays with Matterhorn view & glacier helicopter flight.',
                    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                    cat: 'honeymoon',
                    rating: 4.9,
                    inc: '5-star boutique chalets (7 nights)|Daily breakfast & 3 dinners|First-class rail pass|Helicopter tour|Couples thermal spa',
                    exc: 'Flights|Visa fees|Personal shopping'
                },

                // 13. Paris
                {
                    name: 'Paris Romance & Iconic Landmarks',
                    dest: 'Paris',
                    price: 89999.00,
                    duration: '6 Days / 5 Nights',
                    days: 6,
                    nights: 5,
                    desc: 'Fall in love with Paris: priority Eiffel Tower summit tickets, evening Seine River illuminated cruise with French wine, skip-the-line Louvre Museum pass, and day trip to Palace of Versailles.',
                    short: 'Eiffel Tower summit, Louvre Museum, Seine cruise & Versailles palace.',
                    img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
                    cat: 'honeymoon',
                    rating: 4.8,
                    inc: 'Boutique hotel in central Paris (5 nights)|Daily Parisian breakfast|Eiffel Tower summit|Seine cruise|Louvre pass|Versailles trip',
                    exc: 'Flights|Schengen visa|Lunch & dinner|City tax'
                },
                {
                    name: 'Paris & Disneyland Family Magic',
                    dest: 'Paris',
                    price: 104999.00,
                    duration: '6 Days / 5 Nights',
                    days: 6,
                    nights: 5,
                    desc: 'The perfect family holiday: 2 full days at Disneyland Paris & Walt Disney Studios, plus iconic Paris sightseeing including Arc de Triomphe, Notre-Dame, and chocolate tasting.',
                    short: '2-Day Disneyland Paris adventure + iconic city landmarks for family.',
                    img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
                    cat: 'family',
                    rating: 4.8,
                    inc: 'Disney Hotel (2N) + Paris Hotel (3N)|Daily breakfast|2-Park 2-Day Disney hopper pass|Airport & Disney shuttle|City tour',
                    exc: 'Flights|Visa|Meals at Disney parks'
                },

                // 14. Tokyo
                {
                    name: 'Tokyo Future & Tradition Tour',
                    dest: 'Tokyo',
                    price: 98999.00,
                    duration: '7 Days / 6 Nights',
                    days: 7,
                    nights: 6,
                    desc: 'Experience Japan’s vibrant capital: Senso-ji temple in Asakusa, Shibuya crossing and Harajuku fashion, Akihabara tech hub, day trip to Mount Fuji & Lake Kawaguchi, and authentic ramen tasting.',
                    short: 'Shibuya, Senso-ji temple, Mount Fuji day trip & Japanese gastronomy.',
                    img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
                    cat: 'cultural',
                    rating: 4.8,
                    inc: '4-star Tokyo hotel (6 nights)|Daily breakfast|Mount Fuji & Hakone bullet train day tour|Tokyo Subway Pass|Tea ceremony session',
                    exc: 'International flights|Japan visa|Lunch & dinner'
                },
                {
                    name: 'Japan Adventure & Mount Fuji Trek',
                    dest: 'Tokyo',
                    price: 114999.00,
                    duration: '7 Days / 6 Nights',
                    days: 7,
                    nights: 6,
                    desc: 'An action-packed adventure through Tokyo and the Japanese Alps. Includes go-karting through Tokyo streets, Mount Fuji 5th station hike, samurai sword experience, and robot show.',
                    short: 'Street go-karting, Mount Fuji trek, samurai workshop & onsen hot springs.',
                    img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
                    cat: 'adventure',
                    rating: 4.9,
                    inc: 'Hotel + Traditional Ryokan (6 nights)|Breakfast & 2 Kaiseki dinners|Go-kart pass|Fuji hike guide|Onsen bath experience',
                    exc: 'Flights|International Driving Permit (for kart)|Personal shopping'
                }
            ];

            for (const p of samplePackages) {
                const destId = destMap[p.dest] || null;
                await db.query(`
                    INSERT INTO packages (
                        package_name, name, destination, destination_id,
                        duration, duration_days, duration_nights, price,
                        description, short_desc, image, image_url,
                        category, rating, max_travelers, included, excluded, is_available
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                `, [
                    p.name, p.name, p.dest, destId,
                    p.duration, p.days, p.nights, p.price,
                    p.desc, p.short, p.img, p.img,
                    p.cat, p.rating, 20, p.inc, p.exc
                ]);
            }
            console.log(`✅ Seeded ${samplePackages.length} tour packages successfully!`);
        }

        // 4. Seed Administrators
        const [existingAdmins] = await db.query('SELECT COUNT(*) AS c FROM admins');
        if (existingAdmins[0].c === 0) {
            console.log('🌱 Seeding administrator accounts...');
            const adminPassword = await bcrypt.hash('Admin@123', 10);
            await db.query(`
                INSERT INTO admins (full_name, email, password, role)
                VALUES
                ('SkyTour Superadmin', 'admin@skytour.com', ?, 'superadmin'),
                ('Tour Manager', 'tours@skytour.com', ?, 'admin')
            `, [adminPassword, adminPassword]);
            console.log('✅ Admin accounts created: admin@skytour.com / Admin@123');
        }

        // 5. Seed Demo Customers
        const [existingCusts] = await db.query('SELECT COUNT(*) AS c FROM customers');
        if (existingCusts[0].c === 0) {
            console.log('🌱 Seeding demo customers...');
            const custPassword = await bcrypt.hash('Password123', 10);
            const sampleCustomers = [
                ['John Doe', 'john@example.com', '+91 9876543210', custPassword],
                ['Priya Sharma', 'priya@example.com', '+91 9811223344', custPassword],
                ['Rahul Verma', 'rahul@example.com', '+91 9822334455', custPassword],
                ['Ananya Gupta', 'ananya@example.com', '+91 9833445566', custPassword]
            ];
            for (const c of sampleCustomers) {
                await db.query(`
                    INSERT INTO customers (full_name, email, phone, password)
                    VALUES (?, ?, ?, ?)
                `, c);
            }
            console.log('✅ Demo customers created (Password: Password123)');
        }

        // 6. Seed Sample Bookings (for rich dashboard analytics & history)
        const [existingBookings] = await db.query('SELECT COUNT(*) AS c FROM bookings');
        if (existingBookings[0].c === 0) {
            console.log('🌱 Seeding realistic sample bookings...');
            const [custRows] = await db.query('SELECT id, full_name, email, phone FROM customers ORDER BY id');
            const [pkgRows] = await db.query('SELECT id, name, price, destination FROM packages ORDER BY id');

            if (custRows.length >= 4 && pkgRows.length >= 8) {
                const sampleBookings = [
                    {
                        ref: 'SKY-2026-8812',
                        cust: custRows[0],
                        pkg: pkgRows[4], // Kashmir Valley Paradise
                        travelDate: '2026-12-15',
                        returnDate: '2026-12-21',
                        travelers: 2,
                        total: pkgRows[4].price * 2,
                        status: 'confirmed',
                        special: 'Shikara ride at sunrise preferred.'
                    },
                    {
                        ref: 'SKY-2026-8813',
                        cust: custRows[1],
                        pkg: pkgRows[12], // Bali Island Paradise
                        travelDate: '2026-12-24',
                        returnDate: '2026-12-30',
                        travelers: 2,
                        total: pkgRows[12].price * 2,
                        status: 'pending',
                        special: 'Airport pickup in private vehicle.'
                    },
                    {
                        ref: 'SKY-2026-8814',
                        cust: custRows[2],
                        pkg: pkgRows[14], // Dubai Highlights
                        travelDate: '2027-01-05',
                        returnDate: '2027-01-10',
                        travelers: 1,
                        total: pkgRows[14].price * 1,
                        status: 'confirmed',
                        special: 'Vegetarian meal preference for desert safari.'
                    },
                    {
                        ref: 'SKY-2026-8815',
                        cust: custRows[0],
                        pkg: pkgRows[0], // Goa Beach Escape
                        travelDate: '2026-11-01',
                        returnDate: '2026-11-05',
                        travelers: 2,
                        total: pkgRows[0].price * 2,
                        status: 'completed',
                        special: 'Sea-facing room was requested.'
                    },
                    {
                        ref: 'SKY-2026-8816',
                        cust: custRows[3],
                        pkg: pkgRows[6], // Kerala Backwaters
                        travelDate: '2027-01-20',
                        returnDate: '2027-01-25',
                        travelers: 3,
                        total: pkgRows[6].price * 3,
                        status: 'pending',
                        special: 'Extra bed in houseboat.'
                    },
                    {
                        ref: 'SKY-2026-8817',
                        cust: custRows[1],
                        pkg: pkgRows[18], // Singapore City Wonders
                        travelDate: '2027-02-10',
                        returnDate: '2027-02-15',
                        travelers: 4,
                        total: pkgRows[18].price * 4,
                        status: 'confirmed',
                        special: 'Family connecting rooms requested.'
                    },
                    {
                        ref: 'SKY-2026-8818',
                        cust: custRows[0],
                        pkg: pkgRows[20], // Maldives Overwater Villa
                        travelDate: '2027-03-01',
                        returnDate: '2027-03-06',
                        travelers: 2,
                        total: pkgRows[20].price * 2,
                        status: 'confirmed',
                        special: 'Celebrating 5th anniversary.'
                    },
                    {
                        ref: 'SKY-2026-8819',
                        cust: custRows[2],
                        pkg: pkgRows[2], // Manali Adventure
                        travelDate: '2026-10-10',
                        returnDate: '2026-10-15',
                        travelers: 2,
                        total: pkgRows[2].price * 2,
                        status: 'completed',
                        special: 'Volvo pickup from Majnu ka Tilla.'
                    }
                ];

                for (const b of sampleBookings) {
                    await db.query(`
                        INSERT INTO bookings (
                            booking_ref, customer_id, package_id,
                            customer_name, traveler_name,
                            email, traveler_email,
                            phone, traveler_phone,
                            destination, travel_date, return_date,
                            travelers, num_travelers, total_price,
                            special_requests, message, status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        b.ref, b.cust.id, b.pkg.id,
                        b.cust.full_name, b.cust.full_name,
                        b.cust.email, b.cust.email,
                        b.cust.phone, b.cust.phone,
                        b.pkg.destination, b.travelDate, b.returnDate,
                        b.travelers, b.travelers, b.total,
                        b.special, b.special, b.status
                    ]);
                }
                console.log(`✅ Seeded ${sampleBookings.length} realistic bookings!`);
            }
        }

        // 7. Seed Newsletter Subscribers
        const [existingNews] = await db.query('SELECT COUNT(*) AS c FROM newsletter_subscribers');
        if (existingNews[0].c === 0) {
            console.log('🌱 Seeding sample newsletter subscribers...');
            const sampleSubs = [
                'alex.travels@gmail.com',
                'sara.wanderlust@outlook.com',
                'wanderer.karan@yahoo.com',
                'rohan.voyages@gmail.com',
                'emily.explores@gmail.com'
            ];
            for (const s of sampleSubs) {
                await db.query('INSERT INTO newsletter_subscribers (email) VALUES (?)', [s]).catch(() => {});
            }
            console.log('✅ Newsletter subscribers seeded.');
        }

        // 8. Seed Contact Inquiries
        const [existingMsgs] = await db.query('SELECT COUNT(*) AS c FROM contact_messages');
        if (existingMsgs[0].c === 0) {
            console.log('🌱 Seeding sample contact inquiries...');
            const sampleMessages = [
                ['Vikram Singh', 'vikram@example.com', '+91 9844001122', 'Maldives', 'Hi, we are planning a honeymoon in March. Can you customize the Maldives package with seaplane transfers?'],
                ['Neha Kapoor', 'neha.k@example.com', '+91 9877112233', 'Switzerland', 'Interested in the Swiss Alps tour for a group of 6 adults. Are group discounts available?'],
                ['David Miller', 'david.m@gmail.com', '+44 7700900123', 'Kerala', 'Looking for an authentic 7-day Ayurvedic rejuvenation package in November. Please share details.']
            ];
            for (const m of sampleMessages) {
                await db.query('INSERT INTO contact_messages (name, email, phone, destination, message) VALUES (?, ?, ?, ?, ?)', m);
            }
            console.log('✅ Sample contact inquiries seeded.');
        }

        console.log('🎉 Database verification and seeding complete with full data!');
        return true;
    } catch (err) {
        console.error('⚠️ Database seeder error:', err);
        return false;
    }
}

module.exports = seedDatabase;
