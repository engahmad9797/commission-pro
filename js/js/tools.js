// Tools Management Module
class ToolsManager {
    constructor() {
        this.currentTool = null;
        this.tools = {
            linkGenerator: new LinkGenerator(),
            qrGenerator: new QRGenerator(),
            linkAnalyzer: new LinkAnalyzer(),
            reportGenerator: new ReportGenerator(),
            campaignManager: new CampaignManager(),
            contentGenerator: new ContentGenerator()
        };
    }

    async initialize() {
        this.setupEventListeners();
        await this.initializeTools();
    }

    async initializeTools() {
        Object.values(this.tools).forEach(tool => {
            if (tool.initialize) {
                tool.initialize();
            }
        });
    }

    setupEventListeners() {
        // Tool search
        const searchInput = document.getElementById('toolsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTools(e.target.value);
            });
        }

        // Tool cards
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', () => {
                const toolName = card.getAttribute('data-tool');
                this.openTool(toolName);
            });
        });
    }

    filterTools(searchTerm) {
        const toolCards = document.querySelectorAll('.tool-card');
        const term = searchTerm.toLowerCase();

        toolCards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(term) || description.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    openTool(toolName) {
        const tool = this.tools[toolName];
        if (tool && tool.open) {
            tool.open();
        } else {
            showNotification('قيد التطوير', 'هذه الأداة قيد التطوير', 'info');
        }
    }

    async generateAffiliateLink(productId, platform, options = {}) {
        try {
            const link = await this.tools.linkGenerator.generate(productId, platform, options);
            showNotification('تم الإنشاء', 'تم إنشاء الرابط التابع بنجاح', 'success');
            return link;
        } catch (error) {
            console.error('Error generating affiliate link:', error);
            showNotification('خطأ', 'فشل إنشاء الرابط التابع', 'error');
            throw error;
        }
    }

    async generateQRCode(data, options = {}) {
        try {
            const qrCode = await this.tools.qrGenerator.generate(data, options);
            showNotification('تم الإنشاء', 'تم إنشاء كود QR بنجاح', 'success');
            return qrCode;
        } catch (error) {
            console.error('Error generating QR code:', error);
            showNotification('خطأ', 'فشل إنشاء كود QR', 'error');
            throw error;
        }
    }

    async analyzeLink(linkId) {
        try {
            const analytics = await this.tools.linkAnalyzer.analyze(linkId);
            showNotification('تم التحليل', 'تم تحليل الرابط بنجاح', 'success');
            return analytics;
        } catch (error) {
            console.error('Error analyzing link:', error);
            showNotification('خطأ', 'فشل تحليل الرابط', 'error');
            throw error;
        }
    }

    async generateReport(type, options = {}) {
        try {
            const report = await this.tools.reportGenerator.generate(type, options);
            showNotification('تم الإنشاء', 'تم إنشاء التقرير بنجاح', 'success');
            return report;
        } catch (error) {
            console.error('Error generating report:', error);
            showNotification('خطأ', 'فشل إنشاء التقرير', 'error');
            throw error;
        }
    }

    async createCampaign(campaignData) {
        try {
            const campaign = await this.tools.campaignManager.create(campaignData);
            showNotification('تم الإنشاء', 'تم إنشاء الحملة بنجاح', 'success');
            return campaign;
        } catch (error) {
            console.error('Error creating campaign:', error);
            showNotification('خطأ', 'فشل إنشاء الحملة', 'error');
            throw error;
        }
    }

    async generateContent(type, options = {}) {
        try {
            const content = await this.tools.contentGenerator.generate(type, options);
            showNotification('تم الإنشاء', 'تم إنشاء المحتوى بنجاح', 'success');
            return content;
        } catch (error) {
            console.error('Error generating content:', error);
            showNotification('خطأ', 'فشل إنشاء المحتوى', 'error');
            throw error;
        }
    }
}

// Link Generator Tool
class LinkGenerator {
    async generate(productId, platform, options = {}) {
        const baseUrl = `${API_CONFIG.BASE_URL}/affiliate`;
        const params = new URLSearchParams({
            productId,
            platform,
            userId: currentUser.uid,
            ...options
        });

        const response = await fetch(`${baseUrl}/generate?${params}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to generate affiliate link');
        }

        return await response.json();
    }

    open() {
        showNotification('مولد الروابط', 'سيتم فتح مولد الروابط قريباً', 'info');
    }
}

// QR Generator Tool
class QRGenerator {
    async generate(data, options = {}) {
        const qrOptions = {
            size: options.size || 200,
            color: options.color || '#000000',
            backgroundColor: options.backgroundColor || '#ffffff',
            ...options
        };

        const response = await fetch(`${API_CONFIG.BASE_URL}/qr/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data,
                options: qrOptions
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate QR code');
        }

        return await response.json();
    }

    open() {
        showNotification('مولد QR Codes', 'سيتم فتح مولد QR Codes قريباً', 'info');
    }
}

// Link Analyzer Tool
class LinkAnalyzer {
    async analyze(linkId) {
        const response = await fetch(`${API_CONFIG.BASE_URL}/analytics/links/${linkId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${await this.getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to analyze link');
        }

        return await response.json();
    }

    async getAuthToken() {
        const user = auth.currentUser;
        if (user) {
            return await user.getIdToken();
        }
        throw new Error('User not authenticated');
    }

    open() {
        showNotification('محلل الروابط', 'سيتم فتح محلل الروابط قريباً', 'info');
    }
}

// Report Generator Tool
class ReportGenerator {
    async generate(type, options = {}) {
        const response = await fetch(`${API_CONFIG.BASE_URL}/reports/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await this.getAuthToken()}`
            },
            body: JSON.stringify(options)
        });

        if (!response.ok) {
            throw new Error('Failed to generate report');
        }

        return await response.json();
    }

    async getAuthToken() {
        const user = auth.currentUser;
        if (user) {
            return await user.getIdToken();
        }
        throw new Error('User not authenticated');
    }

    open() {
        showNotification('منشئ التقارير', 'سيتم فتح منشئ التقارير قريباً', 'info');
    }
}

// Campaign Manager Tool
class CampaignManager {
    async create(campaignData) {
        const response = await fetch(`${API_CONFIG.BASE_URL}/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await this.getAuthToken()}`
            },
            body: JSON.stringify(campaignData)
        });

        if (!response.ok) {
            throw new Error('Failed to create campaign');
        }

        return await response.json();
    }

    async getAuthToken() {
        const user = auth.currentUser;
        if (user) {
            return await user.getIdToken();
        }
        throw new Error('User not authenticated');
    }

    open() {
        showNotification('مدير الحملات', 'سيتم فتح مدير الحملات قريباً', 'info');
    }
}

// Content Generator Tool
class ContentGenerator {
    async generate(type, options = {}) {
        const response = await fetch(`${API_CONFIG.BASE_URL}/content/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await this.getAuthToken()}`
            },
            body: JSON.stringify(options)
        });

        if (!response.ok) {
            throw new Error('Failed to generate content');
        }

        return await response.json();
    }

    async getAuthToken() {
        const user = auth.currentUser;
        if (user) {
            return await user.getIdToken();
        }
        throw new Error('User not authenticated');
    }

    open() {
        showNotification('منشئ المحتوى', 'سيتم فتح منشئ المحتوى قريباً', 'info');
    }
}

// Initialize tools manager
const toolsManager = new ToolsManager();
