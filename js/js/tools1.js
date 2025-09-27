// tools.js - أدوات عامة للمشروع

const crypto = require('crypto');

// 🔑 توليد ID عشوائي
function generateId(prefix = '') {
  return prefix + crypto.randomBytes(8).toString('hex');
}

// 💵 تنسيق السعر بالدولار
function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

// 📅 تنسيق التاريخ
function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
}

// ✅ التحقق من توقيع Webhook (مثال عام)
function verifyWebhook(signature, payload, secret) {
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return signature === hmac;
}

// 📊 حساب العمولة (مثال: 5% ثابتة، لكن ممكن تختلف حسب المنصة)
function calculateCommission(price, platform) {
  let rate = 0.05; // 5% افتراضي
  if (platform === 'amazon') rate = 0.04;
  if (platform === 'ebay') rate = 0.06;
  if (platform === 'aliexpress') rate = 0.07;
  if (platform === 'temu') rate = 0.08;
  if (platform === 'shein') rate = 0.05;

  return +(price * rate).toFixed(2);
}

// 📝 Logger
function log(message, type = 'info') {
  const time = new Date().toISOString();
  if (type === 'error') {
    console.error(`[❌ ERROR] ${time} - ${message}`);
  } else if (type === 'warn') {
    console.warn(`[⚠️ WARN] ${time} - ${message}`);
  } else {
    console.log(`[ℹ️ INFO] ${time} - ${message}`);
  }
}

module.exports = {
  generateId,
  formatPrice,
  formatDate,
  verifyWebhook,
  calculateCommission,
  log
};
