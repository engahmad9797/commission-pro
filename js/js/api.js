// API Integration Module
class APIManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Generic HTTP request method
    async request(url, options = {}) {
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the response
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Amazon API Integration
    async getAmazonProducts(category = 'all', page = 1) {
        try {
            const url = `${API_CONFIG.BASE_URL}/amazon/products`;
            const params = new URLSearchParams({
                category: category,
                page: page,
                limit: 20
            });

            const response = await this.request(`${url}?${params}`);
            return response.products || [];
        } catch (error) {
            console.error('Error fetching Amazon products:', error);
            return [];
        }
    }

    async getAmazonProductDetails(productId) {
        try {
            const url = `${API_CONFIG.BASE_URL}/amazon/products/${productId}`;
            const response = await this.request(url);
            return response.product || null;
        } catch (error) {
            console.error('Error fetching Amazon product details:', error);
            return null;
        }
    }

    // AliExpress API Integration
    async getAliExpressProducts(category = 'all', page = 1) {
        try {
            const url = `${API_CONFIG.BASE_URL}/aliexpress/products`;
            const params = new URLSearchParams({
                category: category,
                page: page,
                limit: 20
            });

            const response = await this.request(`${url}?${params}`);
            return response.products || [];
        } catch (error) {
            console.error('Error fetching AliExpress products:', error);
            return [];
        }
    }

    async getAliExpressProductDetails(productId) {
        try {
            const url = `${API_CONFIG.BASE_URL}/aliexpress/products/${productId}`;
            const response = await this.request(url);
            return response.product || null;
        } catch (error) {
            console.error('Error fetching AliExpress product details:', error);
            return null;
        }
    }

    // Temu API Integration
    async getTemuProducts(category = 'all', page = 1) {
        try {
            const url = `${API_CONFIG.BASE_URL}/temu/products`;
            const params = new URLSearchParams({
                category: category,
                page: page,
                limit: 20
            });

            const response = await this.request(`${url}?${params}`);
            return response.products || [];
        } catch (error) {
            console.error('Error fetching Temu products:', error);
            return [];
        }
    }

    async getTemuProductDetails(productId) {
        try {
            const url = `${API_CONFIG.BASE_URL}/temu/products/${productId}`;
            const response = await this.request(url);
            return response.product || null;
        } catch (error) {
            console.error('Error fetching Temu product details:', error);
            return null;
        }
    }

    // eBay API Integration
    async getEbayProducts(category = 'all', page = 1) {
        try {
            const url = `${API_CONFIG.BASE_URL}/ebay/products`;
            const params = new URLSearchParams({
                category: category,
                page: page,
                limit: 20
            });

            const response = await this.request(`${url}?${params}`);
            return response.products || [];
        } catch (error) {
            console.error('Error fetching eBay products:', error);
            return [];
        }
    }

    async getEbayProductDetails(productId) {
        try {
            const url = `${API_CONFIG.BASE_URL}/ebay/products/${productId}`;
            const response = await this.request(url);
            return response.product || null;
        } catch (error) {
            console.error('Error fetching eBay product details:', error);
            return null;
        }
    }

    // Generic product search
    async searchProducts(query, platform = 'all', page = 1) {
        try {
            const url = `${API_CONFIG.BASE_URL}/search`;
            const params = new URLSearchParams({
                q: query,
                platform: platform,
                page: page,
                limit: 20
            });

            const response = await this.request(`${url}?${params}`);
            return response.products || [];
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    }

    // Generate affiliate link
    async generateAffiliateLink(productId, platform) {
        try {
            const url = `${API_CONFIG.BASE_URL}/affiliate/generate`;
            const response = await this.request(url, {
                method: 'POST',
                body: JSON.stringify({
                    productId: productId,
                    platform: platform
                })
            });

            return response.affiliateLink || null;
        } catch (error) {
            console.error('Error generating affiliate link:', error);
            return null;
        }
    }

    // Track click
    async trackClick(linkId, userId, userAgent, ip) {
        try {
            const url = `${API_CONFIG.BASE_URL}/track/click`;
            await this.request(url, {
                method: 'POST',
                body: JSON.stringify({
                    linkId: linkId,
                    userId: userId,
                    userAgent: userAgent,
                    ip: ip
                })
            });
        } catch (error) {
            console.error('Error tracking click:', error);
        }
    }

    // Track conversion
    async trackConversion(linkId, userId, amount, orderId) {
        try {
            const url = `${API_CONFIG.BASE_URL}/track/conversion`;
            await this.request(url, {
                method: 'POST',
                body: JSON.stringify({
                    linkId: linkId,
                    userId: userId,
                    amount: amount,
                    orderId: orderId
                })
            });
        } catch (error) {
            console.error('Error tracking conversion:', error);
        }
    }

    // Get exchange rates
    async getExchangeRates() {
        try {
            const url = `${API_CONFIG.BASE_URL}/exchange-rates`;
            const response = await this.request(url);
            return response.rates || {};
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            return {};
        }
    }

    // Get trending products
    async getTrendingProducts(platform = 'all', limit = 10) {
        try {
            const url = `${API_CONFIG.BASE_URL}/trending`;
            const params = new URLSearchParams({
                platform: platform,
                limit: limit
            });

            const response = await this.request(`${url}?${params}`);
            return response.products || [];
        } catch (error) {
            console.error('Error fetching trending products:', error);
            return [];
        }
    }

    // Get product categories
    async getCategories(platform = 'all') {
        try {
            const url = `${API_CONFIG.BASE_URL}/categories`;
            const params = new URLSearchParams({
                platform: platform
            });

            const response = await this.request(`${url}?${params}`);
            return response.categories || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Validate withdrawal
    async validateWithdrawal(userId, amount, method) {
        try {
            const url = `${API_CONFIG.BASE_URL}/withdrawal/validate`;
            const response = await this.request(url, {
                method: 'POST',
                body: JSON.stringify({
                    userId: userId,
                    amount: amount,
                    method: method
                })
            });

            return response.valid || false;
        } catch (error) {
            console.error('Error validating withdrawal:', error);
            return false;
        }
    }

    // Process withdrawal
    async processWithdrawal(userId, amount, method, details) {
        try {
            const url = `${API_CONFIG.BASE_URL}/withdrawal/process`;
            const response = await this.request(url, {
                method: 'POST',
                body: JSON.stringify({
                    userId: userId,
                    amount: amount,
                    method: method,
                    details: details
                })
            });

            return response.success || false;
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            return false;
        }
    }

    // Get user statistics
    async getUserStatistics(userId) {
        try {
            const url = `${API_CONFIG.BASE_URL}/users/${userId}/statistics`;
            const response = await this.request(url);
            return response.statistics || {};
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            return {};
        }
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Remove specific cache entry
    removeFromCache(url, options = {}) {
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        this.cache.delete(cacheKey);
    }
}

// Initialize API manager
const apiManager = new APIManager();
