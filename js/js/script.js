// ===== Variables Globales =====
let earningsChart;
let todayChart, weekChart, monthChart, totalChart;
let platformChart;
let currentEarnings = {
    today: 0,
    week: 0,
    month: 0,
    total: 0
};

let products = [];
let transactions = [];
let currentPlatform = 'all';
let currentCategory = 'all';
let currentSort = 'commission';
let currentTransactionFilter = 'all';
let currentUser = null;

// Loading tips array
const loadingTips = [
    "نصيحة: شارك روابطك على وسائل التواصل الاجتماعي لزيادة الأرباح",
    "نصيحة: ركز على المنتجات ذات العمولة العالية لزيادة أرباحك",
    "نصيحة: استخدم أدوات التسويق المتقدمة لتحسين أدائك",
    "نصيحة: شارك تجربتك مع الآخرين لزيادة الإحالات",
    "نصيحة: تابع تحليلات الأداء لتحسين استراتيجياتك",
    "نصيحة: استخدم QR Codes لتسهيل مشاركة الروابط",
    "نصيحة: انضم إلى أكاديمية التسويق لتعلم المزيد",
    "نصيحة: راجع المنتجات الأكثر ربحاً بانتظام"
];

// ===== Initialisation au chargement du DOM =====
document.addEventListener('DOMContentLoaded', function() {
    // Show random loading tip
    const randomTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
    document.getElementById('loadingTip').textContent = randomTip;
    
    // Check if user is logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            initializeApp();
        } else {
            // Show landing page
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    document.getElementById('landingPage').style.display = 'block';
                }, 500);
            }, 2000);
        }
    });
});

// ===== Initialize App =====
async function initializeApp() {
    try {
        // Load user data
        await dbManager.getUserData(currentUser.uid);
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.getElementById('mainDashboard').style.display = 'block';
        }, 500);
        
        // Initialize components
        initializeEarningsDisplay();
        initializeCharts();
        startLiveUpdates();
        loadProducts();
        loadTransactions();
        loadNotifications();
        loadLeaderboard();
        
        // Add event listeners
        setupEventListeners();
        
        // Initialize real-time listeners
        setupRealTimeListeners();
        
        // Load user preferences
        loadUserPreferences();
        
        // Show welcome notification
        showNotification('مرحباً بك!', 'تم تحميل لوحة التحكم بنجاح', 'success');
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('خطأ', 'فشل تحميل لوحة التحكم', 'error');
    }
}

// ===== Setup Real-time Listeners =====
function setupRealTimeListeners() {
    if (!currentUser) return;
    
    // Listen for earnings updates
    db.collection('transactions')
        .where('userId', '==', currentUser.uid)
        .where('type', 'in', ['sale', 'referral'])
        .where('status', '==', 'completed')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const transaction = change.doc.data();
                    handleNewTransaction(transaction);
                }
            });
        });
    
    // Listen for notifications
    db.collection('notifications')
        .where('userId', '==', currentUser.uid)
        .where('read', '==', false)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const notification = change.doc.data();
                    showRealTimeNotification(notification);
                }
            });
        });
}

// ===== Handle New Transaction =====
async function handleNewTransaction(transaction) {
    try {
        // Update earnings
        currentEarnings.today += transaction.amount;
        currentEarnings.week += transaction.amount;
        currentEarnings.month += transaction.amount;
        currentEarnings.total += transaction.amount;
        
        // Update UI
        updateEarningsDisplay();
        
        // Show notification
        const typeText = transaction.type === 'sale' ? 'بيع' : 'إحالة';
        showNotification('مبيعات جديدة!', `ربحت $${transaction.amount.toFixed(2)} من ${typeText} جديد`, 'success');
        
        // Update charts
        updateMiniCharts();
        
        // Play sound (optional)
        playNotificationSound();
    } catch (error) {
        console.error('Error handling new transaction:', error);
    }
}

// ===== Show Real-time Notification =====
function showRealTimeNotification(notification) {
    const notificationList = document.getElementById('notificationList');
    const notificationItem = document.createElement('div');
    notificationItem.className = 'notification-item';
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    notificationItem.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${iconMap[notification.type] || 'fa-info-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${formatTime(notification.createdAt.toDate())}</div>
        </div>
        <button class="notification-close" onclick="markAsRead('${notification.id}', this.parentElement)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notificationList.insertBefore(notificationItem, notificationList.firstChild);
    
    // Limit notifications to 10
    while (notificationList.children.length > 10) {
        notificationList.removeChild(notificationList.lastChild);
    }
}

// ===== Mark Notification as Read =====
async function markAsRead(notificationId, element) {
    try {
        await dbManager.markNotificationAsRead(notificationId);
        element.style.opacity = '0.5';
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// ===== Load Notifications =====
async function loadNotifications() {
    try {
        const notifications = await dbManager.getNotifications(currentUser.uid, 10);
        const notificationList = document.getElementById('notificationList');
        
        notificationList.innerHTML = '';
        
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            
            const iconMap = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                info: 'fa-info-circle',
                warning: 'fa-exclamation-triangle'
            };
            
            notificationItem.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${iconMap[notification.type] || 'fa-info-circle'}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${formatTime(notification.createdAt.toDate())}</div>
                </div>
                ${!notification.read ? `
                    <button class="notification-close" onclick="markAsRead('${notification.id}', this.parentElement)">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            `;
            
            notificationList.appendChild(notificationItem);
        });
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// ===== Load Leaderboard =====
async function loadLeaderboard() {
    try {
        const leaderboard = await dbManager.getLeaderboard(10);
        const leaderboardList = document.getElementById('leaderboardList');
        
        leaderboardList.innerHTML = '';
        
        leaderboard.forEach((user, index) => {
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = 'leaderboard-item';
            
            leaderboardItem.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="user-info">
                    <div class="user-avatar">${user.name ? user.name[0] : 'م'}</div>
                    <div>
                        <div class="user-name">${user.name || 'مستخدم'}</div>
                        <div class="user-stats">${user.totalReferrals || 0} إحالة</div>
                    </div>
                </div>
                <div class="earnings">$${user.totalEarnings.toFixed(2)}</div>
            `;
            
            leaderboardList.appendChild(leaderboardItem);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// ===== Load User Preferences =====
async function loadUserPreferences() {
    try {
        const userData = await dbManager.getUserData(currentUser.uid);
        if (userData && userData.preferences) {
            // Apply user preferences
            if (userData.preferences.currency) {
                // Update currency display
                updateCurrencyDisplay(userData.preferences.currency);
            }
            
            if (userData.preferences.notifications === false) {
                // Disable notifications
                disableNotifications();
            }
        }
    } catch (error) {
        console.error('Error loading user preferences:', error);
    }
}

// ===== Update Currency Display =====
function updateCurrencyDisplay(currency) {
    // Update all currency displays
    const currencyElements = document.querySelectorAll('.currency-symbol, .balance-currency');
    currencyElements.forEach(element => {
        element.textContent = currency;
    });
}

// ===== Disable Notifications =====
function disableNotifications() {
    // Disable browser notifications
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                // Disable notifications
            }
        });
    }
}

// ===== Play Notification Sound =====
function playNotificationSound() {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// ===== Format Time =====
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    
    return date.toLocaleDateString('ar-SA');
}

// ===== Initialize Earnings Display =====
function initializeEarningsDisplay() {
    if (dbManager.userData) {
        currentEarnings.total = dbManager.userData.totalEarnings || 0;
        currentEarnings.today = 0;
        currentEarnings.week = 0;
        currentEarnings.month = 0;
        
        // Load today's earnings
        loadTodayEarnings();
        
        // Load week's earnings
        loadWeekEarnings();
        
        // Load month's earnings
        loadMonthEarnings();
        
        // Update display
        updateEarningsDisplay();
    }
}

// ===== Load Today's Earnings =====
async function loadTodayEarnings() {
    try {
        const earnings = await dbManager.getEarningsData(currentUser.uid, 'day');
        currentEarnings.today = earnings.total;
    } catch (error) {
        console.error('Error loading today\'s earnings:', error);
    }
}

// ===== Load Week's Earnings =====
async function loadWeekEarnings() {
    try {
        const earnings = await dbManager.getEarningsData(currentUser.uid, 'week');
        currentEarnings.week = earnings.total;
    } catch (error) {
        console.error('Error loading week\'s earnings:', error);
    }
}

// ===== Load Month's Earnings =====
async function loadMonthEarnings() {
    try {
        const earnings = await dbManager.getEarningsData(currentUser.uid, 'month');
        currentEarnings.month = earnings.total;
    } catch (error) {
        console.error('Error loading month\'s earnings:', error);
    }
}

// ===== Update Earnings Display =====
function updateEarningsDisplay() {
    // Update earnings display
    document.getElementById('todayEarnings').textContent = `$${currentEarnings.today.toFixed(2)}`;
    document.getElementById('weekEarnings').textContent = `$${currentEarnings.week.toFixed(2)}`;
    document.getElementById('monthEarnings').textContent = `$${currentEarnings.month.toFixed(2)}`;
    document.getElementById('totalEarnings').textContent = `$${currentEarnings.total.toFixed(2)}`;
    
    // Update banner stats
    document.getElementById('totalEarningsBanner').textContent = `$${currentEarnings.total.toFixed(2)}`;
    document.getElementById('totalSalesBanner').textContent = dbManager.userData ? dbManager.userData.totalSales : 0;
    document.getElementById('totalReferralsBanner').textContent = dbManager.userData ? dbManager.userData.totalReferrals : 0;
    
    // Update available balance
    document.getElementById('availableBalance').textContent = `$${currentEarnings.total.toFixed(2)}`;
    
    // Update referral earnings
    const referralEarnings = currentEarnings.total * 0.1; // 10% of total earnings
    document.getElementById('referralEarnings').textContent = `$${referralEarnings.toFixed(2)}`;
}

// ===== Load Products =====
async function loadProducts() {
    try {
        // Load products from database
        products = await dbManager.getProducts(currentPlatform, currentCategory);
        
        // If no products in database, load from API
        if (products.length === 0) {
            await loadProductsFromAPI();
        }
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('خطأ', 'فشل تحميل المنتجات', 'error');
    }
}

// ===== Load Products from API =====
async function loadProductsFromAPI() {
    try {
        let apiProducts = [];
        
        switch (currentPlatform) {
            case 'amazon':
                apiProducts = await apiManager.getAmazonProducts(currentCategory);
                break;
            case 'aliexpress':
                apiProducts = await apiManager.getAliExpressProducts(currentCategory);
                break;
            case 'temu':
                apiProducts = await apiManager.getTemuProducts(currentCategory);
                break;
            case 'ebay':
                apiProducts = await apiManager.getEbayProducts(currentCategory);
                break;
            default:
                // Load from all platforms
                const [amazon, aliexpress, temu, ebay] = await Promise.all([
                    apiManager.getAmazonProducts(),
                    apiManager.getAliExpressProducts(),
                    apiManager.getTemuProducts(),
                    apiManager.getEbayProducts()
                ]);
                apiProducts = [...amazon, ...aliexpress, ...temu, ...ebay];
        }
        
        // Save products to database
        for (const product of apiProducts) {
            await dbManager.addProduct(product);
        }
        
        products = apiProducts;
    } catch (error) {
        console.error('Error loading products from API:', error);
    }
}

// ===== Track Product Click =====
async function trackProductClick(productId, platform) {
    try {
        if (!currentUser) return;
        
        // Generate affiliate link
        const affiliateLink = await apiManager.generateAffiliateLink(productId, platform);
        
        if (affiliateLink) {
            // Track click
            await apiManager.trackClick(affiliateLink, currentUser.uid, navigator.userAgent, '');
            
            // Open affiliate link in new tab
            window.open(affiliateLink, '_blank');
            
            // Show notification
            showNotification('تم تتبع النقرة', 'تم فتح الرابط التابع بنجاح', 'success');
        }
    } catch (error) {
        console.error('Error tracking product click:', error);
        showNotification('خطأ', 'فشل تتبع النقرة', 'error');
    }
}

// ===== Copy Affiliate Link =====
async function copyAffiliateLink(productId, platform) {
    try {
        if (!currentUser) {
            showNotification('يرجى تسجيل الدخول', 'يجب تسجيل الدخول لنسخ الروابط', 'error');
            return;
        }
        
        // Generate affiliate link
        const affiliateLink = await apiManager.generateAffiliateLink(productId, platform);
        
        if (affiliateLink) {
            // Copy to clipboard
            await navigator.clipboard.writeText(affiliateLink);
            
            // Show notification
            showNotification('تم النسخ', 'تم نسخ الرابط التابع بنجاح', 'success');
        }
    } catch (error) {
        console.error('Error copying affiliate link:', error);
        showNotification('خطأ', 'فشل نسخ الرابط', 'error');
    }
}

// ===== Process Withdrawal =====
async function processWithdrawal(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showNotification('يرجى تسجيل الدخول', 'يجب تسجيل الدخول لسحب الأرباح', 'error');
        return;
    }
    
    const amount = parseFloat(document.getElementById('withdrawalAmount').value);
    const method = document.getElementById('withdrawalMethod').value;
    
    // Validate amount
    if (amount > currentEarnings.total) {
        showNotification('خطأ', 'المبلغ المطلوب أكبر من رصيدك المتاح', 'error');
        return;
    }
    
    if (amount < APP_CONFIG.MIN_WITHDRAWAL) {
        showNotification('خطأ', `الحد الأدنى للسحب هو $${APP_CONFIG.MIN_WITHDRAWAL}`, 'error');
        return;
    }
    
    try {
        // Show loading
        const button = event.target.querySelector('.withdrawal-button');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
        
        // Process withdrawal
        const success = await apiManager.processWithdrawal(currentUser.uid, amount, method, {});
        
        if (success) {
            // Update user data
            await dbManager.updateUserData(currentUser.uid, {
                totalEarnings: currentEarnings.total - amount
            });
            
            // Update earnings
            currentEarnings.total -= amount;
            updateEarningsDisplay();
            
            // Show success notification
            showNotification('تم بنجاح', `تم طلب سحب $${amount.toFixed(2)}`, 'success');
            
            // Reset form
            event.target.reset();
        } else {
            showNotification('خطأ', 'فشل معالجة طلب السحب', 'error');
        }
    } catch (error) {
        console.error('Error processing withdrawal:', error);
        showNotification('خطأ', 'فشل معالجة طلب السحب', 'error');
    } finally {
        // Reset button
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// ===== Show Tools Modal =====
function showToolsModal() {
    document.getElementById('toolsModal').classList.add('active');
}

// ===== Open Link Generator =====
function openLinkGenerator() {
    closeModal('toolsModal');
    showNotification('قريباً', 'مولد الروابط الذكي قيد التطوير', 'info');
}

// ===== Open QR Generator =====
function openQRGenerator() {
    closeModal('toolsModal');
    showNotification('قريباً', 'مولد QR Codes قيد التطوير', 'info');
}

// ===== Open Link Analyzer =====
function openLinkAnalyzer() {
    closeModal('toolsModal');
    showNotification('قريباً', 'محلل الروابط قيد التطوير', 'info');
}

// ===== Open Report Generator =====
function openReportGenerator() {
    closeModal('toolsModal');
    showNotification('قريباً', 'منشئ التقارير قيد التطوير', 'info');
}

// ===== Select Platform =====
function selectPlatform(platform) {
    currentPlatform = platform;
    document.getElementById('platformFilter').value = platform;
    filterProducts();
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ===== Scroll to Section =====
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== Show Loading =====
function showLoading() {
    // Show loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner-overlay';
    loadingSpinner.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingSpinner);
}

// ===== Hide Loading =====
function hideLoading() {
    // Hide loading spinner
    const loadingSpinner = document.querySelector('.loading-spinner-overlay');
    if (loadingSpinner) {
        loadingSpinner.remove();
    }
}

// Keep the rest of the existing functions...

// Initialize mini charts
function initializeMiniCharts() {
    // ... existing code ...
}

// Initialize charts
function initializeCharts() {
    // ... existing code ...
}

// Setup event listeners
function setupEventListeners() {
    // ... existing code ...
}

// And so on for all other existing functions...
