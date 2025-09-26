// Analytics Module
class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.data = {
            earnings: [],
            clicks: [],
            conversions: [],
            platforms: {},
            products: []
        };
        this.filters = {
            period: 'month',
            platform: 'all',
            category: 'all'
        };
    }

    async initialize() {
        await this.loadAnalyticsData();
        this.initializeCharts();
        this.setupEventListeners();
    }

    async loadAnalyticsData() {
        try {
            // Load earnings data
            const earningsData = await dbManager.getEarningsData(currentUser.uid, this.filters.period);
            this.data.earnings = earningsData.transactions;

            // Load platform data
            const platformData = await dbManager.getPlatformEarnings(currentUser.uid);
            this.data.platforms = platformData;

            // Load top products
            const topProducts = await this.getTopProducts();
            this.data.products = topProducts;

            this.updateCharts();
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    async getTopProducts(limit = 10) {
        try {
            const snapshot = await db.collection('transactions')
                .where('userId', '==', currentUser.uid)
                .where('type', '==', 'sale')
                .where('status', '==', 'completed')
                .orderBy('amount', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting top products:', error);
            return [];
        }
    }

    initializeCharts() {
        // Main earnings chart
        const earningsCtx = document.getElementById('earningsChart').getContext('2d');
        this.charts.earnings = new Chart(earningsCtx, {
            type: 'line',
            data: {
                labels: this.generateDateLabels(),
                datasets: [{
                    label: 'الأرباح ($)',
                    data: this.data.earnings.map(t => t.amount),
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
        });

        // Platform distribution chart
        const platformCtx = document.getElementById('platformDistributionChart').getContext('2d');
        this.charts.platform = new Chart(platformCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(this.data.platforms),
                datasets: [{
                    data: Object.values(this.data.platforms),
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
        });

        // Product performance chart
        const productCtx = document.getElementById('productPerformanceChart').getContext('2d');
        this.charts.products = new Chart(productCtx, {
            type: 'bar',
            data: {
                labels: this.data.products.map(p => p.description || 'منتج'),
                datasets: [{
                    label: 'المبيعات',
                    data: this.data.products.map(p => p.amount),
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
        });
    }

    generateDateLabels() {
        const labels = [];
        const now = new Date();
        const days = this.filters.period === 'week' ? 7 : 30;
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }));
        }
        
        return labels;
    }

    updateCharts() {
        if (this.charts.earnings) {
            this.charts.earnings.data.labels = this.generateDateLabels();
            this.charts.earnings.data.datasets[0].data = this.data.earnings.map(t => t.amount);
            this.charts.earnings.update();
        }

        if (this.charts.platform) {
            this.charts.platform.data.labels = Object.keys(this.data.platforms);
            this.charts.platform.data.datasets[0].data = Object.values(this.data.platforms);
            this.charts.platform.update();
        }

        if (this.charts.products) {
            this.charts.products.data.labels = this.data.products.map(p => p.description || 'منتج');
            this.charts.products.data.datasets[0].data = this.data.products.map(p => p.amount);
            this.charts.products.update();
        }
    }

    setupEventListeners() {
        // Date range picker
        document.getElementById('startDate')?.addEventListener('change', () => this.updateFilters());
        document.getElementById('endDate')?.addEventListener('change', () => this.updateFilters());

        // Chart type selector
        document.querySelectorAll('.chart-type').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-type').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.changeChartType(e.target.dataset.type);
            });
        });

        // Export button
        document.querySelector('button[onclick="exportAnalytics()"]')?.addEventListener('click', () => {
            this.exportAnalytics();
        });
    }

    async updateFilters() {
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        
        if (startDate && endDate) {
            this.filters.startDate = new Date(startDate);
            this.filters.endDate = new Date(endDate);
            await this.loadAnalyticsData();
        }
    }

    changeChartType(type) {
        if (this.charts.earnings) {
            this.charts.earnings.config.type = type;
            this.charts.earnings.update();
        }
    }

    async exportAnalytics() {
        try {
            const data = {
                earnings: this.data.earnings,
                platforms: this.data.platforms,
                products: this.data.products,
                period: this.filters.period,
                exportedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            showNotification('تم التصدير', 'تم تصدير التحليلات بنجاح', 'success');
        } catch (error) {
            console.error('Error exporting analytics:', error);
            showNotification('خطأ', 'فشل تصدير التحليلات', 'error');
        }
    }

    async refreshCharts() {
        const button = event.target.closest('button');
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;

        try {
            await this.loadAnalyticsData();
            showNotification('تم التحديث', 'تم تحديث التحليلات بنجاح', 'success');
        } catch (error) {
            console.error('Error refreshing analytics:', error);
            showNotification('خطأ', 'فشل تحديث التحليلات', 'error');
        } finally {
            button.innerHTML = originalHTML;
            button.disabled = false;
        }
    }

    fullscreenChart(chartId) {
        const chart = this.charts[chartId];
        if (chart) {
            const canvas = chart.canvas;
            if (canvas.requestFullscreen) {
                canvas.requestFullscreen();
            }
        }
    }
}

// Initialize analytics manager
const analyticsManager = new AnalyticsManager();
