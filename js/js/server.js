// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const DB_PATH = './data.db';
const PORT = process.env.PORT || 3000;
const SALT_ROUNDS = 10;

// middlewares
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    //secure: true, // فعل هذا عند استخدام HTTPS
    maxAge: 1000 * 60 * 60 // ساعة
  }
}));

// basic rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: 10,
  message: 'Too many attempts, try later.'
});

// init DB
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite DB.');
});

// create tables if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE,
    title TEXT,
    body TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);

  // create default admin if none exists (username: admin, password: admin123) — change immediately
  db.get(`SELECT COUNT(*) as cnt FROM users`, (err, row) => {
    if (err) return console.error(err);
    if (row.cnt === 0) {
      bcrypt.hash('admin123', SALT_ROUNDS).then(hash => {
        db.run(`INSERT INTO users (username, password_hash) VALUES (?, ?)`, ['admin', hash]);
        console.log('Default admin user created: username=admin password=admin123 (change ASAP)');
      });
    }
  });
});

// auth helper
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

// API: login
app.post('/api/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing fields' });

  db.get(`SELECT id, password_hash FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) return res.status(401).json({ error: 'invalid credentials' });

    bcrypt.compare(password, row.password_hash).then(match => {
      if (!match) return res.status(401).json({ error: 'invalid credentials' });
      req.session.userId = row.id;
      req.session.username = username;
      return res.json({ ok: true });
    }).catch(() => res.status(500).json({ error: 'hash error' }));
  });
});

// API: logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('sid');
    return res.json({ ok: true });
  });
app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products ORDER BY lastSeen DESC LIMIT 200`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json({
      products: rows.map(r => ({
        id: r.id,
        title: r.title,
        price: r.price,
        image: r.image,
        platform: r.platform,
        url: r.url,
        lastSeen: r.lastSeen
      }))
    });
  });
});
app.use(express.static('public'));
  app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products ORDER BY lastSeen DESC LIMIT 200`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json({
      products: rows.map(r => ({
        id: r.id,
        title: r.title,
        price: r.price,
        image: r.image,
        platform: r.platform,
        url: r.url,
        lastSeen: r.lastSeen
      }))
    });
  });
});
app.get('/api/owner/analytics', (req, res) => {
  db.get(`SELECT COUNT(*) as totalClicks FROM clicks`, [], (err, row1) => {
    db.get(`SELECT COUNT(*) as totalSales, SUM(amount) as totalRevenue FROM commissions`, [], (err2, row2) => {
      db.all(`SELECT platform, SUM(amount) as rev FROM commissions GROUP BY platform ORDER BY rev DESC LIMIT 5`, [], (err3, topPlatforms) => {
        db.all(`SELECT productId, SUM(amount) as rev FROM commissions GROUP BY productId ORDER BY rev DESC LIMIT 5`, [], (err4, topProducts) => {
          res.json({
            totalClicks: row1?.totalClicks || 0,
            totalSales: row2?.totalSales || 0,
            totalRevenue: row2?.totalRevenue || 0,
            topPlatforms: topPlatforms || [],
            topProducts: topProducts || []
          });
        });
      });
    });
  });
});
const { generateId, log } = require('./tools');

app.post('/api/track-click', (req, res) => {
  const { productId, platform } = req.body;
  const clickId = generateId('clk_');
  log(`Click tracked: ${clickId} on ${platform}`, 'info');
  res.json({ clickId });
});
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'owner'
)`);
const bcrypt = require('bcrypt');
const session = require('express-session');

// جلسة
app.use(session({
  secret: process.env.SESSION_SECRET || 'superSecret',
  resave: false,
  saveUninitialized: false
}));

// تسجيل مستخدم جديد (مرة واحدة لإضافة المالك)
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing_fields' });

  const hashed = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (username, password, role) VALUES (?,?,?)`,
    [username, hashed, 'owner'],
    function(err) {
      if (err) return res.status(500).json({ error: 'db_error' });
      res.json({ success: true, id: this.lastID });
    });
});

// تسجيل الدخول
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username=?`, [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'invalid_credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'invalid_credentials' });

    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ success: true });
  });
});

// تسجيل الخروج
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// حماية المسارات الخاصة
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  next();
}

