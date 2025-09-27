// جلب المنتجات من DB (SQLite مثال)
app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products ORDER BY lastSeen DESC LIMIT 200`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json({ products: rows.map(r => ({
      id: r.id,
      title: r.title,
      price: r.price,
      image: r.image,
      platform: r.platform,
      url: r.url,
      lastSeen: r.lastSeen
    })) });
  });
});
