// دوال الأدوات الإضافية (توليد روابط، QR ...)

function generateShortLink(url) {
  // TODO: أضف منطق توليد رابط مختصر هنا
}

function generateQRCode(data) {
  // TODO: أضف منطق توليد QR code هنا
}

// يمكنك تصدير الدوال إذا كنت تستخدم ES6 Modules
// export { generateShortLink, generateQRCode };
// tools.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');

function generateId(prefix = '') {
  return prefix + crypto.randomBytes(8).toString('hex');
}

function log(msg, type='info') {
  const time = new Date().toISOString();
  if (type === 'error') console.error(`[ERROR] ${time} - ${msg}`);
  else if (type === 'warn') console.warn(`[WARN] ${time} - ${msg}`);
  else console.log(`[INFO] ${time} - ${msg}`);
}

async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  return transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
}

module.exports = { generateId, log, sendEmail };
