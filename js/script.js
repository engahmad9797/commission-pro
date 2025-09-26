// ===== Variables Globales =====
let earningsChart;
let todayChart, weekChart, monthChart, totalChart;
let platformChart;
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
let currentSort = 'commission';
let currentTransactionFilter = 'all';

// API URLs for different platforms (placeholder URLs)
const API_ENDPOINTS = {
    amazon: 'https://api.example.com/amazon/products',
    aliexpress: 'https://api.example.com/aliexpress/products',
    temu: 'https://api.example.com/temu/products',
    ebay: 'https://api.example.com/ebay/products'
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
    initializeCharts();
    startLiveUpdates();
    loadProducts();
    loadTransactions();
    
    // Ajouter les écouteurs d'événements
    setupEventListeners();
    
    // Simuler les gains initiaux
    simulateInitialEarnings();
    
    // Initialiser les graphiques individuels
    initializeMiniCharts();
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
    animateValue('totalReferrals', 0, 342, 2000);
    
    // Animer le taux de conversion
    animateValue('conversionRate', 0, 7.1, 2000, true);
    
    // Animer les gains de référence
    animateValue('referralEarnings', 0, 1247.50, 2000, false, '$');
}

// ===== Animer les nombres =====
function animateValue(id, start, end, duration, isPercentage = false, prefix = '') {
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
        } else if (prefix === '$') {
            obj.innerHTML = prefix + value.toFixed(2);
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

// ===== Initialiser les graphiques =====
function initializeCharts() {
    // Graphique principal des gains
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
    
    // Graphique des plateformes
    const platformCtx = document.getElementById('platformChart').getContext('2d');
    
    platformChart = new Chart(platformCtx, {
        type: 'doughnut',
        data: {
            labels: ['أمازون', 'علي إكسبريس', 'تيمو', 'إيباي'],
            datasets: [{
                data: [1247, 856, 445, 299],
                backgroundColor: [
                    '#FF9900',
                    '#FF474C',
                    '#00BFFF',
                    '#E53238'
                ],
                borderWidth: 0
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
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': $' + context.parsed;
                        }
                    }
                }
            }
        }
    });
}

// ===== Initialiser les mini-graphiques =====
function initializeMiniCharts() {
    // Graphique du jour
    const todayCtx = document.getElementById('todayChart').getContext('2d');
    todayChart = new Chart(todayCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                data: [5, 12, 8, 25, 20, 35],
                borderColor: '#FF6B35',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0
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
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });
    
    // Graphique de la semaine
    const weekCtx = document.getElementById('weekChart').getContext('2d');
    weekChart = new Chart(weekCtx, {
        type: 'line',
        data: {
            labels: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
            datasets: [{
                data: [30, 45, 35, 60, 50, 70, 65],
                borderColor: '#FF6B35',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0
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
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });
    
    // Graphique du mois
    const monthCtx = document.getElementById('monthChart').getContext('2d');
    monthChart = new Chart(monthCtx, {
        type: 'line',
        data: {
            labels: ['1', '5', '10', '15', '20', '25', '30'],
            datasets: [{
                data: [100, 200, 150, 300, 250, 400, 350],
                borderColor: '#FF6B35',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0
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
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });
    
    // Graphique total
    const totalCtx = document.getElementById('totalChart').getContext('2d');
    totalChart = new Chart(totalCtx, {
        type: 'line',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                data: [500, 800, 1200, 1500, 2000, 2500],
                borderColor: '#FF6B35',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0
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
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
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
            affiliateLink: 'https://YOUR_ID.clickbank.product',
            popularity: 95
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
            affiliateLink: 'https://www.amazon.com/dp/B0863FBGRM?tag=YOUR_ID-20',
            popularity: 88
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
            affiliateLink: 'https://www.aliexpress.com/item/1005001234567890.html?aff_platform=link',
            popularity: 92
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
            affiliateLink: 'https://www.temu.com/g/backpack.html?refer_id=YOUR_ID',
            popularity: 76
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
            affiliateLink: 'https://www.amazon.com/dp/B0863XRM2J?tag=YOUR_ID-20',
            popularity: 94
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
            affiliateLink: 'https://www.aliexpress.com/item/1005001234567891.html?aff_platform=link',
            popularity: 82
        },
        {
            id: 7,
            title: 'iPhone 13 Pro Max',
            category: 'electronics',
            platform: 'ebay',
            price: 1099,
            commission: 4,
            image: 'https://example.com/iphone13.jpg',
            description: 'أحدث هاتف من آيفون مع كاميرا احترافية وأداء فائق.',
            affiliateLink: 'https://www.ebay.com/itm/123456789?aff_platform=link',
            popularity: 98
        },
        {
            id: 8,
            title: 'حذاء رياضي Nike Air Max',
            category: 'sports',
            platform: 'amazon',
            price: 129.99,
            commission: 7,
            image: 'https://example.com/nike-shoes.jpg',
            description: 'حذاء رياضي مريح مع تقنية Air Max للتهوية.',
            affiliateLink: 'https://www.amazon.com/dp/B08XYZ123?tag=YOUR_ID-20',
            popularity: 85
        }
    ];
    
    products = mockProducts;
    displayProducts(products);
}

// ===== Afficher les produits =====
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    // Trier les produits selon le critère sélectionné
    let sortedProducts = [...productsToShow];
    
    switch(currentSort) {
        case 'commission':
            sortedProducts.sort((a, b) => b.commission - a.commission);
            break;
        case 'price':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            sortedProducts.sort((a, b) => b.popularity - a.popularity);
            break;
        case 'new':
            sortedProducts.sort((a, b) => b.id - a.id);
            break;
    }
    
    sortedProducts.forEach(product => {
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
        temu: 'تيمو',
        ebay: 'إيباي'
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
        digital: 'منتجات رقمية',
        sports: 'رياضة'
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
        
        // Mettre à jour les mini-graphiques
        updateMiniCharts();
    }
}

// ===== Mettre à jour les mini-graphiques =====
function updateMiniCharts() {
    // Mettre à jour le graphique du jour
    if (todayChart) {
        const newData = [...todayChart.data.datasets[0].data];
        newData.push(Math.random() * 10 + 30);
        if (newData.length > 6) newData.shift();
        todayChart.data.datasets[0].data = newData;
        todayChart.update();
    }
    
    // Mettre à jour le graphique de la semaine
    if (weekChart) {
        const newData = [...weekChart.data.datasets[0].data];
        newData.push(Math.random() * 20 + 50);
        if (newData.length > 7) newData.shift();
        weekChart.data.datasets[0].data = newData;
        weekChart.update();
    }
    
    // Mettre à jour le graphique du mois
    if (monthChart) {
        const newData = [...monthChart.data.datasets[0].data];
        newData.push(Math.random() * 50 + 300);
        if (newData.length > 7) newData.shift();
        monthChart.data.datasets[0].data = newData;
        monthChart.update();
    }
    
    // Mettre à jour le graphique total
    if (totalChart) {
        const newData = [...totalChart.data.datasets[0].data];
        newData.push(Math.random() * 500 + 2000);
        if (newData.length > 6) newData.shift();
        totalChart.data.datasets[0].data = newData;
        totalChart.update();
    }
}

// ===== Charger les transactions =====
function loadTransactions() {
    // Simuler le chargement des transactions depuis le serveur
    const mockTransactions = [
        { description: 'بيع دورة التسويق الرقمي', amount: 149.25, platform: 'amazon', status: 'completed', type: 'sales' },
        { description: 'بيع كاميرا Canon EOS R5', amount: 214.45, platform: 'amazon', status: 'completed', type: 'sales' },
        { description: 'سحب أرباح', amount: -500, platform: 'withdrawal', status: 'completed', type: 'withdrawals' },
        { description: 'بيع ساعة Xiaomi Mi Band', amount: 9.00, platform: 'aliexpress', status: 'completed', type: 'sales' },
        { description: 'عمولة من إحالة', amount: 25.50, platform: 'referral', status: 'completed', type: 'referrals' },
        { description: 'بيع حقيبة ظهر', amount: 5.00, platform: 'temu', status: 'pending', type: 'sales' }
    ];
    
    transactions = mockTransactions;
    displayTransactions();
}

// ===== Afficher les transactions =====
function displayTransactions() {
    const tableBody = document.querySelector('#transactionsTable tbody');
    tableBody.innerHTML = '';
    
    let filteredTransactions = transactions;
    
    if (currentTransactionFilter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === currentTransactionFilter);
    }
    
    filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + 
                      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(now.getDate()).padStart(2, '0');
        
        row.innerHTML = `
            <td>${dateStr}</td>
            <td>${transaction.description}</td>
            <td>${getPlatformName(transaction.platform)}</td>
            <td class="${transaction.amount > 0 ? 'product-price' : ''}">$${Math.abs(transaction.amount).toFixed(2)}</td>
            <td><span class="transaction-status ${transaction.status}">${getStatusText(transaction.status)}</span></td>
            <td>
                <button class="btn-icon" onclick="showTransactionDetails('${transaction.description}', ${transaction.amount}, '${transaction.status}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ===== Ajouter une transaction =====
function addTransaction(description, amount, status, platform = 'unknown', type = 'sales') {
    const now = new Date();
    const dateStr = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(now.getDate()).padStart(2, '0');
    
    transactions.unshift({
        date: dateStr,
        description,
        amount,
        platform,
        status,
        type
    });
    
    // Limiter le nombre de transactions affichées
    if (transactions.length > 10) {
        transactions = transactions.slice(0, 10);
    }
    
    displayTransactions();
}

// ===== Démarrer les mises à jour en direct =====
function startLiveUpdates() {
    // Mettre à jour les gains toutes les 5 secondes
    setInterval(() => {
        const newEarning = Math.random() * 10 + 5;
        currentEarnings.today += newEarning;
        currentEarnings.week += newEarning;
        currentEarnings.month += newEarning;
        currentEarnings.total += newEarning;
        
        // Mettre à jour l'affichage
        document.getElementById('todayEarnings').textContent = '$' + currentEarnings.today.toFixed(2);
        document.getElementById('weekEarnings').textContent = '$' + currentEarnings.week.toFixed(2);
        document.getElementById('monthEarnings').textContent = '$' + currentEarnings.month.toFixed(2);
        document.getElementById('totalEarnings').textContent = '$' + currentEarnings.total.toFixed(2);
        
        // Afficher une notification pour les gains importants
        if (newEarning > 8) {
            showNotification('مبيعات جديدة!', `ربحت $${newEarning.toFixed(2)} من عملية بيع جديدة`, 'success');
        }
    }, 5000);
    
    // Simuler des transactions aléatoires
    setInterval(() => {
        if (Math.random() > 0.7) {
            addRandomTransaction();
        }
    }, 15000);
    
    // Simuler des gains de référence
    setInterval(() => {
        if (Math.random() > 0.8) {
            simulateReferralEarning();
        }
    }, 30000);
}

// ===== Simuler un gain de référence =====
function simulateReferralEarning() {
    const amount = Math.random() * 20 + 10;
    
    // Mettre à jour les gains
    currentEarnings.today += amount;
    currentEarnings.week += amount;
    currentEarnings.month += amount;
    currentEarnings.total += amount;
    
    // Mettre à jour l'affichage
    document.getElementById('todayEarnings').textContent = '$' + currentEarnings.today.toFixed(2);
    document.getElementById('weekEarnings').textContent = '$' + currentEarnings.week.toFixed(2);
    document.getElementById('monthEarnings').textContent = '$' + currentEarnings.month.toFixed(2);
    document.getElementById('totalEarnings').textContent = '$' + currentEarnings.total.toFixed(2);
    
    // Mettre à jour les gains de référence
    const referralEarningsElement = document.getElementById('referralEarnings');
    const currentReferralEarnings = parseFloat(referralEarningsElement.textContent.replace('$', ''));
    referralEarningsElement.textContent = '$' + (currentReferralEarnings + amount).toFixed(2);
    
    // Ajouter une transaction
    addTransaction('عمولة من إحالة', amount, 'completed', 'referral', 'referrals');
    
    // Afficher une notification
    showNotification('عمولة إحالة!', `ربحت $${amount.toFixed(2)} من إحالتك`, 'success');
}

// ===== Ajouter une transaction aléatoire =====
function addRandomTransaction() {
    const productTypes = [
        { name: 'إلكترونيات', min: 10, max: 50, platform: 'amazon' },
        { name: 'أزياء', min: 5, max: 30, platform: 'aliexpress' },
        { name: 'منتجات منزلية', min: 3, max: 20, platform: 'temu' },
        { name: 'منتجات مستعملة', min: 2, max: 15, platform: 'ebay' }
    ];
    
    const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
    const amount = Math.random() * (productType.max - productType.min) + productType.min;
    
    addTransaction(`بيع ${productType.name}`, amount, 'completed', productType.platform, 'sales');
    
    // Mettre à jour les gains
    currentEarnings.today += amount;
    currentEarnings.week += amount;
    currentEarnings.month += amount;
    currentEarnings.total += amount;
    
    // Mettre à jour l'affichage
    document.getElementById('todayEarnings').textContent = '$' + currentEarnings.today.toFixed(2);
    document.getElementById('weekEarnings').textContent = '$' + currentEarnings.week.toFixed(2);
    document.getElementById('monthEarnings').textContent = '$' + currentEarnings.month.toFixed(2);
    document.getElementById('totalEarnings').textContent = '$' + currentEarnings.total.toFixed(2);
    
    // Afficher une notification
    showNotification('مبيعات جديدة!', `ربحت $${amount.toFixed(2)} من ${productType.name}`, 'success');
}

// ===== Traiter le retrait =====
function processWithdrawal(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('withdrawalAmount').value);
    const method = document.getElementById('withdrawalMethod').value;
    
    // Valider le montant
    if (amount > currentEarnings.total) {
        showNotification('خطأ', 'المبلغ المطلوب أكبر من رصيدك المتاح', 'error');
        return;
    }
    
    // Désactiver le bouton et afficher le chargement
    const button = event.target.querySelector('.withdrawal-button');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
    
    // Simuler le processus de retrait
    setTimeout(() => {
        // Mettre à jour le solde
        currentEarnings.total -= amount;
        document.getElementById('availableBalance').textContent = '$' + currentEarnings.total.toFixed(2);
        
        // Ajouter une transaction
        addTransaction('سحب أرباح', -amount, 'completed', 'withdrawal', 'withdrawals');
        
        // Réinitialiser le formulaire
        event.target.reset();
        button.disabled = false;
        button.innerHTML = originalText;
        
        // Afficher une notification de succès
        showNotification('تم بنجاح!', `تم طلب سحب $${amount.toFixed(2)} إلى ${method}`, 'success');
    }, 2000);
}

// ===== Copier le lien =====
function copyLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        showNotification('تم النسخ', 'تم نسخ الرابط بنجاح', 'success');
    }).catch(() => {
        showNotification('خطأ', 'فشل نسخ الرابط', 'error');
    });
}

// ===== Copier le lien de référence =====
function copyReferralLink() {
    const referralLink = document.getElementById('referralLink').value;
    copyLink(referralLink);
}

// ===== Copier le lien d'invitation =====
function copyInviteLink() {
    const inviteLink = document.getElementById('inviteLink').value;
    copyLink(inviteLink);
}

// ===== Afficher la notification =====
function showNotification(title, message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${iconMap[type]} notification-icon"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <i class="fas fa-times notification-close" onclick="this.parentElement.remove()"></i>
    `;
    
    container.appendChild(notification);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ===== Obtenir le texte du statut =====
function getStatusText(status) {
    const statusMap = {
        completed: 'مكتمل',
        pending: 'قيد المعالجة',
        failed: 'فشل'
    };
    return statusMap[status] || status;
}

// ===== Configurer les écouteurs d'événements =====
function setupEventListeners() {
    // Sélecteurs de plateforme et de catégorie
    document.getElementById('platformFilter').addEventListener('change', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('sortFilter').addEventListener('change', filterProducts);
    
    // Boutons de contrôle du graphique
    document.querySelectorAll('.chart-control').forEach(button => {
        button.addEventListener('click', function() {
            updateChart(this.dataset.period);
        });
    });
    
    // Cartes de plateforme
    document.querySelectorAll('.platform-card').forEach(card => {
        card.addEventListener('click', function() {
            const platform = this.dataset.platform;
            document.getElementById('platformFilter').value = platform;
            filterProducts();
            
            // Faire défiler jusqu'à la section des produits
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Bouton "Charger plus"
    document.getElementById('loadMoreBtn').addEventListener('click', loadMoreProducts);
    
    // Filtres de transactions
    document.querySelectorAll('.btn-filter').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentTransactionFilter = this.dataset.filter;
            displayTransactions();
        });
    });
    
    // Validation du formulaire
    const withdrawalForm = document.querySelector('.withdrawal-form');
    const amountInput = document.getElementById('withdrawalAmount');
    const methodSelect = document.getElementById('withdrawalMethod');
    
    // Validation en temps réel du solde
    amountInput.addEventListener('input', function() {
        const amount = parseFloat(this.value) || 0;
        const balance = parseFloat(document.getElementById('availableBalance').textContent.replace('$', ''));
        
        if (amount > balance) {
            this.setCustomValidity('المبلغ المطلوب أكبر من رصيدك المتاح');
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Afficher les détails bancaires si nécessaire
    methodSelect.addEventListener('change', function() {
        const bankDetails = document.getElementById('bankDetails');
        if (this.value === 'bank') {
            bankDetails.style.display = 'block';
        } else {
            bankDetails.style.display = 'none';
        }
    });
    
    // Défilement fluide pour la navigation
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Filtrer les produits =====
function filterProducts() {
    const platformFilter = document.getElementById('platformFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    currentSort = document.getElementById('sortFilter').value;
    
    let filteredProducts = products;
    
    if (platformFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.platform === platformFilter);
    }
    
    if (categoryFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }
    
    displayProducts(filteredProducts);
}

// ===== Charger plus de produits =====
function loadMoreProducts() {
    // Simuler le chargement de produits supplémentaires
    const newProducts = [
        {
            id: products.length + 1,
            title: 'سماعات AirPods Pro',
            category: 'electronics',
            platform: 'amazon',
            price: 249,
            commission: 7,
            image: 'https://m.media-amazon.com/images/I/61SUj2aKl0L._AC_SL1500_.jpg',
            description: 'سماعات لاسلكية مع إلغاء الضوضاء النشط.',
            affiliateLink: 'https://www.amazon.com/dp/B07ZPC9QD4?tag=YOUR_ID-20',
            popularity: 91
        },
        {
            id: products.length + 2,
            title: 'حقيبة يد نسائية',
            category: 'fashion',
            platform: 'aliexpress',
            price: 34.99,
            commission: 30,
            image: 'https://ae01.alicdn.com/kf/Sd4e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8/Handbag.jpg',
            description: 'حقيبة يد أنيقة ومتينة.',
            affiliateLink: 'https://www.aliexpress.com/item/1005001234567892.html?aff_platform=link',
            popularity: 78
        },
        {
            id: products.length + 3,
            title: 'لابتوب Dell XPS 13',
            category: 'electronics',
            platform: 'ebay',
            price: 1299,
            commission: 3.5,
            image: 'https://example.com/dell-xps.jpg',
            description: 'لابتوب فائق الجودة مع شاشة 13 بوصة.',
            affiliateLink: 'https://www.ebay.com/itm/987654321?aff_platform=link',
            popularity: 89
        },
        {
            id: products.length + 4,
            title: 'طقم مستحضرات تجميل',
            category: 'beauty',
            platform: 'temu',
            price: 19.99,
            commission: 25,
            image: 'https://example.com/beauty-set.jpg',
            description: 'طقم شامل للعناية بالبشرة.',
            affiliateLink: 'https://www.temu.com/g/beauty-set.html?refer_id=YOUR_ID',
            popularity: 73
        }
    ];
    
    products.push(...newProducts);
    filterProducts();
    
    showNotification('تم تحميل المزيد', 'تم إضافة 4 منتجات جديدة', 'info');
}

// ===== Mettre à jour le graphique =====
function updateChart(period) {
    // Mettre à jour le bouton actif
    document.querySelectorAll('.chart-control').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Mettre à jour les données du graphique
    const labels = {
        'day': ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
        'week': ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        'month': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        'year': ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    };
    
    const data = {
        'day': [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
        'week': [150, 180, 165, 200, 190, 220, 210, 240, 230, 260, 250, 280],
        'month': [800, 950, 1100, 1250, 1400, 1550, 1700, 1850, 2000, 2150, 2300, 2450],
        'year': [5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000]
    };
    
    earningsChart.data.labels = labels[period] || labels.day;
    earningsChart.data.datasets[0].data = data[period] || data.day;
    earningsChart.update();
}

// ===== Simuler les gains initiaux =====
function simulateInitialEarnings() {
    // Simuler des gains aléatoires au démarrage
    setTimeout(() => {
        simulateSale(1);
    }, 3000);
    
    setTimeout(() => {
        simulateSale(2);
    }, 5000);
    
    setTimeout(() => {
        simulateSale(3);
    }, 7000);
    
    setTimeout(() => {
        simulateReferralEarning();
    }, 9000);
}

// ===== Fonctions des modales =====
function showShareModal() {
    document.getElementById('shareModal').classList.add('active');
}

function showReferralModal() {
    document.getElementById('referralModal').classList.add('active');
}

function showWithdrawalModal() {
    document.getElementById('withdrawalModal').classList.add('active');
}

function showHelpModal() {
    document.getElementById('helpModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ===== Fonctions de partage =====
function shareOnSocial(platform) {
    const referralLink = document.getElementById('referralLink').value;
    const text = 'انضم إلى منصة كوميشن برو وابدأ رحلتك في التسويق بالعمولة!';
    
    let url = '';
    
    switch(platform) {
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(text)}`;
            break;
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
            break;
        case 'whatsapp':
            url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralLink)}`;
            break;
        case 'telegram':
            url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank');
        showNotification('تم المشاركة', `تمت المشاركة على ${getPlatformName(platform)}`, 'success');
    }
}

function shareViaEmail() {
    const referralLink = document.getElementById('referralLink').value;
    const subject = 'دعوة للانضمام إلى منصة كوميشن برو';
    const body = `مرحباً،\n\nأود أن أدعوك للانضمام إلى منصة كوميشن برو للبدء في رحلتك في التسويق بالعمولة.\n\nرابط التسجيل: ${referralLink}\n\nمع أطيب التحيات،\nأحمد رنده`;
    
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    
    showNotification('تم فتح البريد', 'تم فتح برنامج البريد الإلكتروني', 'success');
}

// ===== Fonctions de génération de liens =====
function generateProductLink() {
    showNotification('ميزة قادمة', 'هذه الميزة ستتوفر قريباً', 'info');
    closeModal('shareModal');
}

function generateStoreLink() {
    showNotification('ميزة قادمة', 'هذه الميزة ستتوفر قريباً', 'info');
    closeModal('shareModal');
}

function generateCategoryLink() {
    showNotification('ميزة قادمة', 'هذه الميزة ستتوفر قريباً', 'info');
    closeModal('shareModal');
}

// ===== Fonctions de retrait rapide =====
function setWithdrawalAmount(amount) {
    document.getElementById('withdrawalAmount').value = amount;
}

function processQuickWithdrawal() {
    const amount = parseFloat(document.getElementById('withdrawalAmount').value) || 100;
    const method = document.querySelector('input[name="quickMethod"]:checked').value;
    
    // Valider le montant
    if (amount > currentEarnings.total) {
        showNotification('خطأ', 'المبلغ المطلوب أكبر من رصيدك المتاح', 'error');
        return;
    }
    
    // Simuler le processus de retrait
    setTimeout(() => {
        // Mettre à jour le solde
        currentEarnings.total -= amount;
        document.getElementById('availableBalance').textContent = '$' + currentEarnings.total.toFixed(2);
        
        // Ajouter une transaction
        addTransaction('سحب أرباح', -amount, 'completed', 'withdrawal', 'withdrawals');
        
        // Afficher une notification de succès
        showNotification('تم بنجاح!', `تم طلب سحب $${amount.toFixed(2)} إلى ${method}`, 'success');
        
        closeModal('withdrawalModal');
    }, 1000);
}

// ===== Fonctions d'actualisation =====
function refreshEarnings() {
    // Simuler l'actualisation des gains
    const button = document.querySelector('.btn-refresh');
    button.querySelector('i').classList.add('rotate');
    
    setTimeout(() => {
        button.querySelector('i').classList.remove('rotate');
        showNotification('تم التحديث', 'تم تحديث بيانات الأرباح', 'success');
    }, 1000);
}

// ===== Fonctions FAQ =====
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    faqItem.classList.toggle('active');
}

// ===== Fonctions de détails des transactions =====
function showTransactionDetails(description, amount, status) {
    showNotification('تفاصيل المعاملة', `${description}: $${Math.abs(amount).toFixed(2)} - ${getStatusText(status)}`, 'info');
}
