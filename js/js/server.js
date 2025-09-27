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
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user' -- user أو owner
)`);

db.run(`CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  name TEXT,
  platform TEXT,
  productId TEXT,
  budget REAL,
  clicks INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0,
  status TEXT DEFAULT 'نشطة',
  createdAt TEXT,
  FOREIGN KEY(userId) REFERENCES users(id)
)`);
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing_fields' });

  const hashed = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (username, password, role) VALUES (?,?,?)`,
    [username, hashed, role || 'user'],
    function(err) {
      if (err) return res.status(500).json({ error: 'username_taken' });
      res.json({ success: true, id: this.lastID });
    });
});
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username=?`, [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'invalid_credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'invalid_credentials' });

    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ success: true, role: user.role });
  });
});
  function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  next();
}

function requireOwner(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'owner') {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
}
// المالك فقط
app.get('/dashboard.html', requireOwner, (req, res) => {
  res.sendFile(__dirname + '/public/dashboard.html');
});
app.get('/analytics.html', requireOwner, (req, res) => {
  res.sendFile(__dirname + '/public/analytics.html');
});

// المالك أو المستخدم
app.get('/campaigns.html', requireLogin, (req, res) => {
  res.sendFile(__dirname + '/public/campaigns.html');
});
// server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const { generateId, log, calculateCommission, verifyWebhook } = require('./tools');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(helmet());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({ windowMs: 60*1000, max: 120 }); // 120 requests per minute
app.use(limiter);

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd, // set true in production (requires HTTPS)
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// DB init
const db = new sqlite3.Database('./data.db');

// create tables safe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'user',
    must_change_password INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    platform TEXT,
    platformId TEXT,
    title TEXT,
    price REAL,
    image TEXT,
    url TEXT,
    raw TEXT,
    lastSeen TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS clicks (
    id TEXT PRIMARY KEY,
    productId TEXT,
    platform TEXT,
    userId INTEGER,
    ip TEXT,
    ua TEXT,
    meta TEXT,
    status TEXT,
    orderId TEXT,
    createdAt TEXT,
    convertedAt TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS affiliate_links (
    id TEXT PRIMARY KEY,
    productId TEXT,
    platform TEXT,
    userId INTEGER,
    clickId TEXT,
    url TEXT,
    createdAt TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId INTEGER,
    platform TEXT,
    productId TEXT,
    amount REAL,
    orderId TEXT,
    clickId TEXT,
    status TEXT,
    createdAt TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    userId INTEGER,
    amount REAL,
    method TEXT,
    details TEXT,
    status TEXT,
    createdAt TEXT,
    approvedAt TEXT,
    completedAt TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    name TEXT,
    platform TEXT,
    productId TEXT,
    budget REAL,
    clicks INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0,
    status TEXT DEFAULT 'active',
    createdAt TEXT
  )`);
});

// create default admin if not exists (force change password)
const defaultAdminUser = process.env.ADMIN_USER || 'admin';
const defaultAdminPass = process.env.ADMIN_PASS || 'admin123';
db.get(`SELECT * FROM users WHERE username = ?`, [defaultAdminUser], (err,row) => {
  if (!row) {
    bcrypt.hash(defaultAdminPass, 10).then(hash => {
      db.run(`INSERT INTO users (username, password_hash, role, must_change_password) VALUES (?,?,?,?)`,
        [defaultAdminUser, hash, 'owner', 1]);
      log('Default admin created — CHANGE PASSWORD on first login', 'warn');
    });
  }
});

// Middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  next();
}
function requireOwner(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'owner') return res.status(403).json({ error: 'forbidden' });
  next();
}

// AUTH ROUTES
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing_fields' });
  try {
    const hash = await bcrypt.hash(password, 12);
    db.run(`INSERT INTO users (username, password_hash, role) VALUES (?,?,?)`, [username, hash, 'user'],
      function(err) {
        if (err) return res.status(400).json({ error: 'username_taken' });
        res.json({ success: true, id: this.lastID });
      });
  } catch (e) { res.status(500).json({ error: 'server' }); }
});

app.post('/api/login', (req,res) => {
  const { username, password } = req.body;
  db.get(`SELECT id, username, password_hash, role, must_change_password FROM users WHERE username = ?`, [username], async (err,user) => {
    if (err || !user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ success: true, must_change_password: user.must_change_password });
  });
});

app.post('/api/logout', (req,res) => {
  req.session.destroy(()=>res.json({success:true}));
});

app.post('/api/change-password', requireLogin, async (req,res) => {
  const { oldPassword, newPassword } = req.body;
  db.get(`SELECT password_hash FROM users WHERE id = ?`, [req.session.user.id], async (err,row) => {
    if (!row) return res.status(400).json({ error: 'no_user' });
    const ok = await bcrypt.compare(oldPassword, row.password_hash);
    if (!ok) return res.status(400).json({ error: 'invalid_old_password' });
    const newHash = await bcrypt.hash(newPassword, 12);
    db.run(`UPDATE users SET password_hash=?, must_change_password=0 WHERE id=?`, [newHash, req.session.user.id], (e) => {
      if (e) return res.status(500).json({ error: 'db' });
      res.json({ success:true });
    });
  });
});

// PRODUCTS API (read-only for visitors)
app.get('/api/products', (req,res) => {
  db.all(`SELECT id, platform, title, price, image, url, lastSeen FROM products ORDER BY lastSeen DESC LIMIT 500`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json({ products: rows || [] });
  });
});

// TRACK CLICK
app.post('/api/track-click', async (req,res) => {
  try {
    const { productId, platform, meta } = req.body;
    const clickId = generateId('clk_');
    const createdAt = new Date().toISOString();
    const ip = req.ip;
    const ua = req.get('User-Agent') || '';
    const userId = (req.session.user && req.session.user.id) || null;
    db.run(`INSERT INTO clicks (id, productId, platform, userId, ip, ua, meta, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`,
      [clickId, productId, platform, userId, ip, ua, JSON.stringify(meta||{}), 'pending', createdAt],
      (err) => {
        if (err) { log(`click insert err ${err}`, 'error'); return res.status(500).json({ error: 'db' }); }
        res.json({ clickId });
      });
  } catch (e) { res.status(500).json({ error: 'server' }); }
});

// GENERATE AFFILIATE LINK (placeholder uses apiManager)
const apiManager = require('./api'); // your api layer with generateAffiliateLink(productId, platform, opts)
app.post('/api/generate-affiliate-link', requireLogin, async (req,res) => {
  const { productId, platform, clickId } = req.body;
  try {
    const userId = req.session.user.id;
    // apiManager should generate link including tracking params
    const result = await apiManager.generateAffiliateLink(productId, platform, { userId, clickId });
    const linkId = result.linkId || generateId('link_');
    db.run(`INSERT INTO affiliate_links (id, productId, platform, userId, clickId, url, createdAt) VALUES (?,?,?,?,?,?,?)`,
      [linkId, productId, platform, userId, clickId || null, result.url, new Date().toISOString()], () => {
        res.json({ affiliateUrl: result.url, linkId });
      });
  } catch (e) {
    log(`generate-aff link err ${e}`, 'error'); res.status(500).json({ error: 'failed' });
  }
});

// WEBHOOK endpoint (secure with HMAC)
app.post('/webhooks/affiliate/:platform', express.raw({ type: '*/*' }), (req,res) => {
  const platform = req.params.platform;
  const signature = req.get('x-signature') || req.get('x-hub-signature') || '';
  const secret = process.env.WEBHOOK_SECRET || '';
  const payloadRaw = req.body; // Buffer
  try {
    const ok = verifyWebhook(signature, payloadRaw, secret);
    if (!ok) {
      log('Webhook signature mismatch', 'warn');
      return res.status(400).send('bad signature');
    }
    const payload = JSON.parse(payloadRaw.toString('utf8'));
    // extract click id or tid
    const clickId = payload.tid || payload.click_id || payload.tracking_id || (payload.url && (new URL(payload.url)).searchParams.get('tid')) || null;
    const amount = Number(payload.commission || payload.amount || 0);
    const orderId = payload.order_id || payload.transaction_id || payload.order || generateId('ord_');
    const createdAt = new Date().toISOString();
    const txnId = generateId('txn_');

    db.run(`INSERT INTO transactions (id, userId, platform, productId, amount, orderId, clickId, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`,
      [txnId, null, platform, payload.productId || null, amount, orderId, clickId, 'confirmed', createdAt], (err) => {
        if (err) { log('txn insert err '+err,'error'); return res.status(500).send('err'); }
        if (clickId) {
          db.run(`UPDATE clicks SET status=?, orderId=?, convertedAt=? WHERE id=?`, ['converted', orderId, createdAt, clickId]);
          // find click -> userId to credit their earnings
          db.get(`SELECT userId FROM clicks WHERE id = ?`, [clickId], (e,row) => {
            if (row && row.userId) {
              const userId = row.userId;
              // credit user's "virtual earnings" via transactions table only (reporting); you can keep balance in users table if desired
              log(`Credited user ${userId} amount ${amount}`);
            }
          });
        }
        res.send('ok');
      });
  } catch (e) { log('webhook handling err '+e,'error'); res.status(500).send('err'); }
});

// WITHDRAW
app.post('/api/withdraw', requireLogin, (req,res) => {
  const userId = req.session.user.id;
  const { amount, method, details } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'invalid_amount' });
  // calculate user balance from transactions (sum where userId)
  db.get(`SELECT SUM(amount) as total FROM transactions WHERE userId = ? AND status = 'confirmed'`, [userId], (err,row) => {
    const balance = (row && row.total) ? row.total : 0;
    if (balance < amount) return res.status(400).json({ error: 'insufficient' });
    const id = generateId('wd_');
    db.run(`INSERT INTO withdrawals (id, userId, amount, method, details, status, createdAt) VALUES (?,?,?,?,?,?,?)`,
      [id, userId, amount, method, JSON.stringify(details||{}), 'pending', new Date().toISOString()], (e) => {
        if (e) return res.status(500).json({ error: 'db' });
        // optionally reduce balance (or wait until approval)
        res.json({ ok:true, id });
      });
  });
});

// CAMPAIGNS (owner sees all; users see theirs)
app.get('/api/campaigns', requireLogin, (req,res) => {
  if (req.session.user.role === 'owner') {
    db.all(`SELECT * FROM campaigns ORDER BY createdAt DESC`, [], (err,rows) => res.json(rows));
  } else {
    db.all(`SELECT * FROM campaigns WHERE userId = ? ORDER BY createdAt DESC`, [req.session.user.id], (err,rows) => res.json(rows));
  }
});
app.post('/api/campaigns', requireLogin, (req,res) => {
  const { name, platform, productId, budget } = req.body;
  if (!name || !platform || !productId) return res.status(400).json({ error: 'missing_fields' });
  db.run(`INSERT INTO campaigns (userId, name, platform, productId, budget, createdAt) VALUES (?,?,?,?,?,?)`,
    [req.session.user.id, name, platform, productId, budget, new Date().toISOString()], function(err) {
      if (err) return res.status(500).json({ error: 'db_insert' });
      res.json({ id: this.lastID, name, platform, productId, budget, clicks:0, sales:0, revenue:0, status:'active' });
    });
});

// Analytics for owner
app.get('/api/owner/analytics', requireLogin, requireOwner, (req,res) => {
  db.get(`SELECT COUNT(*) as totalClicks FROM clicks`, [], (e1,r1) => {
    db.get(`SELECT COUNT(*) as totalSales, SUM(amount) as totalRevenue FROM transactions WHERE status='confirmed'`, [], (e2,r2) => {
      db.all(`SELECT platform, SUM(amount) as rev FROM transactions GROUP BY platform ORDER BY rev DESC LIMIT 6`, [], (e3,topPlatforms) => {
        db.all(`SELECT productId, SUM(amount) as rev FROM transactions GROUP BY productId ORDER BY rev DESC LIMIT 6`, [], (e4,topProducts) => {
          res.json({
            totalClicks: r1?.totalClicks || 0,
            totalSales: r2?.totalSales || 0,
            totalRevenue: r2?.totalRevenue || 0,
            topPlatforms: topPlatforms || [],
            topProducts: topProducts || []
          });
        });
      });
    });
  });
});

// Helper: serve protected pages
app.get('/dashboard.html', requireLogin, (req,res) => res.sendFile(path.join(__dirname,'public','dashboard.html')));
app.get('/campaigns.html', requireLogin, (req,res) => res.sendFile(path.join(__dirname,'public','campaigns.html')));
app.get('/analytics.html', requireLogin, requireOwner, (req,res) => res.sendFile(path.join(__dirname,'public','analytics.html')));

// Start server
if (require.main === module) {
  app.listen(PORT, () => log(`Server running on http://localhost:${PORT}`));
}
module.exports = app;


