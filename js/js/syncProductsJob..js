// syncProductsJob.js
const cron = require('node-cron');
const api = require('./api'); // يجب أن يحتوي searchPlatformProducts(platform,...)
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db');
const { log } = require('./tools');

async function sync(platform, query='best-sellers', limit=100) {
  try {
    const items = await api.searchPlatformProducts(platform, query, { limit });
    if (!items || !items.length) { log(`[SYNC] ${platform}: no items`); return; }
    for (const p of items) {
      const id = `${platform}_${p.id || p.asin || p.sku || generateId('p_')}`;
      db.run(`INSERT OR REPLACE INTO products (id, platform, platformId, title, price, image, url, raw, lastSeen) VALUES (?,?,?,?,?,?,?,?,?)`,
        [id, platform, p.id || p.asin || p.sku, p.title || p.name, p.price || 0, p.image || '', p.url || '', JSON.stringify(p), new Date().toISOString()]);
    }
    log(`[SYNC] ${platform}: synced ${items.length} items`);
  } catch (e) {
    log(`[SYNC] ${platform} error ${e}`, 'error');
  }
}

// schedule hourly
cron.schedule('0 * * * *', () => {
  sync('amazon','best-sellers',50);
  sync('ebay','best-sellers',50);
  sync('aliexpress','hot',50);
  sync('temu','hot',50);
  sync('shein','hot',50);
  sync('alibaba','hot',50);
});

// run immediately on start
(async () => {
  await sync('amazon','best-sellers',50);
  await sync('ebay','best-sellers',50);
})();
