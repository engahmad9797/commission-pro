// ===== Variables Globales =====
let earningsChart;
let currentEarnings = {
    today: 45.67,
    week: 312.45,
    month: 1247.89,
    total: 2847.50
};

let products = [];
let transactions = [];
let currentPlatform = 'all';
let currentCategory = 'all';

// API URLs for different platforms (placeholder URLs)
const API_ENDPOINTS = {
    amazon: 'https://api.example.com/amazon/products',
    aliexpress: 'https://api.example.com/aliexpress/products',
    temu: 'https://api.example.com/temu/products'
};

// ===== Initialisation au chargement du DOM =====
document.addEventListener('DOMContentLoaded', function() {
    // Masquer l'écran de chargement
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
    
    // Initialiser les composants
    initializeEarningsDisplay();
    initializeChart();
    startLiveUpdates();
    loadProducts();
    loadTransactions();
    
    // Ajouter les écouteurs d'événements
    setupEventListeners();
    
    // Simuler les gains initiaux
    simulateInitialEarnings();
});

// ===== Initialiser l'affichage des gains =====
function initializeEarningsDisplay() {
    animateValue('todayEarnings', 0, currentEarnings.today, 2000);
    animateValue('weekEarnings', 0, currentEarnings.week, 2000);
    animateValue('monthEarnings', 0, currentEarnings.month, 2000);
    animateValue('totalEarnings', 0, currentEarnings.total, 2000);
    
    // Animer les statistiques
    animateValue('totalClicks', 0, 1247, 2000);
    animateValue('totalSales', 0, 89, 2000);
    animateValue('activeReferrals', 0, 342, 2000);
    
    // Animer le taux de conversion
    animateValue('conversionRate', 0, 7.1, 2000, true);
}

// ===== Animer les nombres =====
function animateValue(id, start, end, duration, isPercentage = false) {
    const obj = document.getElementById(id);
    const range = end - start;
    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);
    const startTime = new Date().getTime();
    const endTime = startTime + duration;
    let timer;
    
    function run() {
        const now = new Date().getTime();
        const remaining = Math.max((endTime - now) / duration, 0);
        const value = end - (remaining * range);
        
        if (isPercentage) {
            obj.innerHTML = value.toFixed(1) + '%';
        } else {
            obj.innerHTML = Math.floor(value).toLocaleString();
        }
        
        if (value <= end) {
            clearInterval(timer);
        }
    }
    
    timer = setInterval(run, stepTime);
    run();
}

// ===== Initialiser le graphique =====
function initializeChart() {
    const ctx = document.getElementById('earningsChart').getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 107, 53, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 107, 53, 0.0)');
    
    earningsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
            datasets: [{
                label: 'الأرباح ($)',
                data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
                borderColor: '#FF6B35',
                backgroundColor: gradient,
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
    });
}

// ===== Charger les produits =====
function loadProducts() {
    // Simuler le chargement des produits depuis différentes plateformes
    const mockProducts = [
        {
            id: 1,
            title: 'دورة التسويق الرقمي المتقدمة',
            category: 'digital',
            platform: 'amazon',
            price: 199,
            commission: 75,
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500',
            description: 'دورة شاملة تعلمك أسرار التسويق الرقمي من الصفر حتى الاحتراف.',
            affiliateLink: 'https://YOUR_ID.clickbank.product'
        },
        {
            id: 2,
            title: 'كاميرا Canon EOS R5',
            category: 'electronics',
            platform: 'amazon',
            price: 3899,
            commission: 5.5,
            image: 'https://m.media-amazon.com/images/I/71h6KpJ6pBL._AC_SL1500_.jpg',
            description: 'كاميرا احترافية 45 ميجابكسل مع تثبيت صورة متقدم.',
            affiliateLink: 'https://www.amazon.com/dp/B0863FBGRM?tag=YOUR_ID-20'
        },
        {
            id: 3,
            title: 'ساعة ذكية Xiaomi Mi Band 7',
            category: 'electronics',
            platform: 'aliexpress',
            price: 59.99,
            commission: 15,
            image: 'https://ae01.alicdn.com/kf/Sd4e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8/Xiaomi-Mi-Band-7.jpg',
            description: 'ساعة ذكية متطورة مع تتبع النشاط البدني والصحة.',
            affiliateLink: 'https://www.aliexpress.com/item/1005001234567890.html?aff_platform=link'
        },
        {
            id: 4,
            title: 'حقيبة ظهر مقاومة للماء',
            category: 'fashion',
            platform: 'temu',
            price: 24.99,
            commission: 20,
            image: 'https://example.com/backpack.jpg',
            description: 'حقيبة ظهر عصرية متينة ومقاومة للماء.',
            affiliateLink: 'https://www.temu.com/g/backpack.html?refer_id=YOUR_ID'
        },
        {
            id: 5,
            title: 'سماعات لاسلكية Sony WH-1000XM4',
            category: 'electronics',
            platform: 'amazon',
            price: 349,
            commission: 8,
            image: 'https://m.media-amazon.com/images/I/71o8Q5XJ5mL._AC_SL1500_.jpg',
            description: 'سماعات لاسلكية بإلغاء الضوضاء النشط وجودة صوت استثنائية.',
            affiliateLink: 'https://www.amazon.com/dp/B0863XRM2J?tag=YOUR_ID-20'
        },
        {
            id: 6,
            title: 'طقم أدوات DIY 200 قطعة',
            category: 'home',
            platform: 'aliexpress',
            price: 39.99,
            commission: 25,
            image: 'https://ae01.alicdn.com/kf/Sd4e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8/Tool-Set.jpg',
            description: 'طقم أدوات متكامل لجميع أعمال الصيانة والتركيب.',
            affiliateLink: 'https://www.aliexpress.com/item/1005001234567891.html?aff_platform=link'
        }
    ];
    
    products = mockProducts;
    displayProducts(products);
}

// ===== Afficher les produits =====
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// ===== Créer une carte produit =====
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const platformClass = product.platform;
    const commissionClass = product.commission >= 20 ? 'high' : product.commission >= 10 ? 'medium' : 'low';
    
    card.innerHTML = `
        <div class="product-header">
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="platform-badge ${platformClass}">${getPlatformName(product.platform)}</div>
            <div class="commission-badge ${commissionClass}">${product.commission}%</div>
        </div>
        <div class="product-body">
            <h4 class="product-title">${product.title}</h4>
            <div class="product-category">
                <i class="fas fa-tag"></i>
                ${getCategoryName(product.category)}
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-stats">
                <span class="product-price">$${product.price.toFixed(2)}</span>
                <span class="product-earnings">ربح $${(product.price * product.commission / 100).toFixed(2)}</span>
            </div>
            <div class="product-actions">
                <a href="${product.affiliateLink}" target="_blank" class="btn btn-primary" onclick="trackClick(${product.id})">
                    <i class="fas fa-shopping-cart"></i>
                    شراء الآن
                </a>
                <button class="btn btn-outline" onclick="copyLink('${product.affiliateLink}')">
                    <i class="fas fa-copy"></i>
                    نسخ
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// ===== Obtenir le nom de la plateforme =====
function getPlatformName(platform) {
    const platformNames = {
        amazon: 'أمازون',
        aliexpress: 'علي إكسبريس',
        temu: 'تيمو'
    };
    return platformNames[platform] || platform;
}

// ===== Obtenir le nom de la catégorie =====
function getCategoryName(category) {
    const categoryNames = {
        electronics: 'إلكترونيات',
        fashion: 'أزياء',
        home: 'منزل',
        beauty: 'جمال',
        digital: 'منتجات رقمية'
    };
    return categoryNames[category] || category;
}

// ===== Suivre les clics =====
function trackClick(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Simuler un suivi de clic
        console.log(`Clic suivi pour le produit: ${product.title}`);
        
        // Mettre à jour le compteur de clics
        const clicksElement = document.getElementById('totalClicks');
        const currentClicks = parseInt(clicksElement.textContent.replace(',', ''));
        clicksElement.textContent = (currentClicks + 1).toLocaleString();
        
        // Simuler une conversion (20% de chance)
        if (Math.random() > 0.8) {
            simulateSale(productId);
        }
    }
}

// ===== Simuler une vente =====
function simulateSale(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const commission = product.price * product.commission / 100;
        
        // Mettre à jour les gains
        currentEarnings.today += commission;
        currentEarnings.week += commission;
        currentEarnings.month += commission;
        currentEarnings.total += commission;
        
        // Mettre à jour l'affichage
        document.getElementById('todayEarnings').textContent = '$' + currentEarnings.today.toFixed(2);
        document.getElementById('weekEarnings').textContent = '$' + currentEarnings.week.toFixed(2);
        document.getElementById('monthEarnings').textContent = '$' + currentEarnings.month.toFixed(2);
        document.getElementById('totalEarnings').textContent = '$' + currentEarnings.total.toFixed(2);
        
        // Mettre à jour les statistiques
        const salesElement = document.getElementById('totalSales');
        const currentSales = parseInt(salesElement.textContent);
        salesElement.textContent = currentSales + 1;
        
        // Ajouter une transaction
        addTransaction(`بيع ${product.title}`, commission, 'completed', product.platform);
        
        // Afficher une notification
        showNotification('مبيعات جديدة!', `ربحت $${commission.toFixed(2)} من ${product.title}`, 'success');
    }
}

// ===== Charger les transactions =====
function loadTransactions() {
    // Simuler le chargement des transactions depuis le serveur
    const mockTransactions = [
        { description: 'بيع دورة التسويق الرقمي', amount: 149.25, platform: 'amazon', status: 'completed' },
        { description: 'بيع كاميرا Canon EOS R5', amount: 214.45, platform: 'amazon', status: 'completed' },
        { description: 'سحب أرباح', amount: -500, platform: 'withdrawal', status: 'completed' },
        { description: 'بيع ساعة Xiaomi Mi Band', amount: 9.00, platform: 'aliexpress', status: 'completed' },
        { description: 'بيع حقيبة ظهر', amount: 5.00, platform: 'temu', status: 'pending' }
    ];
    
    transactions = mockTransactions;
    displayTransactions();
}

// ===== Afficher les transactions =====
function displayTransactions() {
    const tableBody = document.querySelector
