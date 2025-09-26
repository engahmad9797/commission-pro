const axios = require('axios');
const API_KEY = 'YOUR_BESTBUY_API_KEY';

async function fetchBestBuyProducts(searchTerm) {
  try {
    const response = await axios.get('https://api.bestbuy.com/v1/products((search=' + encodeURIComponent(searchTerm) + '))', {
      params: {
        'apiKey': API_KEY,
        'format': 'json',
        'pageSize': 10
      }
    });

    const products = response.data.products;
    products.forEach(product => {
      console.log(`Name: ${product.name}`);
      console.log(`Price: $${product.regularPrice}`);
      console.log(`URL: ${product.url}`);
      console.log('-----------------------');
    });

    return products;
  } catch (error) {
    console.error('Error fetching Best Buy products:', error.message);
  }
}

// مثال استدعاء
fetchBestBuyProducts('laptop');
