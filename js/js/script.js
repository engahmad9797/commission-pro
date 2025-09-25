// ===== Variables Globales =====
let earningsChart;
let currentEarnings = {
    today: 45.67,
    week: 312.45,
    month: 1247.89,
    total: 2847.50
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
    loadTransactions();
    
    // Ajouter les écouteurs d'événements
    setupEventListeners();
});

// ===== Initialiser l'affichage des gains =====
function initializeEarningsDisplay() {
    animateValue('todayEarnings', 0, currentEarnings.today, 2000);
    animateValue('weekEarnings', 0, currentEarnings.week, 2000);
    animateValue('monthEarnings', 0, currentEarnings.month, 2000);
    animateValue('totalEarnings', 0, currentEarnings.total, 2000);
}

// ===== Animer les nombres =====
function animateValue(id, start, end, duration) {
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
        const value = Math.round(end - (remaining * range));
        obj.innerHTML = '$' + value.toFixed(2);
        if (value == end) {
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
        addTransaction('سحب أرباح', -$amount, 'completed');
        
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

// ===== Ajouter une transaction =====
function addTransaction(description, amount, status) {
    const table = document.getElementById('transactionsTable');
    const row = table.insertRow(0);
    
    const now = new Date();
    const dateStr = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(now.getDate()).padStart(2, '0');
    
    row.innerHTML = `
        <td>${dateStr}</td>
        <td>${description}</td>
        <td class="${amount > 0 ? 'product-price' : ''}">$${Math.abs(amount).toFixed(2)}</td>
        <td><span class="transaction-status ${status}">${getStatusText(status)}</span></td>
    `;
    
    // Ajouter l'animation de fondu
    row.classList.add('fade-in');
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

// ===== Ajouter une transaction aléatoire =====
function addRandomTransaction() {
    const products = [
        { name: 'دورة التسويق الرقمي', min: 100, max: 200 },
        { name: 'كاميرا Canon EOS R5', min: 200, max: 300 },
        { name: 'برنامج إدارة المشاريع', min: 50, max: 100 },
        { name: 'Apple Watch Ultra', min: 30, max: 50 },
        { name: 'كورس البرمجة', min: 150, max: 250 }
    ];
    
    const product = products[Math.floor(Math.random() * products.length)];
    const amount = Math.random() * (product.max - product.min) + product.min;
    
    addTransaction(`بيع ${product.name}`, amount, 'completed');
    
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
    showNotification('مبيعات جديدة!', `ربحت $${amount.toFixed(2)} من ${product.name}`, 'success');
}

// ===== Charger les transactions =====
function loadTransactions() {
    // Simuler le chargement des transactions depuis le serveur
    const transactions = [
        { description: 'بيع دورة التسويق الرقمي', amount: 149.25, status: 'completed' },
        { description: 'بيع كاميرا Canon EOS R5', amount: 214.45, status: 'completed' },
        { description: 'سحب أرباح', amount: -500, status: 'completed' }
    ];
    
    transactions.forEach(transaction => {
        addTransaction(transaction.description, transaction.amount, transaction.status);
    });
}

// ===== Configurer les écouteurs d'événements =====
function setupEventListeners() {
    // Boutons de contrôle du graphique
    document.querySelectorAll('.chart-control').forEach(button => {
        button.addEventListener('click', function() {
            updateChart(this.dataset.period || this.textContent);
        });
    });
    
    // Validation du formulaire
    const withdrawalForm = document.querySelector('.withdrawal-form');
    const amountInput = document.getElementById('withdrawalAmount');
    const balanceDisplay = document.getElementById('availableBalance');
    
    // Validation en temps réel du solde
    amountInput.addEventListener('input', function() {
        const amount = parseFloat(this.value) || 0;
        const balance = parseFloat(balanceDisplay.textContent.replace('$', ''));
        
        if (amount > balance) {
            this.setCustomValidity('المبلغ المطلوب أكبر من رصيدك المتاح');
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Boutons de copie de lien
    document.querySelectorAll('.btn-outline').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const buyButton = productCard.querySelector('.btn-primary');
            const link = buyButton.getAttribute('href');
            copyLink(link);
        });
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

// ===== Simuler les gains d'affiliation =====
function simulateAffiliateEarnings() {
    const affiliatePrograms = [
        { name: 'Amazon', commission: 0.055, baseAmount: 1000 },
        { name: 'ClickBank', commission: 0.75, baseAmount: 200 },
        { name: 'ShareASale', commission: 0.40, baseAmount: 150 }
    ];
    
    affiliatePrograms.forEach(program => {
        const randomSale = Math.random() > 0.8; // 20% de chance de vente
        
        if (randomSale) {
            const amount = Math.random() * program.baseAmount + program.baseAmount * 0.5;
            const commission = amount * program.commission;
            
            addTransaction(`بيع من ${program.name}`, commission, 'completed');
            
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
            
            // Afficher une notification
            showNotification('عمولة جديدة!', `ربحت $${commission.toFixed(2)} عمولة من ${program.name}`, 'success');
        }
    });
}

// ===== Démarrer la simulation des gains d'affiliation =====
setInterval(simulateAffiliateEarnings, 30000); // Toutes les 30 secondes
