// tools.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const sharp = require('sharp');

function generateId(prefix = '') {
  return prefix + crypto.randomBytes(8).toString('hex');
}

function formatPrice(value, currency = 'USD') {
  const amount = Number(value || 0).toFixed(2);
  if (currency === 'USD') return `$${amount}`;
  if (currency === 'EUR') return `€${amount}`;
  return `${amount} ${currency}`;
}

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
}

// verify webhook HMAC-SHA256
function verifyWebhook(signature, payload, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function calculateCommission(price, platform) {
  let rate = 0.05;
  switch ((platform||'').toLowerCase()) {
    case 'amazon': rate = 0.04; break;
    case 'ebay': rate = 0.06; break;
    case 'aliexpress': rate = 0.07; break;
    case 'temu': rate = 0.08; break;
    case 'shein': rate = 0.05; break;
    case 'alibaba': rate = 0.06; break;
  }
  return +(price * rate).toFixed(2);
}

function log(msg, type='info') {
  const time = new Date().toISOString();
  if (type === 'error') console.error(`[ERROR] ${time} - ${msg}`);
  else if (type === 'warn') console.warn(`[WARN] ${time} - ${msg}`);
  else console.log(`[INFO] ${time} - ${msg}`);
}

// read/write json helpers
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
  } catch (e) {
    log(`readJson failed ${filePath}: ${e}`, 'warn');
    return null;
  }
}
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(path.resolve(filePath), JSON.stringify(data,null,2),'utf8');
    return true;
  } catch (e) {
    log(`writeJson failed ${filePath}: ${e}`, 'error');
    return false;
  }
}

// safe file save with validation (type + size)
function isAllowedMime(mime) {
  const allowed = ['image/jpeg','image/png','image/webp'];
  return allowed.includes(mime);
}
function saveFileSafe(buffer, fileName, folder='uploads', mimeType='application/octet-stream', maxBytes=5*1024*1024) {
  if (buffer.length > maxBytes) throw new Error('FILE_TOO_LARGE');
  if (!isAllowedMime(mimeType)) throw new Error('INVALID_FILE_TYPE');
  const dir = path.resolve(folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive:true });
  const out = path.join(dir, fileName);
  fs.writeFileSync(out, buffer);
  return out;
}

// image processing wrappers
async function resizeImage(inputPath, outputPath, width, height) {
  await sharp(inputPath).resize(width, height, { fit: 'inside' }).toFile(outputPath);
  return outputPath;
}
async function convertToWebp(inputPath, outputPath, quality=80) {
  await sharp(inputPath).webp({ quality }).toFile(outputPath);
  return outputPath;
}

// email sender using env SMTP (nodemailer)
async function sendEmail(to, subject, text, html=null) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error('EMAIL_CREDENTIALS_NOT_SET');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
  const opts = { from: `"CommissionPro" <${user}>`, to, subject, text, html: html||text };
  return transporter.sendMail(opts);
}

module.exports = {
  generateId, formatPrice, formatDate, verifyWebhook, calculateCommission,
  log, readJson, writeJson, saveFileSafe, resizeImage, convertToWebp, sendEmail
};
