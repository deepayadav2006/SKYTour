-- ============================================================
-- SkyTour Database Schema & Complete Seed Data
-- ============================================================

CREATE DATABASE IF NOT EXISTS skytour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skytour;

-- ============================================================
-- TABLE: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: destinations
-- ============================================================
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
);

-- ============================================================
-- TABLE: packages
-- ============================================================
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT,
    package_name VARCHAR(150),
    name VARCHAR(150) NOT NULL,
    destination VARCHAR(100),
    duration VARCHAR(50),
    duration_days INT NOT NULL DEFAULT 3,
    duration_nights INT NOT NULL DEFAULT 2,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    short_desc VARCHAR(300),
    image VARCHAR(500),
    image_url VARCHAR(500),
    included TEXT,
    excluded TEXT,
    rating DECIMAL(2,1) DEFAULT 4.5,
    max_travelers INT DEFAULT 20,
    category ENUM('adventure','luxury','family','budget','honeymoon','cultural') DEFAULT 'adventure',
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_ref VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT,
    package_id INT,
    customer_name VARCHAR(100),
    traveler_name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    traveler_email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    traveler_phone VARCHAR(20) NOT NULL,
    destination VARCHAR(100),
    travel_date DATE NOT NULL,
    return_date DATE,
    travelers INT NOT NULL DEFAULT 1,
    num_travelers INT NOT NULL DEFAULT 1,
    special_requests TEXT,
    message TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE: newsletter_subscribers
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: contact_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    destination VARCHAR(100),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA: Destinations (14 Destinations)
-- ============================================================
INSERT INTO destinations (id, name, country, description, short_desc, image_url, best_time, climate, language, currency) VALUES
(1, 'Goa', 'India', 'India\'s beach paradise with stunning coastlines, Portuguese colonial architecture, vibrant nightlife, and water sports along Baga, Calangute and Palolem beaches.', 'India\'s beach paradise with golden sands, nightlife & heritage.', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', 'November to February', 'Tropical', 'Konkani, English, Hindi', 'Indian Rupee (INR)'),
(2, 'Manali', 'India', 'Breathtaking hill station in the Himalayas of Himachal Pradesh, known for snow-capped peaks, Solang Valley paragliding, Rohtang Pass, and riverside camping.', 'Himalayan paradise for adventure lovers with snow peaks & valleys.', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', 'October to June', 'Alpine', 'Hindi, Pahari', 'Indian Rupee (INR)'),
(3, 'Kashmir', 'India', 'Paradise on Earth, famous for Dal Lake shikara rides, snow-covered Gulmarg ski slopes, Mughal gardens of Srinagar, and scenic valleys of Pahalgam.', 'Paradise on Earth with Dal Lake, Mughal gardens & snow peaks.', 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80', 'March to November', 'Temperate', 'Kashmiri, Urdu, Hindi', 'Indian Rupee (INR)'),
(4, 'Kerala', 'India', 'God\'s Own Country, featuring serene backwater houseboats in Alleppey, rolling green tea hills of Munnar, wildlife in Periyar, and authentic Ayurvedic wellness.', 'God\'s Own Country with backwaters, houseboats & Ayurveda.', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 'September to March', 'Tropical', 'Malayalam, English', 'Indian Rupee (INR)'),
(5, 'Rajasthan', 'India', 'Land of Maharajas featuring royal palaces in Jaipur, romantic lakes in Udaipur, majestic Mehrangarh Fort in Jodhpur, and golden desert dunes in Jaisalmer.', 'Royal heritage, majestic desert forts & opulent lakeside palaces.', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80', 'October to March', 'Semi-Arid', 'Hindi, Rajasthani', 'Indian Rupee (INR)'),
(6, 'Andaman Islands', 'India', 'Tropical archipelago with turquoise waters, world-famous Radhanagar beach, vibrant coral reefs for scuba diving, and historic Cellular Jail in Port Blair.', 'Exotic turquoise waters, white sand beaches & marine coral reefs.', 'https://images.unsplash.com/photo-1589136777351-fdc9c9cab193?w=800&q=80', 'October to May', 'Tropical Maritime', 'Hindi, Bengali, English', 'Indian Rupee (INR)'),
(7, 'Bali', 'Indonesia', 'Island of the Gods with dramatic volcanic landscapes, iconic Hindu sea temples like Tanah Lot, lush Tegalalang rice terraces, and chic beach clubs in Seminyak.', 'Island of Gods with clifftop temples, rice terraces & surf beaches.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', 'April to October', 'Tropical', 'Balinese, Indonesian, English', 'Indonesian Rupiah (IDR)'),
(8, 'Dubai', 'United Arab Emirates', 'Futuristic desert metropolis featuring Burj Khalifa, Dubai Mall fountain spectacles, thrilling desert safaris with dune bashing, and luxury marina yacht cruises.', 'City of superlatives with skyscrapers, luxury & desert adventures.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', 'November to March', 'Arid/Desert', 'Arabic, English', 'UAE Dirham (AED)'),
(9, 'Thailand', 'Thailand', 'The Land of Smiles offering vibrant Bangkok street life and Grand Palace, Phuket turquoise beaches, Phi Phi Island boat tours, and world-renowned Thai cuisine.', 'Land of Smiles with ornate temples, limestone islands & night markets.', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80', 'November to April', 'Tropical', 'Thai, English', 'Thai Baht (THB)'),
(10, 'Singapore', 'Singapore', 'Modern Asian hub showcasing Marina Bay Sands, futuristic Gardens by the Bay Supertrees, Universal Studios Sentosa, and world-class street food havens.', 'Dazzling city-state of cultures, cuisine & futuristic architecture.', 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80', 'February to April', 'Tropical', 'English, Mandarin, Malay', 'Singapore Dollar (SGD)'),
(11, 'Maldives', 'Maldives', 'The ultimate luxury island getaway with overwater private villas perched atop clear blue lagoons, vibrant coral atolls, and breathtaking sunsets.', 'Ultimate luxury with turquoise lagoons, overwater villas & coral reefs.', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80', 'November to April', 'Tropical', 'Dhivehi, English', 'Maldivian Rufiyaa (MVR)'),
(12, 'Switzerland', 'Switzerland', 'Heart of the Swiss Alps featuring majestic Jungfraujoch, crystal lakes of Lucerne and Geneva, scenic alpine train journeys, and picturesque mountain chalets.', 'Majestic Swiss Alps, glacier peaks, scenic trains & chocolate.', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80', 'May to October & Dec to Mar', 'Temperate Alpine', 'German, French, English', 'Swiss Franc (CHF)'),
(13, 'Paris', 'France', 'The City of Light known for the iconic Eiffel Tower, world-renowned Louvre art treasures, romantic Seine River cruises, and historic Montmartre cafes.', 'The City of Light with Eiffel Tower, art museums & French cafes.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', 'April to October', 'Temperate', 'French, English', 'Euro (EUR)'),
(14, 'Tokyo', 'Japan', 'Electrifying fusion of ultra-modern technology and timeless tradition — from neon-lit Shibuya Crossing and Akihabara to tranquil Senso-ji temple and Mount Fuji.', 'Vibrant metropolis blending futuristic tech, historic temples & food.', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80', 'March to May & Sep to Nov', 'Temperate', 'Japanese, English', 'Japanese Yen (JPY)');

-- ============================================================
-- SEED DATA: Packages (28 Packages)
-- ============================================================
INSERT INTO packages (destination_id, package_name, name, destination, duration, duration_days, duration_nights, price, description, short_desc, image, image_url, included, excluded, rating, max_travelers, category, is_available) VALUES
(1, 'Goa Beach Escape', 'Goa Beach Escape', 'Goa', '4 Days / 3 Nights', 4, 3, 12999.00, 'Experience the magic of Goa with our premium 4-day beach getaway. Stay at a beachfront resort in North Goa, enjoy parasailing and jet-skiing at Baga, explore Aguada Fort, and savor authentic seafood curries.', 'Premium beach getaway with water sports & beachfront resort.', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', 'Resort stay (3 nights)|Daily buffet breakfast|Airport/railway transfers|Water sports session|South Goa heritage tour', 'Flight tickets|Lunch & dinner|Personal expenses|Alcoholic drinks', 4.6, 20, 'budget', 1),
(1, 'Goa Luxury Villa Retreat', 'Goa Luxury Villa Retreat', 'Goa', '5 Days / 4 Nights', 5, 4, 45999.00, 'Indulge in a 5-star beachfront private pool villa in South Goa. Includes private catamaran sunset cruise on the Arabian Sea, curated couples spa therapy, and private chauffeur-driven luxury vehicle.', 'Ultra-luxury resort & spa experience with private beach access.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', '5-star luxury villa (4 nights)|All gourmet meals|Private airport transfer|Sunset yacht cruise|Spa package', 'Flights|Imported beverages|Shopping', 4.9, 10, 'luxury', 1),
(2, 'Manali Adventure Expedition', 'Manali Adventure Expedition', 'Manali', '5 Days / 4 Nights', 5, 4, 15999.00, 'Embark on a thrilling mountain adventure featuring Solang Valley paragliding, snow activities at Rohtang Pass, riverside camping along the Beas River, and scenic trek to Jogini Waterfalls.', 'Himalayan adventure with trekking, paragliding & snow activities.', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', 'Mountain view hotel (4 nights)|Breakfast & dinner|Volvo transfers from Delhi|Solang Valley tour|Paragliding ticket', 'Rohtang special permit fee|Lunch|Personal expenses', 4.7, 15, 'adventure', 1),
(2, 'Manali Scenic Family Holiday', 'Manali Scenic Family Holiday', 'Manali', '6 Days / 5 Nights', 6, 5, 22999.00, 'A family-friendly vacation across the Kullu valley. Enjoy apple orchard walks, Hadimba temple visit, hot sulphur springs at Vashisht, Naggar Castle art museum, and serene valley viewpoints.', 'Family-friendly Manali with scenic valleys & comfortable stays.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Family suite (5 nights)|All breakfasts & dinners|Private cab for sightseeing|Naggar Castle visit', 'Airfare|Personal shopping|Lunches', 4.5, 25, 'family', 1),
(3, 'Kashmir Valley Paradise', 'Kashmir Valley Paradise', 'Kashmir', '6 Days / 5 Nights', 6, 5, 22999.00, 'Witness paradise on Earth — stay in a traditional cedar houseboat on Dal Lake, sunrise shikara ride, Gulmarg gondola ride to Phase 1 snow peaks, and Betaab Valley exploration in Pahalgam.', 'Complete Kashmir experience with Dal Lake shikara & Gulmarg gondola.', 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80', 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80', 'Luxury houseboat (1N) + Hotel (4N)|Breakfast & dinner|Shikara ride|Gulmarg & Pahalgam transfers', 'Flights|Gondola Phase 2 tickets|Pony rides', 4.8, 20, 'cultural', 1),
(3, 'Kashmir Honeymoon Special', 'Kashmir Honeymoon Special', 'Kashmir', '7 Days / 6 Nights', 7, 6, 38999.00, 'Crafted exclusively for couples: private shikara decorated with fresh flowers, romantic candlelit dinner overlooking Dal Lake, luxury boutique resort stays, and horse riding in Pahalgam.', 'Romantic Kashmir with luxury houseboat & candlelit experiences.', 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&q=80', 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&q=80', 'Houseboat + 4-star stays (6 nights)|All meals|Flower bed decoration|Candlelight dinner|Chauffeur driven cab', 'Flights|Personal shopping', 4.9, 8, 'honeymoon', 1),
(4, 'Kerala Backwaters & Tea Gardens', 'Kerala Backwaters & Tea Gardens', 'Kerala', '5 Days / 4 Nights', 5, 4, 18999.00, 'Cruise through Alleppey backwaters on an authentic private houseboat, explore rolling tea plantations and waterfalls in Munnar, and visit Eravikulam National Park.', 'Houseboat cruise, tea gardens & authentic Ayurveda retreat.', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 'Deluxe houseboat (1N) + Resort (3N)|Daily breakfast|All meals on houseboat|Private cab transfers|Tea museum entry', 'Airfare|Ayurvedic massage charges|Lunch on hotel days', 4.6, 20, 'cultural', 1),
(4, 'Kerala Ayurvedic Luxury Retreat', 'Kerala Ayurvedic Luxury Retreat', 'Kerala', '7 Days / 6 Nights', 7, 6, 54999.00, 'An authentic rejuvenating wellness retreat with daily Ayurvedic massage sessions, 5-star clifftop resort in Kovalam, private pool villa, and organic gourmet cuisine.', 'Holistic Ayurveda wellness retreat with 5-star beachfront villas.', 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800&q=80', 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800&q=80', '5-star wellness resort (6 nights)|All Ayurvedic organic meals|Daily consultation & therapies|Yoga sessions|Transfers', 'Flights|Extra specialized medicines', 4.9, 8, 'luxury', 1),
(5, 'Royal Rajasthan Heritage', 'Royal Rajasthan Heritage', 'Rajasthan', '6 Days / 5 Nights', 6, 5, 24999.00, 'Explore the Pink City Jaipur, majestic Amer Fort with elephant view, City Palace, Hawa Mahal, and romantic lake city Udaipur with boat ride on Lake Pichola.', 'Grand forts, royal palaces & romantic lakes of Jaipur & Udaipur.', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80', 'Heritage haveli hotels (5 nights)|Breakfast & dinner|AC Sedan transfers|Monument entries|Lake Pichola boat ride', 'Airfare|Camera fees at monuments|Lunches', 4.8, 15, 'cultural', 1),
(5, 'Thar Desert Safari & Camp', 'Thar Desert Safari & Camp', 'Rajasthan', '4 Days / 3 Nights', 4, 3, 16999.00, 'Experience the golden city of Jaisalmer, overnight luxury desert camping in Sam Dunes, camel safari during sunset, Rajasthani folk dance, and star gazing.', 'Overnight desert camp, camel safari & Rajasthani cultural evening.', 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80', 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80', 'Swiss desert tent (1N) + Hotel (2N)|All meals in camp|Camel safari|Folk dance show|Jeep dune bashing', 'Train/Flight tickets|Personal shopping', 4.7, 20, 'adventure', 1),
(6, 'Andaman Coral Scuba Explorer', 'Andaman Coral Scuba Explorer', 'Andaman Islands', '5 Days / 4 Nights', 5, 4, 26999.00, 'Discover Port Blair Cellular Jail light & sound show, high-speed cruise to Havelock Island, world-famous Radhanagar Beach sunset, and scuba diving at Elephant Beach.', 'Havelock Island beaches, scuba diving & coral reef adventures.', 'https://images.unsplash.com/photo-1589136777351-fdc9c9cab193?w=800&q=80', 'https://images.unsplash.com/photo-1589136777351-fdc9c9cab193?w=800&q=80', 'Beach resorts (4 nights)|Daily breakfast|Makruzz luxury ferry tickets|Introductory scuba dive with photos|All cab transfers', 'Flights to Port Blair|Water sports beyond package|Lunch & dinner', 4.8, 15, 'adventure', 1),
(6, 'Andaman Island Honeymoon', 'Andaman Island Honeymoon', 'Andaman Islands', '6 Days / 5 Nights', 6, 5, 44999.00, 'Romantic island escape featuring beachfront luxury cottages, candlelight beach dinner, private sunset cruise, Neil Island natural rock bridge, and snorkelling.', 'Romantic island retreat with private beach dinner & luxury cruise.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', '5-star beach resort (5 nights)|Breakfast & dinner|Beach candlelight dinner|Private cab|Ferry tickets|Couple spa', 'Flights|Personal shopping', 4.9, 8, 'honeymoon', 1),
(7, 'Bali Island Paradise & Temples', 'Bali Island Paradise & Temples', 'Bali', '6 Days / 5 Nights', 6, 5, 45999.00, 'Explore Ubud rice terraces, Sacred Monkey Forest, Tanah Lot sea temple sunset, white-water rafting on Ayung River, and lively Seminyak beach clubs.', 'Complete Bali with temples, rice terraces & beach clubs.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', '4-star resort stay (5 nights)|Daily breakfast|Airport transfers|Ubud tour|Ayung rafting with lunch|Tanah Lot sunset', 'International flights|Visa on arrival|Personal expenses', 4.7, 20, 'cultural', 1),
(7, 'Bali Honeymoon Private Villa', 'Bali Honeymoon Private Villa', 'Bali', '7 Days / 6 Nights', 7, 6, 72999.00, 'Exclusive private pool villa in Seminyak, clifftop couple massage overlooking the Indian Ocean, romantic Jimbaran seafood sunset dinner, and Nusa Penida speed boat tour.', 'Romantic Bali with private pool villa & clifftop spa.', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80', 'Private pool villa (6 nights)|All breakfasts|Floating breakfast experience|Couples spa|Jimbaran beach dinner|Nusa Penida speed boat', 'International flights|Shopping', 4.9, 6, 'honeymoon', 1),
(8, 'Dubai Highlights & Desert Safari', 'Dubai Highlights & Desert Safari', 'Dubai', '5 Days / 4 Nights', 5, 4, 55999.00, 'Ascend Burj Khalifa 124th floor, watch Dubai Mall fountain show, thrilling desert safari with 4x4 dune bashing and BBQ buffet, and Marina dhow dinner cruise.', 'Iconic Dubai with Burj Khalifa, desert safari & dhow cruise.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', '4-star hotel stay (4 nights)|Daily breakfast|Burj Khalifa tickets|Desert safari with BBQ dinner|Dhow cruise dinner|Airport transfers', 'Flights|UAE visa fee|Tourism dirham fee|Personal shopping', 4.7, 20, 'luxury', 1),
(8, 'Dubai Ultra-Luxury Burj Escape', 'Dubai Ultra-Luxury Burj Escape', 'Dubai', '6 Days / 5 Nights', 6, 5, 149999.00, 'Stay at the iconic 7-star Burj Al Arab, take a private helicopter tour over The Palm, enjoy a private yacht cruise with chef dining, and VIP desert safari.', 'Burj Al Arab suite, private yacht & helicopter tour over Palm Jumeirah.', 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&q=80', 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&q=80', 'Burj Al Arab + 5-star (5 nights)|All gourmet meals|Private Rolls-Royce transfers|Helicopter tour|Yacht cruise|VIP safari', 'Flights|Personal shopping', 5.0, 6, 'luxury', 1),
(9, 'Thailand Explorer: Bangkok & Phuket', 'Thailand Explorer: Bangkok & Phuket', 'Thailand', '7 Days / 6 Nights', 7, 6, 42999.00, 'The best of Thailand: Bangkok Grand Palace, Chao Phraya dinner cruise, Phi Phi Island speedboat tour with snorkelling, and Phuket nightlife & beaches.', 'Complete Thailand from Bangkok temples to Phuket beaches.', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80', 'Hotels (6 nights)|Daily breakfast|Bangkok city tour|Phi Phi Island speedboat tour|Transfers', 'International flights|National park fee|Water sports', 4.6, 20, 'cultural', 1),
(9, 'Phuket Beach & Islands Getaway', 'Phuket Beach & Islands Getaway', 'Thailand', '5 Days / 4 Nights', 5, 4, 32999.00, 'Sun, sand, and turquoise waters — stay at a beachfront resort in Patong, explore James Bond Island by canoe, enjoy authentic Thai massage and fresh seafood.', 'Beachfront resort, James Bond Island tour & authentic Thai massage.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 'Beach resort (4 nights)|Daily breakfast|James Bond island tour with lunch|Airport transfers|Thai massage session', 'Flights|Personal shopping|Lunches', 4.5, 20, 'budget', 1),
(10, 'Singapore City Wonders', 'Singapore City Wonders', 'Singapore', '5 Days / 4 Nights', 5, 4, 48999.00, 'Explore Marina Bay Sands Skypark, Gardens by the Bay Flower Dome & Cloud Forest, Sentosa Island cable car, and Universal Studios Singapore.', 'Singapore highlights with Marina Bay, Sentosa & Universal Studios.', 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80', 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80', '4-star city hotel (4 nights)|Daily breakfast|Airport transfers|Universal Studios 1-day pass|Gardens by the Bay pass|Sentosa ticket', 'Flights|Visa|Personal expenses', 4.8, 20, 'family', 1),
(10, 'Singapore Family Extravaganza', 'Singapore Family Extravaganza', 'Singapore', '6 Days / 5 Nights', 6, 5, 68999.00, 'The ultimate family adventure: Singapore Zoo with jungle breakfast, Night Safari tram ride, S.E.A. Aquarium, Universal Studios, and Sentosa water park.', 'Family fun with Universal Studios, Singapore Zoo & Night Safari.', 'https://images.unsplash.com/photo-1555217851-6141535bd771?w=800&q=80', 'https://images.unsplash.com/photo-1555217851-6141535bd771?w=800&q=80', 'Family hotel (5 nights)|Breakfast & dinner|All park combo tickets|Private transfers|Night safari VIP tram', 'Flights|Lunch|Shopping', 4.9, 15, 'family', 1),
(11, 'Maldives Overwater Villa Luxury', 'Maldives Overwater Villa Luxury', 'Maldives', '5 Days / 4 Nights', 5, 4, 99999.00, 'Live the dream in an overwater villa with direct ladder access into turquoise ocean. Includes speedboat transfer from Male, all-inclusive gourmet dining, and guided reef snorkelling.', 'Overwater luxury villa, turquoise lagoon & all-inclusive dining.', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80', 'Overwater villa (4 nights)|All-inclusive dining & drinks|Speedboat transfers|Reef snorkelling safari|Spa credit', 'International flights|Scuba diving courses|Motorized water sports', 4.9, 8, 'luxury', 1),
(11, 'Maldives Honeymoon Romance', 'Maldives Honeymoon Romance', 'Maldives', '6 Days / 5 Nights', 6, 5, 139999.00, 'The pinnacle of romance: private water villa with infinity pool, sunset dolphin cruise with champagne, sandbank picnic for two, and couples oceanfront massage.', 'Private infinity pool water villa, dolphin cruise & sandbank picnic.', 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80', 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80', 'Pool water villa (5 nights)|All meals & sparkling wine|Seaplane transfers|Dolphin cruise|Sandbank lunch|Couples spa', 'International flights|Shopping', 5.0, 6, 'honeymoon', 1),
(12, 'Swiss Alps & Glacier Express', 'Swiss Alps & Glacier Express', 'Switzerland', '7 Days / 6 Nights', 7, 6, 119999.00, 'Journey through Switzerland: Zurich city walk, Lake Lucerne cruise, Jungfraujoch "Top of Europe" cogwheel train to 3,454m, and scenic Glacier Express train to Zermatt.', 'Jungfraujoch Top of Europe, Swiss Alps rail pass & scenic lakes.', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80', '4-star Alpine hotels (6 nights)|Daily Swiss breakfast|8-day Swiss Travel Pass|Jungfraujoch summit ticket|Glacier train seat', 'Flights|Visa fees|Lunch & dinner|Personal expenses', 4.9, 15, 'cultural', 1),
(12, 'Swiss Alpine Honeymoon Bliss', 'Swiss Alpine Honeymoon Bliss', 'Switzerland', '8 Days / 7 Nights', 8, 7, 159999.00, 'Boutique chalet stays in Interlaken and Zermatt with Matterhorn views, private fondue dinner, thermal spa in the mountains, and helicopter sightseeing over glaciers.', 'Romantic chalet stays with Matterhorn view & glacier helicopter flight.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', '5-star boutique chalets (7 nights)|Daily breakfast & 3 dinners|First-class rail pass|Helicopter tour|Couples thermal spa', 'Flights|Visa fees|Personal shopping', 4.9, 6, 'honeymoon', 1),
(13, 'Paris Romance & Iconic Landmarks', 'Paris Romance & Iconic Landmarks', 'Paris', '6 Days / 5 Nights', 6, 5, 89999.00, 'Fall in love with Paris: priority Eiffel Tower summit tickets, evening Seine River illuminated cruise with French wine, skip-the-line Louvre Museum pass, and day trip to Palace of Versailles.', 'Eiffel Tower summit, Louvre Museum, Seine cruise & Versailles palace.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', 'Boutique hotel in central Paris (5 nights)|Daily Parisian breakfast|Eiffel Tower summit|Seine cruise|Louvre pass|Versailles trip', 'Flights|Schengen visa|Lunch & dinner|City tax', 4.8, 12, 'honeymoon', 1),
(13, 'Paris & Disneyland Family Magic', 'Paris & Disneyland Family Magic', 'Paris', '6 Days / 5 Nights', 6, 5, 104999.00, 'The perfect family holiday: 2 full days at Disneyland Paris & Walt Disney Studios, plus iconic Paris sightseeing including Arc de Triomphe, Notre-Dame, and chocolate tasting.', '2-Day Disneyland Paris adventure + iconic city landmarks for family.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', 'Disney Hotel (2N) + Paris Hotel (3N)|Daily breakfast|2-Park 2-Day Disney hopper pass|Airport & Disney shuttle|City tour', 'Flights|Visa|Meals at Disney parks', 4.8, 15, 'family', 1),
(14, 'Tokyo Future & Tradition Tour', 'Tokyo Future & Tradition Tour', 'Tokyo', '7 Days / 6 Nights', 7, 6, 98999.00, 'Experience Japan’s vibrant capital: Senso-ji temple in Asakusa, Shibuya crossing and Harajuku fashion, Akihabara tech hub, day trip to Mount Fuji & Lake Kawaguchi, and authentic ramen tasting.', 'Shibuya, Senso-ji temple, Mount Fuji day trip & Japanese gastronomy.', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80', '4-star Tokyo hotel (6 nights)|Daily breakfast|Mount Fuji & Hakone bullet train day tour|Tokyo Subway Pass|Tea ceremony session', 'International flights|Japan visa|Lunch & dinner', 4.8, 16, 'cultural', 1),
(14, 'Japan Adventure & Mount Fuji Trek', 'Japan Adventure & Mount Fuji Trek', 'Tokyo', '7 Days / 6 Nights', 7, 6, 114999.00, 'An action-packed adventure through Tokyo and the Japanese Alps. Includes go-karting through Tokyo streets, Mount Fuji 5th station hike, samurai sword experience, and robot show.', 'Street go-karting, Mount Fuji trek, samurai workshop & onsen hot springs.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', 'Hotel + Traditional Ryokan (6 nights)|Breakfast & 2 Kaiseki dinners|Go-kart pass|Fuji hike guide|Onsen bath experience', 'Flights|International Driving Permit (for kart)|Personal shopping', 4.9, 12, 'adventure', 1);

-- ============================================================
-- SEED DATA: Admins (Password: Admin@123)
-- ============================================================
INSERT INTO admins (id, full_name, email, password, role) VALUES
(1, 'SkyTour Superadmin', 'admin@skytour.com', '$2b$10$rOiDGPjVCfUDPXFWoU3JCedOzxOA5VYzfNmE8TM4A.RuNDCvRvBkC', 'superadmin'),
(2, 'Tour Manager', 'tours@skytour.com', '$2b$10$rOiDGPjVCfUDPXFWoU3JCedOzxOA5VYzfNmE8TM4A.RuNDCvRvBkC', 'admin');

-- ============================================================
-- SEED DATA: Customers (Password: Password123)
-- ============================================================
INSERT INTO customers (id, full_name, email, phone, password) VALUES
(1, 'John Doe', 'john@example.com', '+91 9876543210', '$2b$10$77T3W1L94B4E3i9l/jJbYegR/JjY73xXy9h1gGqjWc0aYqWb8jH12'),
(2, 'Priya Sharma', 'priya@example.com', '+91 9811223344', '$2b$10$77T3W1L94B4E3i9l/jJbYegR/JjY73xXy9h1gGqjWc0aYqWb8jH12'),
(3, 'Rahul Verma', 'rahul@example.com', '+91 9822334455', '$2b$10$77T3W1L94B4E3i9l/jJbYegR/JjY73xXy9h1gGqjWc0aYqWb8jH12'),
(4, 'Ananya Gupta', 'ananya@example.com', '+91 9833445566', '$2b$10$77T3W1L94B4E3i9l/jJbYegR/JjY73xXy9h1gGqjWc0aYqWb8jH12');

-- ============================================================
-- SEED DATA: Bookings (Realistic sample bookings)
-- ============================================================
INSERT INTO bookings (booking_ref, customer_id, package_id, customer_name, traveler_name, email, traveler_email, phone, traveler_phone, destination, travel_date, return_date, travelers, num_travelers, total_price, special_requests, message, status) VALUES
('SKY-2026-8812', 1, 5, 'John Doe', 'John Doe', 'john@example.com', 'john@example.com', '+91 9876543210', '+91 9876543210', 'Kashmir', '2026-12-15', '2026-12-21', 2, 2, 45998.00, 'Shikara ride at sunrise preferred.', 'Shikara ride at sunrise preferred.', 'confirmed'),
('SKY-2026-8813', 2, 13, 'Priya Sharma', 'Priya Sharma', 'priya@example.com', 'priya@example.com', '+91 9811223344', '+91 9811223344', 'Bali', '2026-12-24', '2026-12-30', 2, 2, 91998.00, 'Airport pickup in private vehicle.', 'Airport pickup in private vehicle.', 'pending'),
('SKY-2026-8814', 3, 15, 'Rahul Verma', 'Rahul Verma', 'rahul@example.com', 'rahul@example.com', '+91 9822334455', '+91 9822334455', 'Dubai', '2027-01-05', '2027-01-10', 1, 1, 55999.00, 'Vegetarian meal preference for desert safari.', 'Vegetarian meal preference for desert safari.', 'confirmed'),
('SKY-2026-8815', 1, 1, 'John Doe', 'John Doe', 'john@example.com', 'john@example.com', '+91 9876543210', '+91 9876543210', 'Goa', '2026-11-01', '2026-11-05', 2, 2, 25998.00, 'Sea-facing room was requested.', 'Sea-facing room was requested.', 'completed'),
('SKY-2026-8816', 4, 7, 'Ananya Gupta', 'Ananya Gupta', 'ananya@example.com', 'ananya@example.com', '+91 9833445566', '+91 9833445566', 'Kerala', '2027-01-20', '2027-01-25', 3, 3, 56997.00, 'Extra bed in houseboat.', 'Extra bed in houseboat.', 'pending'),
('SKY-2026-8817', 2, 19, 'Priya Sharma', 'Priya Sharma', 'priya@example.com', 'priya@example.com', '+91 9811223344', '+91 9811223344', 'Singapore', '2027-02-10', '2027-02-15', 4, 4, 195996.00, 'Family connecting rooms requested.', 'Family connecting rooms requested.', 'confirmed'),
('SKY-2026-8818', 1, 21, 'John Doe', 'John Doe', 'john@example.com', 'john@example.com', '+91 9876543210', '+91 9876543210', 'Maldives', '2027-03-01', '2027-03-06', 2, 2, 199998.00, 'Celebrating 5th anniversary.', 'Celebrating 5th anniversary.', 'confirmed'),
('SKY-2026-8819', 3, 3, 'Rahul Verma', 'Rahul Verma', 'rahul@example.com', 'rahul@example.com', '+91 9822334455', '+91 9822334455', 'Manali', '2026-10-10', '2026-10-15', 2, 2, 31998.00, 'Volvo pickup from Majnu ka Tilla.', 'Volvo pickup from Majnu ka Tilla.', 'completed');

-- ============================================================
-- SEED DATA: Newsletter Subscribers
-- ============================================================
INSERT INTO newsletter_subscribers (email) VALUES
('alex.travels@gmail.com'),
('sara.wanderlust@outlook.com'),
('wanderer.karan@yahoo.com'),
('rohan.voyages@gmail.com'),
('emily.explores@gmail.com');

-- ============================================================
-- SEED DATA: Contact Inquiries
-- ============================================================
INSERT INTO contact_messages (name, email, phone, destination, message) VALUES
('Vikram Singh', 'vikram@example.com', '+91 9844001122', 'Maldives', 'Hi, we are planning a honeymoon in March. Can you customize the Maldives package with seaplane transfers?'),
('Neha Kapoor', 'neha.k@example.com', '+91 9877112233', 'Switzerland', 'Interested in the Swiss Alps tour for a group of 6 adults. Are group discounts available?'),
('David Miller', 'david.m@gmail.com', '+44 7700900123', 'Kerala', 'Looking for an authentic 7-day Ayurvedic rejuvenation package in November. Please share details.');
