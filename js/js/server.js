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
