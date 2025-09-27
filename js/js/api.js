// Enhanced API Integration Module
class APIManager {
    constructor() {
        this.cache = new Map();
        this.rateLimiter = new Map();
        this.activeRequests = new Map();
        this.platforms = PLATFORMS;
        this.session = null;
    }

    // Generic HTTP request method with enhanced features
    async request(url, options = {}) {
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        const platform = this.extractPlatformFromUrl(url);
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < APP_CONFIG.CACHE_DURATION) {
                return cached.data;
            }
        }

        // Rate limiting
        if (platform && !this.checkRateLimit(platform)) {
            throw new Error(`Rate limit exceeded for ${platform}`);
        }

        // Cancel duplicate requests
        if (this.activeRequests.has(cacheKey)) {
            return this.activeRequests.get(cacheKey);
        }

        try {
            const requestPromise = this.makeRequest(url, options);
            this.activeRequests.set(cacheKey, requestPromise);
            
            const response = await requestPromise;
            
            // Cache successful responses
            if (response.ok) {
                this.cache.set(cacheKey, {
                    data: response.data,
                    timestamp: Date.now()
                });
            }
            
            return response.data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        } finally {
            this.activeRequests.delete(cacheKey);
        }
    }

    async makeRequest(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`,
                    'User-Agent': 'CommissionPro/1.0',
                    ...options.headers
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await this.handleErrorResponse(response);
                throw error;
            }

            const data = await response.json();
            return { ok: true, data };
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    async handleErrorResponse(response) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        return error;
    }

    async getAuthToken() {
        if (!this.session || this.session.expiresAt < Date.now()) {
            await this.refreshSession();
        }
        return this.session.token;
    }

    async refreshSession() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: localStorage.getItem('refreshToken')
                })
            });

            if (!response.ok) {
                throw new Error('Session refresh failed');
            }

            const data = await response.json();
            this.session = {
                token: data.token,
                refreshToken: data.refreshToken,
                expiresAt: Date.now() + (data.expiresIn * 1000)
            };

            localStorage.setItem('accessToken', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);

            return data.token;
        } catch (error) {
            console.error('Session refresh failed:', error);
            // Redirect to login if refresh fails
            window.location.href = '/login';
            throw error;
        }
    }

    extractPlatformFromUrl(url) {
        const platformPatterns = {
            amazon: /amazon/i,
            aliexpress: /aliexpress/i,
            ebay: /ebay/i,
            walmart: /walmart/i,
            bestbuy: /bestbuy/i,
            newegg: /newegg/i,
            shein: /shein/i,
            temu: /temu/i
        };

        for (const [platform, pattern] of Object.entries(platformPatterns)) {
            if (pattern.test(url)) {
                return platform;
            }
        }
        return null;
    }

    checkRateLimit(platform) {
        const now = Date.now();
        const limit = this.rateLimiter.get(platform) || { count: 0, resetTime: now + 60000 };

        if (now > limit.resetTime) {
            // Reset rate limit
            this.rateLimiter.set(platform, { count: 1, resetTime: now + 60000 });
            return true;
        }

        if (limit.count >= this.platforms[platform]?.rateLimit || 100) {
            return false;
        }

        limit.count++;
        this.rateLimiter.set(platform, limit);
        return true;
    }

    // Amazon API Integration
    async getAmazonProducts(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/amazon/products`;
        const searchParams = new URLSearchParams({
            marketplace: this.platforms.amazon.marketplace || 'US',
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getAmazonProductDetails(productId) {
        const url = `${API_CONFIG.BASE_URL}/amazon/products/${productId}`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async searchAmazonProducts(query, params = {}) {
        const url = `${API_CONFIG.BASE_URL}/amazon/search`;
        const searchParams = new URLSearchParams({
            q: query,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getAmazonCategories() {
        const url = `${API_CONFIG.BASE_URL}/amazon/categories`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async getAmazonDeals(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/amazon/deals`;
        const searchParams = new URLSearchParams(params);
        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // AliExpress API Integration
    async getAliExpressProducts(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/aliexpress/products`;
        const searchParams = new URLSearchParams({
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getAliExpressProductDetails(productId) {
        const url = `${API_CONFIG.BASE_URL}/aliexpress/products/${productId}`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async searchAliExpressProducts(query, params = {}) {
        const url = `${API_CONFIG.BASE_URL}/aliexpress/search`;
        const searchParams = new URLSearchParams({
            q: query,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getAliExpressCategories() {
        const url = `${API_CONFIG.BASE_URL}/aliexpress/categories`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async getAliExpressHotProducts(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/aliexpress/hot-products`;
        const searchParams = new URLSearchParams(params);
        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // eBay API Integration
    async getEbayProducts(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/ebay/products`;
        const searchParams = new URLSearchParams({
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getEbayProductDetails(productId) {
        const url = `${API_CONFIG.BASE_URL}/ebay/products/${productId}`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async searchEbayProducts(query, params = {}) {
        const url = `${API_CONFIG.BASE_URL}/ebay/search`;
        const searchParams = new URLSearchParams({
            q: query,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getEbayCategories() {
        const url = `${API_CONFIG.BASE_URL}/ebay/categories`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async getEbayDeals(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/ebay/deals`;
        const searchParams = new URLSearchParams(params);
        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // Walmart API Integration
    async getWalmartProducts(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/walmart/products`;
        const searchParams = new URLSearchParams({
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getWalmartProductDetails(productId) {
        const url = `${API_CONFIG.BASE_URL}/walmart/products/${productId}`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async searchWalmartProducts(query, params = {}) {
        const url = `${API_CONFIG.BASE_URL}/walmart/search`;
        const searchParams = new URLSearchParams({
            q: query,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getWalmartCategories() {
        const url = `${API_CONFIG.BASE_URL}/walmart/categories`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async getWalmartDeals(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/walmart/deals`;
        const searchParams = new URLSearchParams(params);
        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // Best Buy API Integration
    async getBestBuyProducts(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/bestbuy/products`;
        const searchParams = new URLSearchParams({
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getBestBuyProductDetails(productId) {
        const url = `${API_CONFIG.BASE_URL}/bestbuy/products/${productId}`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async searchBestBuyProducts(query, params = {}) {
        const url = `${API_CONFIG.BASE_URL}/bestbuy/search`;
        const searchParams = new URLSearchParams({
            q: query,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getBestBuyCategories() {
        const url = `${API_CONFIG.BASE_URL}/bestbuy/categories`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async getBestBuyDeals(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/bestbuy/deals`;
        const searchParams = new URLSearchParams(params);
        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // Newegg API Integration
    async getNeweggProducts(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/newegg/products`;
        const searchParams = new URLSearchParams({
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getNeweggProductDetails(productId) {
        const url = `${API_CONFIG.BASE_URL}/newegg/products/${productId}`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async searchNeweggProducts(query, params = {}) {
        const url = `${API_CONFIG.BASE_URL}/newegg/search`;
        const searchParams = new URLSearchParams({
            q: query,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getNeweggCategories() {
        const url = `${API_CONFIG.BASE_URL}/newegg/categories`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async getNeweggShellShocker(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/newegg/shell-shocker`;
        const searchParams = new URLSearchParams(params);
        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // Shein API Integration
    async getSheinProducts(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/shein/products`;
        const searchParams = new URLSearchParams({
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getSheinProductDetails(productId) {
        const url = `${API_CONFIG.BASE_URL}/shein/products/${productId}`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async searchSheinProducts(query, params = {}) {
        const url = `${API_CONFIG.BASE_URL}/shein/search`;
        const searchParams = new URLSearchParams({
            q: query,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getSheinCategories() {
        const url = `${API_CONFIG.BASE_URL}/shein/categories`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async getSheinTrending(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/shein/trending`;
        const searchParams = new URLSearchParams(params);
        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // Temu API Integration
    async getTemuProducts(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/temu/products`;
        const searchParams = new URLSearchParams({
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getTemuProductDetails(productId) {
        const url = `${API_CONFIG.BASE_URL}/temu/products/${productId}`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async searchTemuProducts(query, params = {}) {
        const url = `${API_CONFIG.BASE_URL}/temu/search`;
        const searchParams = new URLSearchParams({
            q: query,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    async getTemuCategories() {
        const url = `${API_CONFIG.BASE_URL}/temu/categories`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    async getTemuWholesale(params = {}) {
        const url = `${API_CONFIG.BASE_URL}/temu/wholesale`;
        const searchParams = new URLSearchParams(params);
        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // Multi-platform search
    async searchAllPlatforms(query, params = {}) {
        const platforms = ['amazon', 'aliexpress', 'ebay', 'walmart', 'bestbuy', 'newegg', 'shein', 'temu'];
        const results = {};

        for (const platform of platforms) {
            try {
                switch (platform) {
                    case 'amazon':
                        results.amazon = await this.searchAmazonProducts(query, params);
                        break;
                    case 'aliexpress':
                        results.aliexpress = await this.searchAliExpressProducts(query, params);
                        break;
                    case 'ebay':
                        results.ebay = await this.searchEbayProducts(query, params);
                        break;
                    case 'walmart':
                        results.walmart = await this.searchWalmartProducts(query, params);
                        break;
                    case 'bestbuy':
                        results.bestbuy = await this.searchBestBuyProducts(query, params);
                        break;
                    case 'newegg':
                        results.newegg = await this.searchNeweggProducts(query, params);
                        break;
                    case 'shein':
                        results.shein = await this.searchSheinProducts(query, params);
                        break;
                    case 'temu':
                        results.temu = await this.searchTemuProducts(query, params);
                        break;
                }
            } catch (error) {
                console.error(`Error searching ${platform}:`, error);
                results[platform] = { error: error.message };
            }
        }

        return results;
    }

    // Generate affiliate link
    async generateAffiliateLink(productId, platform, options = {}) {
        const url = `${API_CONFIG.BASE_URL}/affiliate/generate`;
        
        return await this.request(url, {
            method: 'POST',
            body: JSON.stringify({
                productId,
                platform,
                userId: currentUser.uid,
                trackingId: this.platforms[platform]?.trackingId,
                ...options
            })
        });
    }

    // Track click
    async trackClick(linkId, options = {}) {
        const url = `${API_CONFIG.BASE_URL}/track/click`;
        
        return await this.request(url, {
            method: 'POST',
            body: JSON.stringify({
                linkId,
                userId: currentUser.uid,
                userAgent: navigator.userAgent,
                ip: options.ip || '',
                referrer: document.referrer,
                ...options
            })
        });
    }

    // Track conversion
    async trackConversion(linkId, options = {}) {
        const url = `${API_CONFIG.BASE_URL}/track/conversion`;
        
        return await this.request(url, {
            method: 'POST',
            body: JSON.stringify({
                linkId,
                userId: currentUser.uid,
                amount: options.amount,
                orderId: options.orderId,
                ...options
            })
        });
    }

    // Get product analytics
    async getProductAnalytics(productId, platform, params = {}) {
        const url = `${API_CONFIG.BASE_URL}/analytics/products/${productId}`;
        const searchParams = new URLSearchParams({
            platform,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // Get trending products
    async getTrendingProducts(platform = 'all', params = {}) {
        const url = `${API_CONFIG.BASE_URL}/trending/products`;
        const searchParams = new URLSearchParams({
            platform,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // Get hot deals
    async getHotDeals(platform = 'all', params = {}) {
        const url = `${API_CONFIG.BASE_URL}/deals/hot`;
        const searchParams = new URLSearchParams({
            platform,
            ...params
        });

        return await this.request(`${url}?${searchParams}`, {
            method: 'GET'
        });
    }

    // Get exchange rates
    async getExchangeRates() {
        const url = `${API_CONFIG.BASE_URL}/exchange-rates`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Clear specific cache entry
    removeFromCache(url, options = {}) {
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        this.cache.delete(cacheKey);
    }

    // Get cache statistics
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.entries())
        };
    }

    // Health check
    async healthCheck() {
        const url = `${API_CONFIG.BASE_URL}/health`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    // Get API status
    async getApiStatus() {
        const platforms = ['amazon', 'aliexpress', 'ebay', 'walmart', 'bestbuy', 'newegg', 'shein', 'temu'];
        const status = {};

        for (const platform of platforms) {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/${platform}/health`, {
                    method: 'GET',
                    timeout: 5000
                });
                status[platform] = {
                    status: response.ok ? 'healthy' : 'unhealthy',
                    responseTime: response.headers.get('X-Response-Time')
                };
            } catch (error) {
                status[platform] = {
                    status: 'unhealthy',
                    error: error.message
                };
            }
        }

        return status;
    }
}

// Enhanced Product Manager
class ProductManager {
    constructor(apiManager) {
        this.apiManager = apiManager;
        this.products = new Map();
        this.filters = {
            platform: 'all',
            category: 'all',
            minPrice: 0,
            maxPrice: Infinity,
            minRating: 0,
            maxRating: 5,
            sortBy: 'relevance',
            sortOrder: 'desc'
        };
    }

    async searchProducts(query, options = {}) {
        const {
            platforms = ['all'],
            limit = 20,
            offset = 0,
            ...filters
        } = options;

        this.updateFilters(filters);

        if (platforms.includes('all')) {
            return await this.searchAllPlatforms(query, { limit, offset, ...filters });
        }

        const results = {};
        for (const platform of platforms) {
            try {
                results[platform] = await this.searchPlatformProducts(platform, query, { limit, offset, ...filters });
            } catch (error) {
                console.error(`Error searching ${platform}:`, error);
                results[platform] = { error: error.message, products: [] };
            }
        }

        return results;
    }

    async searchPlatformProducts(platform, query, options = {}) {
        const { limit = 20, offset = 0, ...filters } = options;
        this.updateFilters(filters);

        switch (platform) {
            case 'amazon':
                return await this.apiManager.searchAmazonProducts(query, { limit, offset, ...filters });
            case 'aliexpress':
                return await this.apiManager.searchAliExpressProducts(query, { limit, offset, ...filters });
            case 'ebay':
                return await this.apiManager.searchEbayProducts(query, { limit, offset, ...filters });
            case 'walmart':
                return await this.apiManager.searchWalmartProducts(query, { limit, offset, ...filters });
            case 'bestbuy':
                return await this.apiManager.searchBestBuyProducts(query, { limit, offset, ...filters });
            case 'newegg':
                return await this.apiManager.searchNeweggProducts(query, { limit, offset, ...filters });
            case 'shein':
                return await this.apiManager.searchSheinProducts(query, { limit, offset, ...filters });
            case 'temu':
                return await this.apiManager.searchTemuProducts(query, { limit, offset, ...filters });
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }

    async getTrendingProducts(platform = 'all', options = {}) {
        const { limit = 20 } = options;

        if (platform === 'all') {
            return await this.apiManager.getTrendingProducts('all', { limit });
        }

        switch (platform) {
            case 'amazon':
                return await this.apiManager.getAmazonDeals({ limit });
            case 'aliexpress':
                return await this.apiManager.getAliExpressHotProducts({ limit });
            case 'ebay':
                return await this.apiManager.getEbayDeals({ limit });
            case 'walmart':
                return await this.apiManager.getWalmartDeals({ limit });
            case 'bestbuy':
                return await this.apiManager.getBestBuyDeals({ limit });
            case 'newegg':
                return await this.apiManager.getNeweggShellShocker({ limit });
            case 'shein':
                return await this.apiManager.getSheinTrending({ limit });
            case 'temu':
                return await this.apiManager.getTemuWholesale({ limit });
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }

    async getProductDetails(platform, productId) {
        switch (platform) {
            case 'amazon':
                return await this.apiManager.getAmazonProductDetails(productId);
            case 'aliexpress':
                return await this.apiManager.getAliExpressProductDetails(productId);
            case 'ebay':
                return await this.apiManager.getEbayProductDetails(productId);
            case 'walmart':
                return await this.apiManager.getWalmartProductDetails(productId);
            case 'bestbuy':
                return await this.apiManager.getBestBuyProductDetails(productId);
            case 'newegg':
                return await this.apiManager.getNeweggProductDetails(productId);
            case 'shein':
                return await this.apiManager.getSheinProductDetails(productId);
            case 'temu':
                return await this.apiManager.getTemuProductDetails(productId);
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }

    async getCategories(platform = 'all') {
        if (platform === 'all') {
            const categories = {};
            const platforms = ['amazon', 'aliexpress', 'ebay', 'walmart', 'bestbuy', 'newegg', 'shein', 'temu'];
            
            for (const p of platforms) {
                try {
                    categories[p] = await this.getPlatformCategories(p);
                } catch (error) {
                    console.error(`Error getting categories for ${p}:`, error);
                    categories[p] = [];
                }
            }
            
            return categories;
        }

        return await this.getPlatformCategories(platform);
    }

    async getPlatformCategories(platform) {
        switch (platform) {
            case 'amazon':
                return await this.apiManager.getAmazonCategories();
            case 'aliexpress':
                return await this.apiManager.getAliExpressCategories();
            case 'ebay':
                return await this.apiManager.getEbayCategories();
            case 'walmart':
                return await this.apiManager.getWalmartCategories();
            case 'bestbuy':
                return await this.apiManager.getBestBuyCategories();
            case 'newegg':
                return await this.apiManager.getNeweggCategories();
            case 'shein':
                return await this.apiManager.getSheinCategories();
            case 'temu':
                return await this.apiManager.getTemuCategories();
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }

    async getHotDeals(platform = 'all', options = {}) {
        const { limit = 20 } = options;
        return await this.apiManager.getHotDeals(platform, { limit });
    }

    updateFilters(filters) {
        this.filters = { ...this.filters, ...filters };
    }

    filterProducts(products) {
        return products.filter(product => {
            // Platform filter
            if (this.filters.platform !== 'all' && product.platform !== this.filters.platform) {
                return false;
            }

            // Category filter
            if (this.filters.category !== 'all' && product.category !== this.filters.category) {
                return false;
            }

            // Price filter
            if (product.price < this.filters.minPrice || product.price > this.filters.maxPrice) {
                return false;
            }

            // Rating filter
            if (product.rating < this.filters.minRating || product.rating > this.filters.maxRating) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            let comparison = 0;
            
            switch (this.filters.sortBy) {
                case 'price':
                    comparison = a.price - b.price;
                    break;
                case 'rating':
                    comparison = a.rating - b.rating;
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'relevance':
                default:
                    comparison = 0;
            }

            return this.filters.sortOrder === 'desc' ? -comparison : comparison;
        });
    }

    async generateAffiliateLink(platform, productId, options = {}) {
        return await this.apiManager.generateAffiliateLink(productId, platform, options);
    }

    async trackProductClick(platform, productId, options = {}) {
        const linkId = `${platform}_${productId}_${currentUser.uid}`;
        return await this.apiManager.trackClick(linkId, options);
    }

    async trackProductConversion(platform, productId, options = {}) {
        const linkId = `${platform}_${productId}_${currentUser.uid}`;
        return await this.apiManager.trackConversion(linkId, options);
    }

    async getProductAnalytics(platform, productId, options = {}) {
        return await this.apiManager.getProductAnalytics(productId, platform, options);
    }

    clearCache() {
        this.products.clear();
        this.apiManager.clearCache();
    }
}

// Enhanced Analytics Manager
class AnalyticsManager {
    constructor(apiManager) {
        this.apiManager = apiManager;
        this.charts = new Map();
        this.data = {
            earnings: [],
            clicks: [],
            conversions: [],
            platforms: {},
            products: [],
            campaigns: {},
            timeSeries: {}
        };
        this.filters = {
            period: 'month',
            platform: 'all',
            category: 'all',
            startDate: null,
            endDate: null
        };
    }

    async initialize() {
        await this.loadAnalyticsData();
        this.initializeCharts();
        this.setupRealTimeUpdates();
    }

    async loadAnalyticsData() {
        try {
            // Load earnings data
            const earningsData = await this.getEarningsData();
            this.data.earnings = earningsData;

            // Load platform data
            const platformData = await this.getPlatformData();
            this.data.platforms = platformData;

            // Load product data
            const productData = await this.getProductData();
            this.data.products = productData;

            // Load campaign data
            const campaignData = await this.getCampaignData();
            this.data.campaigns = campaignData;

            // Load time series data
            const timeSeriesData = await this.getTimeSeriesData();
            this.data.timeSeries = timeSeriesData;

            this.updateCharts();
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    async getEarningsData() {
        const snapshot = await db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .where('type', 'in', ['sale', 'referral'])
            .where('status', '==', 'completed')
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().createdAt.toDate()
        }));
    }

    async getPlatformData() {
        const snapshot = await db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .where('type', 'in', ['sale', 'referral'])
            .where('status', '==', 'completed')
            .get();

        const platformData = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!platformData[data.platform]) {
                platformData[data.platform] = {
                    earnings: 0,
                    sales: 0,
                    clicks: 0
                };
            }
            platformData[data.platform].earnings += data.amount;
            platformData[data.platform].sales += 1;
        });

        return platformData;
    }

    async getProductData() {
        const snapshot = await db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .where('type', '==', 'sale')
            .where('status', '==', 'completed')
            .orderBy('amount', 'desc')
            .limit(20)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getCampaignData() {
        const snapshot = await db.collection('campaigns')
            .where('userId', '==', currentUser.uid)
            .get();

        const campaignData = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            campaignData[data.id] = {
                ...data,
                stats: data.stats || {
                    clicks: 0,
                    conversions: 0,
                    earnings: 0
                }
            };
        });

        return campaignData;
    }

    async getTimeSeriesData() {
        const now = new Date();
        const days = this.filters.period === 'week' ? 7 : 30;
        const timeSeriesData = {};

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const snapshot = await db.collection('transactions')
                .where('userId', '==', currentUser.uid)
                .where('type', 'in', ['sale', 'referral'])
                .where('status', '==', 'completed')
                .where('createdAt', '>=', new Date(dateStr + 'T00:00:00'))
                .where('createdAt', '<', new Date(dateStr + 'T23:59:59'))
                .get();

            timeSeriesData[dateStr] = {
                earnings: snapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0),
                sales: snapshot.docs.length,
                clicks: snapshot.docs.reduce((sum, doc) => sum + (doc.data().clicks || 0), 0)
            };
        }

        return timeSeriesData;
    }

    initializeCharts() {
        // Earnings chart
        const earningsCtx = document.getElementById('earningsChart');
        if (earningsCtx) {
            this.charts.set('earnings', new Chart(earningsCtx, {
                type: 'line',
                data: {
                    labels: Object.keys(this.data.timeSeries),
                    datasets: [{
                        label: 'الأرباح ($)',
                        data: Object.values(this.data.timeSeries).map(d => d.earnings),
                        borderColor: '#FF6B35',
                        backgroundColor: 'rgba(255, 107, 53, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#FF6B35',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return 'الأرباح: $' + context.parsed.y.toFixed(2);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value;
                                }
                            }
                        }
                    }
                }
            }));
        }

        // Platform distribution chart
        const platformCtx = document.getElementById('platformDistributionChart');
        if (platformCtx) {
            this.charts.set('platform', new Chart(platformCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(this.data.platforms),
                    datasets: [{
                        data: Object.values(this.data.platforms).map(p => p.earnings),
                        backgroundColor: [
                            '#FF9900',
                            '#FF474C',
                            '#E53238',
                            '#0071CE',
                            '#FDBB30',
                            '#EC2027',
                            '#F8563E',
                            '#00BFFF'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': $' + context.parsed.toFixed(2);
                                }
                            }
                        }
                    }
                }
            }));
        }

        // Product performance chart
        const productCtx = document.getElementById('productPerformanceChart');
        if (productCtx) {
            this.charts.set('products', new Chart(productCtx, {
                type: 'bar',
                data: {
                    labels: this.data.products.map(p => p.description || 'منتج').slice(0, 10),
                    datasets: [{
                        label: 'المبيعات ($)',
                        data: this.data.products.slice(0, 10).map(p => p.amount),
                        backgroundColor: '#FF6B35',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#FF6B35',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    return 'المبيعات: $' + context.parsed.y.toFixed(2);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value;
                                }
                            }
                        }
                    }
                }
            }));
        }
    }

    updateCharts() {
        // Update earnings chart
        const earningsChart = this.charts.get('earnings');
        if (earningsChart) {
            earningsChart.data.labels = Object.keys(this.data.timeSeries);
            earningsChart.data.datasets[0].data = Object.values(this.data.timeSeries).map(d => d.earnings);
            earningsChart.update();
        }

        // Update platform chart
        const platformChart = this.charts.get('platform');
        if (platformChart) {
            platformChart.data.labels = Object.keys(this.data.platforms);
            platformChart.data.datasets[0].data = Object.values(this.data.platforms).map(p => p.earnings);
            platformChart.update();
        }

        // Update products chart
        const productsChart = this.charts.get('products');
        if (productsChart) {
            productsChart.data.labels = this.data.products.map(p => p.description || 'منتج').slice(0, 10);
            productsChart.data.datasets[0].data = this.data.products.slice(0, 10).map(p => p.amount);
            productsChart.update();
        }
    }

    setupRealTimeUpdates() {
        // Listen for real-time transaction updates
        db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .where('type', 'in', ['sale', 'referral'])
            .where('status', '==', 'completed')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        this.handleNewTransaction(change.doc.data());
                    }
                });
            });

        // Update charts every 30 seconds
        setInterval(() => {
            this.loadAnalyticsData();
        }, 30000);
    }

    handleNewTransaction(transaction) {
        // Update time series data
        const date = transaction.createdAt.toDate().toISOString().split('T')[0];
        if (!this.data.timeSeries[date]) {
            this.data.timeSeries[date] = { earnings: 0, sales: 0, clicks: 0 };
        }
        this.data.timeSeries[date].earnings += transaction.amount;
        this.data.timeSeries[date].sales += 1;

        // Update platform data
        if (!this.data.platforms[transaction.platform]) {
            this.data.platforms[transaction.platform] = { earnings: 0, sales: 0, clicks: 0 };
        }
        this.data.platforms[transaction.platform].earnings += transaction.amount;
        this.data.platforms[transaction.platform].sales += 1;

        // Update charts
        this.updateCharts();

        // Show notification
        showNotification('مبيعات جديدة!', `ربحت $${transaction.amount.toFixed(2)} من عملية بيع جديدة`, 'success');
    }

    async exportAnalytics(format = 'json') {
        try {
            const exportData = {
                earnings: this.data.earnings,
                platforms: this.data.platforms,
                products: this.data.products,
                campaigns: this.data.campaigns,
                timeSeries: this.data.timeSeries,
                filters: this.filters,
                exportedAt: new Date().toISOString()
            };

            let content, filename, mimeType;

            switch (format) {
                case 'json':
                    content = JSON.stringify(exportData, null, 2);
                    filename = `analytics-${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
                    break;
                case 'csv':
                    content = this.convertToCSV(exportData);
                    filename = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;
                case 'pdf':
                    // PDF export would require a library like jsPDF
                    content = JSON.stringify(exportData, null, 2);
                    filename = `analytics-${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
                    showNotification('قريباً', 'تصدير PDF قيد التطوير', 'info');
                    return;
                default:
                    throw new Error('Unsupported export format');
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            showNotification('تم التصدير', `تم تصدير التحليلات كـ ${format.toUpperCase()} بنجاح`, 'success');
        } catch (error) {
            console.error('Error exporting analytics:', error);
            showNotification('خطأ', 'فشل تصدير التحليلات', 'error');
        }
    }

    convertToCSV(data) {
        const headers = ['Date', 'Platform', 'Product', 'Amount', 'Type'];
        const rows = [headers];

        // Add earnings data
        data.earnings.forEach(transaction => {
            rows.push([
                transaction.date,
                transaction.platform,
                transaction.description || '',
                transaction.amount,
                transaction.type
            ]);
        });

        return rows.map(row => row.join(',')).join('\n');
    }

    updateFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.loadAnalyticsData();
    }

    getSummary() {
        const totalEarnings = Object.values(this.data.platforms).reduce((sum, p) => sum + p.earnings, 0);
        const totalSales = Object.values(this.data.platforms).reduce((sum, p) => sum + p.sales, 0);
        const totalClicks = Object.values(this.data.platforms).reduce((sum, p) => sum + (p.clicks || 0), 0);
        const conversionRate = totalSales > 0 ? (totalSales / totalClicks * 100).toFixed(2) : 0;

        return {
            totalEarnings,
            totalSales,
            totalClicks,
            conversionRate,
            topPlatform: Object.entries(this.data.platforms).sort((a, b) => b[1].earnings - a[1].earnings)[0][0],
            topProduct: this.data.products[0]
        };
    }

    async getPredictions() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/analytics/predictions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.apiManager.getAuthToken()}`
                },
                body: JSON.stringify({
                    historicalData: this.data.timeSeries,
                    currentTrends: this.getTrends()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get predictions');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting predictions:', error);
            return null;
        }
    }

    getTrends() {
        const trends = {
            earnings: [],
            sales: [],
            clicks: []
        };

        const dates = Object.keys(this.data.timeSeries).sort();
        
        for (let i = 1; i < dates.length; i++) {
            const current = this.data.timeSeries[dates[i]];
            const previous = this.data.timeSeries[dates[i - 1]];
            
            trends.earnings.push(current.earnings - previous.earnings);
            trends.sales.push(current.sales - previous.sales);
            trends.clicks.push(current.clicks - previous.clicks);
        }

        return trends;
    }
}

// Initialize managers
const apiManager = new APIManager();
const productManager = new ProductManager(apiManager);
const analyticsManager = new AnalyticsManager(apiManager);

// Global functions for platform integration
async function searchAllPlatforms(query, options = {}) {
    return await productManager.searchProducts(query, options);
}

async function getPlatformProducts(platform, options = {}) {
    return await productManager.searchPlatformProducts(platform, '', options);
}

async function getTrendingProducts(platform = 'all', options = {}) {
    return await productManager.getTrendingProducts(platform, options);
}

async function getHotDeals(platform = 'all', options = {}) {
    return await productManager.getHotDeals(platform, options);
}

async function generateAffiliateLink(platform, productId, options = {}) {
    return await productManager.generateAffiliateLink(platform, productId, options);
}

async function trackProductClick(platform, productId, options = {}) {
    return await productManager.trackProductClick(platform, productId, options);
}

async function trackProductConversion(platform, productId, options = {}) {
    return await productManager.trackProductConversion(platform, productId, options);
}

async function exportAnalytics(format = 'json') {
    return await analyticsManager.exportAnalytics(format);
}

async function getAnalyticsSummary() {
    return await analyticsManager.getSummary();
}

async function getPredictions() {
    return await analyticsManager.getPredictions();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await apiManager.initialize();
        await productManager.initialize();
        await analyticsManager.initialize();
        
        console.log('All managers initialized successfully');
    } catch (error) {
        console.error('Error initializing managers:', error);
        showNotification('خطأ', 'فشل تهيئة النظام', 'error');
    }
});
const { calculateCommission } = require('./tools');

function handleSale(product) {
  const commission = calculateCommission(product.price, product.platform);
  console.log(`Commission earned: $${commission}`);
}
