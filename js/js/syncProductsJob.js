const cron = require('node-cron');
const apiManager = require('./api');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db');

async function sync(platform, query='best-sellers', limit=50) {
  try {
    const items = await apiManager.searchPlatformProducts(platform, query, { limit });
    for (const p of items) {
      const id = `${platform}_${p.id || p.asin || p.sku}`;
      db.run(`INSERT OR REPLACE INTO products 
        (id, platform, platformId, title, price, image, url, raw, lastSeen) 
        VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          id,
          platform,
          p.id || p.asin,
          p.title || p.name,
          p.price || 0,
          p.image || '',
          p.url || '',
          JSON.stringify(p),
          new Date().toISOString()
        ]
      );
    }
    console.log(`[SYNC] ${platform}: ${items.length} products updated`);
  } catch (e) {
    console.error(`[SYNC] ${platform} error`, e);
  }
}

// جدول المنتجات
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

// شغّل كل ساعة
cron.schedule('0 * * * *', () => {
  sync('amazon');
  sync('aliexpress');
  sync('ebay');
  sync('temu');
  sync('shein');
});

// شغّل مرة عند التشغيل
(async () => {
  await sync('amazon');
  await sync('aliexpress');
  await sync('ebay');
  await sync('temu');
  await sync('shein');
})();
