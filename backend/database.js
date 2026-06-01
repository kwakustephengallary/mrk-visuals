const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'mrkvisuals.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS galleries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    date TEXT,
    price REAL DEFAULT 0,
    password TEXT,
    privacy TEXT DEFAULT 'public',
    clientEmail TEXT DEFAULT '',
    pricingType TEXT DEFAULT 'full',
    installment TEXT,
    coverImage TEXT,
    isLocked INTEGER DEFAULT 1,
    isPaid INTEGER DEFAULT 0,
    paidAmount REAL DEFAULT 0,
    unlockedPhotos TEXT DEFAULT '[]',
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    gallery_id TEXT NOT NULL,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    price REAL DEFAULT 0,
    photoOrder INTEGER DEFAULT 0,
    FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE
  );
`);

module.exports = db;