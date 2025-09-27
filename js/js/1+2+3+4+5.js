const { generateId } = require('./tools');
console.log(generateId('clk_')); // clk_a1b2c3d4e5...
const { calculateCommission } = require('./tools');
console.log(calculateCommission(100, 'ebay')); // 6
const { sendEmail } = require('./tools');
await sendEmail("test@example.com", "اشعار جديد", "تم تسجيل عملية بيع");
const { readJson, writeJson } = require('./tools');
writeJson('data.json', { test: 123 });
console.log(readJson('data.json'));
const { saveFile } = require('./tools');
saveFile(Buffer.from("Hello World"), "hello.txt");
