/**
 * tools.js
 * مكتبة أدوات شاملة لمشروع Affiliate Marketplace
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// =======================
// 🔑 توليد معرفات عشوائية
// =======================
function generateId(prefix = '') {
  return prefix + crypto.randomBytes(8).toString('hex');
}

// =======================
// 💵 تنسيق السعر
// =======================
function formatPrice(value, currency = 'USD') {
  const amount = Number(value || 0).toFixed(2);
  if (currency === 'USD') return `$${amount}`;
  if (currency === 'EUR') return `€${amount}`;
  return `${amount} ${currency}`;
}

// =======================
// 📅 تنسيق التاريخ
// =======================
function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
}

// =======================
// ✅ التحقق من Webhook
// =======================
function verifyWebhook(signature, payload, secret) {
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return signature === hmac;
}

// =======================
// 📊 حساب العمولة
// =======================
function calculateCommission(price, platform) {
  let rate = 0.05; // افتراضي 5%
  switch (platform) {
    case 'amazon': rate = 0.04; break;
    case 'ebay': rate = 0.06; break;
    case 'aliexpress': rate = 0.07; break;
    case 'temu': rate = 0.08; break;
    case 'shein': rate = 0.05; break;
  }
  return +(price * rate).toFixed(2);
}

// =======================
// 📝 Logger
// =======================
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

// =======================
// 📧 إرسال بريد إلكتروني
// =======================
async function sendEmail(to, subject, text, html = null) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // أو SMTP خاص بك
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Commission Pro" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: html || text
  };

  return transporter.sendMail(mailOptions);
}

// =======================
// 📂 التعامل مع الملفات
// =======================

// قراءة JSON من ملف
function readJson(filePath) {
  try {
    const data = fs.readFileSync(path.resolve(filePath), 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    log(`خطأ في قراءة JSON من ${filePath}`, 'error');
    return null;
  }
}

// كتابة JSON إلى ملف
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(path.resolve(filePath), JSON.stringify(data, null, 2), 'utf-8');
    log(`تم حفظ JSON في ${filePath}`, 'info');
  } catch (err) {
    log(`خطأ في كتابة JSON إلى ${filePath}`, 'error');
  }
}

// رفع ملف (حفظ محلي)
function saveFile(fileBuffer, fileName, folder = 'uploads') {
  const dir = path.resolve(folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, fileBuffer);
  log(`📂 تم حفظ الملف في ${filePath}`, 'info');
  return filePath;
}

// =======================
// 📦 Export
// =======================
module.exports = {
  generateId,
  formatPrice,
  formatDate,
  verifyWebhook,
  calculateCommission,
  log,
  sendEmail,
  readJson,
  writeJson,
  saveFile
};
