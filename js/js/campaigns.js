// Campaigns Management Module
class CampaignsManager {
    constructor() {
        this.campaigns = [];
        this.templates = [];
        this.currentCampaign = null;
    }

    async initialize() {
        await this.loadCampaigns();
        await this.loadTemplates();
        this.setupEventListeners();
    }

    async loadCampaigns() {
        try {
            const snapshot = await db.collection('campaigns')
                .where('userId', '==', currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            this.campaigns = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.displayCampaigns();
        } catch (error) {
            console.error('Error loading campaigns:', error);
        }
    }

    async loadTemplates() {
        try {
            const snapshot = await db.collection('campaignTemplates').get();
            this.templates = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    displayCampaigns() {
        const campaignsGrid = document.getElementById('campaignsGrid');
        if (!campaignsGrid) return;

        campaignsGrid.innerHTML = '';

        if (this.campaigns.length === 0) {
            campaignsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullhorn"></i>
                    <h3>لا توجد حملات بعد</h3>
                    <p>ابدأ بإنشاء حملتك التسويقية الأولى</p>
                    <button class="btn btn-primary" onclick="createNewCampaign()">
                        <i class="fas fa-plus"></i>
                        إنشاء حملة
                    </button>
                </div>
            `;
            return;
        }

        this.campaigns.forEach(campaign => {
            const campaignCard = this.createCampaignCard(campaign);
            campaignsGrid.appendChild(campaignCard);
        });
    }

    createCampaignCard(campaign) {
        const card = document.createElement('div');
        card.className = 'campaign-card';
        card.innerHTML = `
            <div class="campaign-header">
                <div class="campaign-info">
                    <h4>${campaign.name}</h4>
                    <p>${campaign.description || 'لا يوجد وصف'}</p>
                </div>
                <div class="campaign-status ${campaign.status}">
                    ${this.getStatusText(campaign.status)}
                </div>
            </div>
            <div class="campaign-stats">
                <div class="campaign-stat">
                    <div class="campaign-stat-value">${campaign.stats?.clicks || 0}</div>
                    <div class="campaign-stat-label">نقرات</div>
                </div>
                <div class="campaign-stat">
                    <div class="campaign-stat-value">${campaign.stats?.conversions || 0}</div>
                    <div class="campaign-stat-label">تحويلات</div>
                </div>
                <div class="campaign-stat">
                    <div class="campaign-stat-value">$${campaign.stats?.earnings || 0}</div>
                    <div class="campaign-stat-label">أرباح</div>
                </div>
            </div>
            <div class="campaign-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.getProgressPercentage(campaign)}%"></div>
                </div>
                <div class="progress-text">${this.getProgressPercentage(campaign)}% مكتمل</div>
            </div>
            <div class="campaign-actions">
                <button class="btn btn-primary" onclick="campaignsManager.editCampaign('${campaign.id}')">
                    <i class="fas fa-edit"></i>
                    تعديل
                </button>
                <button class="btn btn-outline" onclick="campaignsManager.viewCampaign('${campaign.id}')">
                    <i class="fas fa-eye"></i>
                    عرض
                </button>
                <button class="btn btn-outline" onclick="campaignsManager.duplicateCampaign('${campaign.id}')">
                    <i class="fas fa-copy"></i>
                    نسخ
                </button>
                <button class="btn btn-outline" onclick="campaignsManager.deleteCampaign('${campaign.id}')">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
        `;

        return card;
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'نشطة',
            'paused': 'متوقفة',
            'completed': 'مكتملة',
            'draft': 'مسودة'
        };
        return statusMap[status] || status;
    }

    getProgressPercentage(campaign) {
        if (!campaign.budget || !campaign.stats?.spent) return 0;
        return Math.min((campaign.stats.spent / campaign.budget) * 100, 100);
    }

    async createCampaign(campaignData) {
        try {
            const campaign = {
                ...campaignData,
                userId: currentUser.uid,
                status: 'active',
                stats: {
                    clicks: 0,
                    conversions: 0,
                    earnings: 0,
                    spent: 0
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('campaigns').add(campaign);
            
            showNotification('تم الإنشاء', 'تم إنشاء الحملة بنجاح', 'success');
            this.loadCampaigns();
            
            return docRef.id;
        } catch (error) {
            console.error('Error creating campaign:', error);
            showNotification('خطأ', 'فشل إنشاء الحملة', 'error');
            throw error;
        }
    }

    async updateCampaign(campaignId, updateData) {
        try {
            await db.collection('campaigns').doc(campaignId).update({
                ...updateData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showNotification('تم التحديث', 'تم تحديث الحملة بنجاح', 'success');
            this.loadCampaigns();
        } catch (error) {
            console.error('Error updating campaign:', error);
            showNotification('خطأ', 'فشل تحديث الحملة', 'error');
            throw error;
        }
    }

    async deleteCampaign(campaignId) {
        if (!confirm('هل أنت متأكد من حذف هذه الحملة؟')) return;

        try {
            await db.collection('campaigns').doc(campaignId).delete();
            
            showNotification('تم الحذف', 'تم حذف الحملة بنجاح', 'success');
            this.loadCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            showNotification('خطأ', 'فشل حذف الحملة', 'error');
        }
    }

    async duplicateCampaign(campaignId) {
        try {
            const originalCampaign = this.campaigns.find(c => c.id === campaignId);
            if (!originalCampaign) return;

            const duplicatedCampaign = {
                ...originalCampaign,
                name: `${originalCampaign.name} (نسخة)`,
                status: 'draft',
                stats: {
                    clicks: 0,
                    conversions: 0,
                    earnings: 0,
                    spent: 0
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            delete duplicatedCampaign.id;

            await db.collection('campaigns').add(duplicatedCampaign);
            
            showNotification('تم النسخ', 'تم نسخ الحملة بنجاح', 'success');
            this.loadCampaigns();
        } catch (error) {
            console.error('Error duplicating campaign:', error);
            showNotification('خطأ', 'فشل نسخ الحملة', 'error');
        }
    }

    setupEventListeners() {
        // Campaign form submission
        const campaignForm = document.querySelector('.campaign-form');
        if (campaignForm) {
            campaignForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(campaignForm);
                const campaignData = {
                    name: formData.get('campaignName'),
                    description: formData.get('campaignDescription'),
                    category: formData.get('campaignCategory'),
                    platforms: Array.from(formData.getAll('platform')).filter(p => p),
                    budget: parseFloat(formData.get('campaignBudget')),
                    duration: parseInt(formData.get('campaignDuration'))
                };

                try {
                    await this.createCampaign(campaignData);
                    closeModal('campaignModal');
                    campaignForm.reset();
                } catch (error) {
                    console.error('Error creating campaign:', error);
                }
            });
        }

        // Platform checkboxes
        document.querySelectorAll('.platform-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const label = e.target.closest('.platform-checkbox');
                if (e.target.checked) {
                    label.style.background = 'rgba(255, 107, 53, 0.1)';
                } else {
                    label.style.background = 'rgba(255, 255, 255, 0.5)';
                }
            });
        });
    }

    async getCampaignAnalytics(campaignId) {
        try {
            const campaign = this.campaigns.find(c => c.id === campaignId);
            if (!campaign) return null;

            const analytics = {
                overview: campaign.stats,
                dailyStats: await this.getDailyStats(campaignId),
                platformStats: await this.getPlatformStats(campaignId),
                topProducts: await this.getCampaignTopProducts(campaignId)
            };

            return analytics;
        } catch (error) {
            console.error('Error getting campaign analytics:', error);
            return null;
        }
    }

    async getDailyStats(campaignId) {
        try {
            const snapshot = await db.collection('campaignStats')
                .where('campaignId', '==', campaignId)
                .orderBy('date', 'desc')
                .limit(30)
                .get();

            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting daily stats:', error);
            return [];
        }
    }

    async getPlatformStats(campaignId) {
        try {
            const snapshot = await db.collection('campaignStats')
                .where('campaignId', '==', campaignId)
                .get();

            const platformStats = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (!platformStats[data.platform]) {
                    platformStats[data.platform] = {
                        clicks: 0,
                        conversions: 0,
                        earnings: 0
                    };
                }
                platformStats[data.platform].clicks += data.clicks;
                platformStats[data.platform].conversions += data.conversions;
                platformStats[data.platform].earnings += data.earnings;
            });

            return platformStats;
        } catch (error) {
            console.error('Error getting platform stats:', error);
            return {};
        }
    }

    async getCampaignTopProducts(campaignId) {
        try {
            const snapshot = await db.collection('campaignProducts')
                .where('campaignId', '==', campaignId)
                .orderBy('conversions', 'desc')
                .limit(10)
                .get();

            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting campaign top products:', error);
            return [];
        }
    }
}

// Initialize campaigns manager
const campaignsManager = new CampaignsManager();
