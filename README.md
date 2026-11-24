# SkyTour - Premium Travel & Tour Booking Platform

SkyTour is a modern, full-stack travel booking and tourism management web application built with Node.js, Express, and EJS, featuring a glassmorphism UI, dual database support (SQLite & MySQL), responsive search, interactive tour booking, wishlist, multiple payment gateways, and an admin dashboard.

---

## 🌟 Key Features

- **Glassmorphism UI/UX**: Frosted glass navbar with backdrop blur, smooth navigation, pill badges, and refined typography.
- **Hero & Search Pod**: High-impact hero section with instant search filters by destination, category, and budget.
- **Tour Packages Catalog**: 28+ hand-crafted itineraries across 14 global destinations with tags, ratings, and wishlist toggles.
- **Booking & Checkout Flow**:
  - Live price calculation
  - Multi-payment options: UPI / QR Code, Credit/Debit Card, Net Banking, and Cash on Arrival
  - Instant booking confirmation & downloadable/printable E-Tickets
- **Dual Database Support**:
  - Out-of-the-box zero-setup SQLite (`skytour.sqlite`)
  - Seamless automatic fallback to MySQL if configured
- **User Authentication & Profiles**:
  - Secure bcrypt password hashing & session management
  - Customer profile, booking history, and cancelation system
- **Admin Dashboard**:
  - Manage destinations, packages, bookings, and users
  - Live revenue metrics and stats
- **Automated Test Suite**: 33 unit and end-to-end automated tests with 100% pass rate.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (comes bundled with Node.js)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/deepayadav2006/SKYTour.git
cd SKYTour

# Install dependencies
npm install
```

### 3. Environment Setup (Optional)
The application includes a ready-to-run SQLite database with seed data pre-populated.
If you wish to use MySQL or customize the port, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Run the Application
```bash
npm start
```
Open your browser and visit:
```
http://localhost:3000
```

---

## 🧪 Running Tests

To run the full automated test suite (33 passing tests):
```bash
npm test
```

---

## 👥 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@skytour.com` | `admin123` |
| **Customer** | `aditya@example.com` | `password123` |

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **View Engine**: EJS (Embedded JavaScript templates)
- **Database**: SQLite3 / MySQL (dual support with automatic fallback)
- **Styling**: Vanilla CSS3, Glassmorphism, FontAwesome 6, Google Fonts (Plus Jakarta Sans)
- **Authentication**: Express Session, BcryptJS

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
