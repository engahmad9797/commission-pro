// ===== System Initialization Manager =====
class SystemInitializer {
    constructor() {
        this.loadingSteps = [
            { text: 'تهيئة الاتصال', icon: 'fa-wifi', duration: 1000 },
            { text: 'تحميل بيانات المستخدم', icon: 'fa-user', duration: 1500 },
            { text: 'تحميل المنتجات', icon: 'fa-box', duration: 2000 },
            { text: 'تحديث الأرباح', icon: 'fa-chart-line', duration: 1500 },
            { text: 'تهيئة الأدوات', icon: 'fa-tools', duration: 1000 },
            { text: 'تحضير لوحة التحكم', icon: 'fa-desktop', duration: 500 }
        ];
        this.currentStep = 0;
        this.loadingInterval = null;
    }

    async initialize() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Start loading animation
            this.startLoadingAnimation();
            
            // Initialize core systems
            await this.initializeCoreSystems();
            
            // Load user data
            await this.loadUserData();
            
            // Load platform data
            await this.loadPlatformData();
            
            // Initialize UI components
            await this.initializeUI();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Show welcome notification
            this.showWelcomeNotification();
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showErrorNotification(error.message);
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
        }
    }

    startLoadingAnimation() {
        this.currentStep = 0;
        this.updateLoadingStep();
        
        this.loadingInterval = setInterval(() => {
            this.currentStep++;
            if (this.currentStep < this.loadingSteps.length) {
                this.updateLoadingStep();
            } else {
                clearInterval(this.loadingInterval);
            }
        }, 100);
    }

    updateLoadingStep() {
        const step = this.loadingSteps[this.currentStep];
        if (!step) return;

        // Update loading text
        const loadingText = document.querySelector('.loading-content h2');
        if (loadingText) {
            loadingText.textContent = step.text;
        }

        // Update loading tip
        const tipElement = document.getElementById('loadingTip');
        if (tipElement) {
            const tips = [
                "نصيحة: استخدم أدوات التسويق المتقدمة لزيادة مبيعاتك",
                "نصيحة: ركز على المنتجات ذات العمولة العالية لزيادة أرباحك",
                "نصيحة: شارك روابطك على وسائل التواصل الاجتماعي",
                "نصيحة: تابع تحليلات الأداء لتحسين استراتيجياتك",
                "نصيحة: استخدم QR Codes لتسهيل مشاركة الروابط",
                "نصيحة: انضم إلى أكاديمية التسويق لتعلم المزيد"
            ];
            tipElement.textContent = tips[Math.floor(Math.random() * tips.length)];
        }

        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progress = ((this.currentStep + 1) / this.loadingSteps.length) * 100;
            progressBar.style.width = `${progress}%`;
        }

        // Update loading features
        const features = document.querySelectorAll('.feature-loading');
        features.forEach((feature, index) => {
            const icon = feature.querySelector('i');
            const text = feature.querySelector('span');
            
            if (index === this.currentStep) {
                icon.className = 'fas fa-spinner fa-spin';
                text.textContent = step.text;
            } else if (index < this.currentStep) {
                icon.className = 'fas fa-check';
                text.textContent = 'تم';
            }
        });
    }

    async initializeCoreSystems() {
        // Initialize Firebase
        if (typeof firebase !== 'undefined') {
            try {
                // Check if user is logged in
                auth.onAuthStateChanged(async (user) => {
                    if (user) {
                        currentUser = user;
                        await this.loadUserData();
                    } else {
                        // Show landing page
                        this.showLandingPage();
                    }
                });
            } catch (error) {
                console.error('Firebase initialization failed:', error);
            }
        }

        // Initialize API manager
        if (typeof apiManager !== 'undefined') {
            await apiManager.initialize();
        }

        // Initialize product manager
        if (typeof productManager !== 'undefined') {
            await productManager.initialize();
        }

        // Initialize analytics manager
        if (typeof analyticsManager !== 'undefined') {
            await analyticsManager.initialize();
        }

        // Initialize notifications manager
        if (typeof notificationsManager !== 'undefined') {
            await notificationsManager.initialize();
        }

        // Initialize campaigns manager
        if (typeof campaignsManager !== 'undefined') {
            await campaignsManager.initialize();
        }
    }

    async loadUserData() {
        if (!currentUser) return;

        try {
            // Load user profile
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Update UI with user data
                this.updateUserUI(userData);
                
                // Store user data globally
                window.userData = userData;
            }

            // Load user preferences
            await this.loadUserPreferences();

        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    updateUserUI(userData) {
        // Update user info in header
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');
        const userLevel = document.getElementById('userLevel');

        if (userName) userName.textContent = userData.name || 'مستخدم';
        if (userEmail) userEmail.textContent = userData.email || '';
        if (userAvatar) userAvatar.textContent = (userData.name || 'مستخدم')[0];
        if (userLevel) userLevel.textContent = this.getUserLevel(userData.totalEarnings || 0);

        // Show user menu
        const userInfo = document.getElementById('userInfo');
        const userDropdown = document.getElementById('userDropdown');
        const loginBtn = document.getElementById('loginBtn');

        if (userInfo) userInfo.style.display = 'flex';
        if (userDropdown) userDropdown.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
    }

    getUserLevel(earnings) {
        if (earnings < 100) return 'مبتدئ';
        if (earnings < 1000) return 'متوسط';
        if (earnings < 5000) return 'متقدم';
        if (earnings < 10000) return 'خبير';
        return 'محترف';
    }

    async loadUserPreferences() {
        if (!currentUser) return;

        try {
            const preferencesDoc = await db.collection('userPreferences').doc(currentUser.uid).get();
            if (preferencesDoc.exists) {
                const preferences = preferencesDoc.data();
                
                // Apply theme preference
                if (preferences.theme === 'dark') {
                    document.body.classList.add('dark-mode');
                    const themeToggle = document.getElementById('themeToggle');
                    if (themeToggle) {
                        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                    }
                }

                // Apply language preference
                if (preferences.language) {
                    document.documentElement.lang = preferences.language;
                }

                // Apply notification preferences
                if (preferences.notifications === false) {
                    // Disable browser notifications
                    if ('Notification' in window) {
                        Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                                // Disable notifications
                            }
                        });
                    }
                }

                // Store preferences globally
                window.userPreferences = preferences;
            }
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
    }

    async loadPlatformData() {
        try {
            // Load products from all platforms
            const platforms = ['amazon', 'aliexpress', 'ebay', 'walmart', 'bestbuy', 'newegg', 'shein', 'temu'];
            
            for (const platform of platforms) {
                try {
                    const products = await productManager.getPlatformProducts(platform, { limit: 50 });
                    
                    // Store products globally
                    if (!window.platformProducts) {
                        window.platformProducts = {};
                    }
                    window.platformProducts[platform] = products;
                    
                    // Update platform stats in UI
                    this.updatePlatformStats(platform, products);
                    
                } catch (error) {
                    console.error(`Error loading ${platform} products:`, error);
                }
            }

            // Update products grid
            this.updateProductsGrid();

        } catch (error) {
            console.error('Error loading platform data:', error);
        }
    }

    updatePlatformStats(platform, products) {
        const stats = {
            sales: products.length,
            earnings: products.reduce((sum, p)
