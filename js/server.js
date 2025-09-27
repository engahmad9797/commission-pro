require('dotenv').config();
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const { generateId, log } = require('./tools');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database('./data.db');

// إعدادات أساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

// إنشاء الجداول
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT,
    price REAL,
    image TEXT,
    url TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    name TEXT,
    platform TEXT,
    createdAt TEXT
  )`);
});

// إضافة مسؤول افتراضي
const adminUser = process.env.ADMIN_USER || 'admin';
const adminPass = process.env.ADMIN_PASS || 'admin123';
db.get(`SELECT * FROM users WHERE username=?`, [adminUser], async (err, row) => {
  if (!row) {
    const hash = await bcrypt.hash(adminPass, 10);
    db.run(`INSERT INTO users (username, password, role) VALUES (?,?,?)`, [adminUser, hash, 'owner']);
    log('✅ Admin user created');
  }
});

// Middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login.html');
  next();
}

// 🔑 تسجيل الدخول
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username=?`, [username], async (err, user) => {
    if (!user) return res.status(401).json({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Wrong password' });
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ success: true });
  });
});

// 📦 عرض المنتجات
app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows);
  });
});

// ➕ إضافة منتجات (تجريبية)
app.post('/api/products', requireLogin, (req, res) => {
  const { title, price, image, url } = req.body;
  const id = generateId('prd_');
  db.run(`INSERT INTO products (id, title, price, image, url) VALUES (?,?,?,?,?)`,
    [id, title, price, image, url], (err) => {
      if (err) return res.status(500).json({ error: 'db_error' });
      res.json({ id, title, price, image, url });
    });
});

// 📊 الحملات
app.get('/api/campaigns', requireLogin, (req, res) => {
  const uid = req.session.user.id;
  db.all(`SELECT * FROM campaigns WHERE userId=?`, [uid], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows);
  });
});

app.post('/api/campaigns', requireLogin, (req, res) => {
  const { name, platform } = req.body;
  db.run(`INSERT INTO campaigns (userId, name, platform, createdAt) VALUES (?,?,?,?)`,
    [req.session.user.id, name, platform, new Date().toISOString()],
    function(err) {
      if (err) return res.status(500).json({ error: 'db_error' });
      res.json({ id: this.lastID, name, platform });
    });
});

// صفحات محمية
app.get('/dashboard.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/campaigns.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'campaigns.html'));
});

// 🚀 تشغيل السيرفر
app.listen(PORT, () => log(`🌍 Server running at http://localhost:${PORT}`));
