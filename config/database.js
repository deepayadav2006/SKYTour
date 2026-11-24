const path = require('path');
const fs = require('fs');
const os = require('os');
const mysql = require('mysql2');
require('dotenv').config();

let activeEngine = null; // 'mysql' | 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

// Determine writable SQLite file path (supports Vercel, AWS Lambda, serverless environments)
function getSQLitePath() {
    if (process.env.SQLITE_PATH) return process.env.SQLITE_PATH;

    const sourcePath = path.join(__dirname, '..', 'skytour.sqlite');

    // On serverless platforms (Vercel, AWS Lambda, Netlify), the project root is strictly read-only.
    // The only writable directory is os.tmpdir() (/tmp).
    const isServerless = Boolean(
        process.env.VERCEL ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.LAMBDA_TASK_ROOT ||
        process.env.NETLIFY
    );

    if (isServerless) {
        const tmpPath = path.join(os.tmpdir(), 'skytour.sqlite');
        try {
            if (!fs.existsSync(tmpPath)) {
                if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, tmpPath);
                    console.log('📦 Copied pre-seeded SQLite database to writable serverless storage:', tmpPath);
                }
            }
            try {
                fs.chmodSync(tmpPath, 0o666);
            } catch (_) {}
            return tmpPath;
        } catch (e) {
            console.warn('⚠️ Could not copy sqlite database to tmpdir:', e.message);
        }
    }

    return sourcePath;
}

// Initialize SQLite database
function initSQLite() {
    if (sqliteDb) return sqliteDb;

    const { DatabaseSync } = require('node:sqlite');
    const dbPath = getSQLitePath();
    sqliteDb = new DatabaseSync(dbPath);

    // Register MySQL-compatible scalar functions in SQLite
    sqliteDb.function('CURDATE', () => new Date().toISOString().split('T')[0]);
    sqliteDb.function('NOW', () => new Date().toISOString());
    sqliteDb.function('CONCAT', (...args) => args.filter(a => a !== null && a !== undefined).join(''));
    sqliteDb.function('SUBSTRING', (str, pos, len) => {
        if (!str) return '';
        const start = Math.max(0, (pos || 1) - 1);
        return len !== undefined ? str.substring(start, start + len) : str.substring(start);
    });

    // Create schema if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS destinations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            country TEXT NOT NULL,
            description TEXT,
            short_desc TEXT,
            image_url TEXT,
            best_time TEXT,
            climate TEXT,
            language TEXT,
            currency TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            destination_id INTEGER,
            package_name TEXT,
            name TEXT,
            destination TEXT,
            duration TEXT,
            duration_days INTEGER DEFAULT 3,
            duration_nights INTEGER DEFAULT 2,
            price REAL DEFAULT 0.00,
            description TEXT,
            short_desc TEXT,
            image TEXT,
            image_url TEXT,
            category TEXT DEFAULT 'adventure',
            rating REAL DEFAULT 4.5,
            max_travelers INTEGER DEFAULT 20,
            included TEXT,
            excluded TEXT,
            is_available INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            password TEXT NOT NULL,
            profile_pic TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_ref TEXT UNIQUE,
            customer_id INTEGER,
            package_id INTEGER,
            customer_name TEXT,
            traveler_name TEXT,
            email TEXT,
            traveler_email TEXT,
            phone TEXT,
            traveler_phone TEXT,
            destination TEXT,
            travel_date TEXT,
            return_date TEXT,
            travelers INTEGER DEFAULT 1,
            num_travelers INTEGER DEFAULT 1,
            total_price REAL DEFAULT 0.00,
            special_requests TEXT,
            message TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            destination TEXT,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Ensure payment columns exist on bookings
    function ensureColumnSQLite(table, col, typeDef) {
        try {
            const cols = sqliteDb.prepare(`PRAGMA table_info(${table})`).all();
            if (!cols.some(c => c.name.toLowerCase() === col.toLowerCase())) {
                sqliteDb.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${typeDef}`);
            }
        } catch (e) {
            console.warn(`Could not add column ${col} to ${table}:`, e.message);
        }
    }

    ensureColumnSQLite('bookings', 'payment_mode', "TEXT DEFAULT 'card'");
    ensureColumnSQLite('bookings', 'payment_status', "TEXT DEFAULT 'pending'");
    ensureColumnSQLite('bookings', 'transaction_id', 'TEXT DEFAULT NULL');
    ensureColumnSQLite('bookings', 'paid_amount', 'REAL DEFAULT 0.00');
    ensureColumnSQLite('customers', 'name', 'TEXT DEFAULT NULL');

    activeEngine = 'sqlite';
    return sqliteDb;
}

// Attempt MySQL connection setup
const isCloudHost = Boolean(process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1');

try {
    const poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'skytour',
        connectTimeout: isCloudHost ? 10000 : 1500,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };

    // Enable SSL if explicitly configured or when connecting to cloud MySQL
    if (process.env.DB_SSL === 'true' || isCloudHost) {
        poolConfig.ssl = { rejectUnauthorized: false };
    }

    mysqlPool = mysql.createPool(poolConfig);

    mysqlPool.getConnection((err, connection) => {
        if (err) {
            console.log('ℹ️ MySQL not connected (' + (err.code || err.message) + '). Using embedded persistent SQLite storage (skytour.sqlite).');
            initSQLite();
        } else {
            activeEngine = 'mysql';
            console.log('✅ SkyTour MySQL database connected successfully!');
            connection.release();
        }
    });
} catch (e) {
    console.log('ℹ️ Initializing embedded persistent SQLite storage (skytour.sqlite)...');
    initSQLite();
}

// Ensure at least SQLite is ready synchronously as default
if (!activeEngine) {
    initSQLite();
}

// Clean parameter list for SQLite/MySQL compatibility
function cleanParams(params) {
    if (!params) return [];
    if (!Array.isArray(params)) params = [params];
    return params.map(p => {
        if (p === undefined) return null;
        if (typeof p === 'boolean') return p ? 1 : 0;
        return p;
    });
}

// Unified query wrapper
async function query(sql, params) {
    // If MySQL is active, delegate directly to MySQL pool
    if (activeEngine === 'mysql' && mysqlPool) {
        try {
            return await mysqlPool.promise().query(sql, params);
        } catch (err) {
            // If MySQL dropped or failed, fallback to SQLite
            console.warn('MySQL query error, switching to SQLite fallback:', err.message);
            initSQLite();
        }
    }

    // SQLite engine execution
    const sdb = initSQLite();
    let normalizedSql = sql.trim();

    // Map MySQL specific constructs to SQLite
    normalizedSql = normalizedSql.replace(/INSERT\s+IGNORE\s+INTO/gi, 'INSERT OR IGNORE INTO');

    const paramsArray = cleanParams(params);
    const upper = normalizedSql.toUpperCase();

    try {
        const stmt = sdb.prepare(normalizedSql);

        // Check if query produces a result set (SELECT, PRAGMA)
        if (upper.startsWith('SELECT') || upper.startsWith('PRAGMA') || upper.startsWith('EXPLAIN')) {
            const rows = stmt.all(...paramsArray);
            return [rows, []];
        } else {
            // DML or DDL (INSERT, UPDATE, DELETE, ALTER, CREATE)
            const info = stmt.run(...paramsArray);
            const resultHeader = {
                affectedRows: info.changes,
                insertId: typeof info.lastInsertRowid === 'bigint' ? Number(info.lastInsertRowid) : info.lastInsertRowid,
                changedRows: info.changes
            };
            return [resultHeader, []];
        }
    } catch (err) {
        // Log query error with context for debugging
        console.error('SQLite query execution error:', err.message, '\nSQL:', normalizedSql);
        throw err;
    }
}

module.exports = {
    query,
    getEngine: () => activeEngine,
    getConnection: (cb) => {
        if (activeEngine === 'mysql' && mysqlPool) {
            return mysqlPool.getConnection(cb);
        }
        cb(null, { release: () => {} });
    }
};
