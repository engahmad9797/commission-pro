// test.js
const request = require('supertest');
const assert = require('assert');
const app = require('./server'); // تأكد أن server.js بيعمل module.exports = app

async function runTests() {
  console.log("🚀 بدء الاختبارات...");

  // 1) جلب المنتجات
  const prodRes = await request(app).get('/api/products');
  assert(prodRes.status === 200, 'GET /api/products فشل');
  assert(Array.isArray(prodRes.body.products), 'المنتجات ليست مصفوفة');
  console.log(`✅ المنتجات (${prodRes.body.products.length}) رجعت`);

  const testProduct = prodRes.body.products[0];
  assert(testProduct, 'ما في منتجات للاختبار');

  // 2) تسجيل نقرة
  const clickRes = await request(app)
    .post('/api/track-click')
    .send({ productId: testProduct.id, platform: testProduct.platform });
  assert(clickRes.status === 200, 'POST /api/track-click فشل');
  assert(clickRes.body.clickId, 'ما رجع clickId');
  console.log(`✅ تسجيل نقرة (${clickRes.body.clickId})`);

  const clickId = clickRes.body.clickId;

  // 3) توليد رابط تابع
  const linkRes = await request(app)
    .post('/api/generate-affiliate-link')
    .send({ productId: testProduct.id, platform: testProduct.platform, clickId });
  assert(linkRes.status === 200, 'POST /api/generate-affiliate-link فشل');
  assert(linkRes.body.affiliateUrl, 'ما رجع affiliateUrl');
  console.log(`✅ رابط تابع: ${linkRes.body.affiliateUrl}`);

  // 4) محاكاة Webhook (مبيع)
  const webhookRes = await request(app)
    .post('/webhooks/affiliate/amazon')
    .send({
      order_id: "TEST_ORDER_1",
      click_id: clickId,
      commission: 7.5,
      status: "confirmed"
    });
  assert(webhookRes.status === 200, 'POST /webhooks/affiliate/amazon فشل');
  console.log(`✅ Webhook تسجل`);

  // 5) مراجعة الأرباح (Analytics)
  const anaRes = await request(app).get('/api/owner/analytics');
  assert(anaRes.status === 200, 'GET /api/owner/analytics فشل');
  console.log(`✅ Analytics رجعت (Clicks: ${anaRes.body.totalClicks}, Revenue: $${anaRes.body.totalRevenue})`);

  // 6) طلب سحب
  const withdrawRes = await request(app)
    .post('/api/withdraw')
    .send({ amount: 5, method: 'paypal', details: 'test@paypal.com' });
  assert(withdrawRes.status === 200, 'POST /api/withdraw فشل');
  console.log(`✅ طلب سحب (${withdrawRes.body.id})`);

  console.log("🎉 كل الاختبارات نجحت!");
}

runTests().catch(err => {
  console.error("❌ خطأ في الاختبار:", err);
  process.exit(1);
});
