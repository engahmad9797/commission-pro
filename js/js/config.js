// Enhanced Platform Configuration
const PLATFORMS = {
    amazon: {
        name: 'أمازون',
        commission: { min: 4, max: 10 },
        api: {
            baseUrl: 'https://affiliate-api.amazon.com',
            trackingId: 'commissionpro-20',
            apiKey: 'YOUR_AMAZON_API_KEY',
            affiliateId: 'commissionpro-20'
        },
        features: {
            productSearch: true,
            realTimeTracking: true,
            detailedAnalytics: true,
            bulkOperations: true
        },
        categories: [
            'electronics', 'fashion', 'home', 'beauty', 'sports', 'books', 
            'toys', 'automotive', 'health', 'garden'
        ],
        supportedCountries: ['US', 'UK', 'CA', 'DE', 'FR', 'IT', 'ES', 'JP', 'AU', 'SA', 'AE', 'EG']
    },
    
    aliexpress: {
        name: 'علي إكسبريس',
        commission: { min: 5, max: 50 },
        api: {
            baseUrl: 'https://api.aliexpress.com',
            trackingId: 'commissionpro',
            apiKey: 'YOUR_ALIEXPRESS_API_KEY',
            affiliateId: 'commissionpro'
        },
        features: {
            productSearch: true,
            realTimeTracking: true,
            detailedAnalytics: true,
            bulkOperations: true,
            dropshipping: true
        },
        categories: [
            'electronics', 'fashion', 'home', 'beauty', 'sports', 'jewelry',
            'watches', 'bags', 'shoes', 'toys', 'automotive'
        ],
        supportedCountries: ['US', 'UK', 'CA', 'AU', 'RU', 'BR', 'SA', 'AE', 'EG']
    },
    
    ebay: {
        name: 'إيباي',
        commission: { min: 3, max: 12 },
        api: {
            baseUrl: 'https://api.ebay.com',
            trackingId: 'commissionpro',
            apiKey: 'YOUR_EBAY_API_KEY',
            campaignId: 'commissionpro'
        },
        features: {
            productSearch: true,
            realTimeTracking: true,
            detailedAnalytics: true,
            auctionTracking: true,
            bulkOperations: true
        },
        categories: [
            'electronics', 'fashion', 'home', 'collectibles', 'motors',
            'sporting', 'toys', 'business', 'music', 'art'
        ],
        supportedCountries: ['US', 'UK', 'CA', 'DE', 'FR', 'IT', 'ES', 'AU']
    },
    
    walmart: {
        name: 'ول مارت',
        commission: { min: 4, max: 8 },
        api: {
            baseUrl: 'https://affiliate-api.walmart.com',
            trackingId: 'commissionpro',
            apiKey: 'YOUR_WALMART_API_KEY',
            publisherId: 'commissionpro'
        },
        features: {
            productSearch: true,
            realTimeTracking: true,
            detailedAnalytics: true,
            localDeals: true,
            bulkOperations: true
        },
        categories: [
            'electronics', 'fashion', 'home', 'beauty', 'sports', 'toys',
            'automotive', 'pharmacy', 'grocery', 'office'
        ],
        supportedCountries: ['US', 'CA']
    },
    
    bestbuy: {
        name: 'بيست باي',
        commission: { min: 1, max: 5 },
        api: {
            baseUrl: 'https://api.bestbuy.com',
            trackingId: 'commissionpro',
            apiKey: 'YOUR_BESTBUY_API_KEY',
            affiliateId: 'commissionpro'
        },
        features: {
            productSearch: true,
            realTimeTracking: true,
            detailedAnalytics: true,
            techProducts: true,
            bulkOperations: true
        },
        categories: [
            'electronics', 'computers', 'tv', 'audio', 'gaming', 'appliances',
            'mobile', 'cameras', 'car', 'health'
        ],
        supportedCountries: ['US', 'CA']
    },
    
    newegg: {
        name: 'نيو إج',
        commission: { min: 1, max: 4 },
        api: {
            baseUrl: 'https://api.newegg.com',
            trackingId: 'commissionpro',
            apiKey: 'YOUR_NEWEGG_API_KEY',
            affiliateId: 'commissionpro'
        },
        features: {
            productSearch: true,
            realTimeTracking: true,
            detailedAnalytics: true,
            techProducts: true,
            bulkOperations: true
        },
        categories: [
            'computers', 'electronics', 'gaming', 'components', 'peripherals',
            'software', 'networking', 'storage', 'mobile'
        ],
        supportedCountries: ['US', 'CA']
    },
    
    shein: {
        name: 'شين',
        commission: { min: 10, max: 20 },
        api: {
            baseUrl: 'https://api.shein.com',
            trackingId: 'commissionpro',
            apiKey: 'YOUR_SHEIN_API_KEY',
            affiliateId: 'commissionpro'
        },
        features: {
            productSearch: true,
            realTimeTracking: true,
            detailedAnalytics: true,
            fashionFocus: true,
            bulkOperations: true
        },
        categories: [
            'women', 'men', 'kids', 'beauty', 'home', 'shoes', 'bags',
            'accessories', 'jewelry', 'watches', 'underwear'
        ],
        supportedCountries: ['US', 'UK', 'CA', 'AU', 'FR', 'DE', 'ES', 'IT', 'SA', 'AE']
    },
    
    temu: {
        name: 'تيمو',
        commission: { min: 5, max: 20 },
        api: {
            baseUrl: 'https://api.temu.com',
            trackingId: 'commissionpro',
            apiKey: 'YOUR_TEMU_API_KEY',
            affiliateId: 'commissionpro'
        },
        features: {
            productSearch: true,
            realTimeTracking: true,
            detailedAnalytics: true,
            lowPrices: true,
            bulkOperations: true
        },
        categories: [
            'electronics', 'fashion', 'home', 'beauty', 'sports', 'toys',
            'pet', 'automotive', 'tools', 'jewelry', 'watches'
        ],
        supportedCountries: ['US', 'UK', 'CA', 'AU', 'FR', 'DE', 'ES', 'IT', 'SA', 'AE']
    }
};

// Enhanced App Configuration
const APP_CONFIG = {
    MIN_WITHDRAWAL: 10,
    REFERRAL_COMMISSION: 10,
    CURRENCY: 'USD',
    SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP'],
    SUPPORTED_COUNTRIES: ['US', 'UK', 'CA', 'DE', 'FR', 'IT', 'ES', 'JP', 'AU', 'SA', 'AE', 'EG', 'KW', 'QA', 'BH', 'OM', 'JO', 'LB', 'IQ'],
    DEFAULT_LANGUAGE: 'ar',
    TIMEZONE: 'Asia/Riyadh',
    MAX_PRODUCTS_PER_REQUEST: 50,
    CACHE_DURATION: 300000, // 5 minutes
    API_TIMEOUT: 30000,
    MAX_RETRY_ATTEMPTS: 3
};

// Rate Limiting Configuration
const RATE_LIMITS = {
    amazon: { requests: 100, window: 3600000 }, // 100 requests per hour
    aliexpress: { requests: 200, window: 3600000 },
    ebay: { requests: 150, window: 3600000 },
    walmart: { requests: 100, window: 3600000 },
    bestbuy: { requests: 80, window: 3600000 },
    newegg: { requests: 80, window: 3600000 },
    shein: { requests: 120, window: 3600000 },
    temu: { requests: 150, window: 3600000 }
};

// Webhook Configuration
const WEBHOOK_CONFIG = {
    endpoints: {
        amazon: 'https://commissionpro.com/webhooks/amazon',
        aliexpress: 'https://commissionpro.com/webhooks/aliexpress',
        ebay: 'https://commissionpro.com/webhooks/ebay',
        walmart: 'https://commissionpro.com/webhooks/walmart',
        bestbuy: 'https://commissionpro.com/webhooks/bestbuy',
        newegg: 'https://commissionpro.com/webhooks/newegg',
        shein: 'https://commissionpro.com/webhooks/shein',
        temu: 'https://commissionpro.com/webhooks/temu'
    },
    events: ['order_placed', 'order_shipped', 'order_delivered', 'order_cancelled', 'return_initiated']
};

// Enhanced API Configuration
const API_CONFIG = {
    BASE_URL: 'https://api.commissionpro.com/v1',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    HEADERS: {
        'Content-Type': 'application/json',
        'User-Agent': 'CommissionPro/1.0'
    }
};
