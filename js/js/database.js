// Database Management Module
class DatabaseManager {
    constructor() {
        this.db = db;
        this.userData = null;
        this.products = [];
        this.transactions = [];
        this.referrals = [];
    }

    // User Data Management
    async getUserData(userId) {
        try {
            const doc = await this.db.collection('users').doc(userId).get();
            if (doc.exists) {
                this.userData = doc.data();
                return this.userData;
            }
            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
            throw error;
        }
    }

    async updateUserData(userId, data) {
        try {
            await this.db.collection('users').doc(userId).update(data);
            if (this.userData) {
                this.userData = { ...this.userData, ...data };
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
        }
    }

    async addEarning(userId, amount, platform, type = 'sale') {
        try {
            const batch = this.db.batch();
            
            // Update user earnings
            const userRef = this.db.collection('users').doc(userId);
            batch.update(userRef, {
                totalEarnings: firebase.firestore.FieldValue.increment(amount),
                totalSales: firebase.firestore.FieldValue.increment(1),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Add transaction
            const transactionRef = this.db.collection('transactions').doc();
            batch.set(transactionRef, {
                userId: userId,
                amount: amount,
                platform: platform,
                type: type,
                status: 'completed',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await batch.commit();
            
            // Update local data
            if (this.userData) {
                this.userData.totalEarnings += amount;
                this.userData.totalSales += 1;
            }
            
            return transactionRef.id;
        } catch (error) {
            console.error('Error adding earning:', error);
            throw error;
        }
    }

    async addReferral(userId, referralCode) {
        try {
            // Get referrer
            const referrerSnapshot = await this.db.collection('users')
                .where('referralCode', '==', referralCode)
                .get();
            
            if (referrerSnapshot.empty) {
                return null;
            }
            
            const referrerId = referrerSnapshot.docs[0].id;
            const batch = this.db.batch();
            
            // Update referrer stats
            const referrerRef = this.db.collection('users').doc(referrerId);
            batch.update(referrerRef, {
                totalReferrals: firebase.firestore.FieldValue.increment(1),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update user referral info
            const userRef = this.db.collection('users').doc(userId);
            batch.update(userRef, {
                referralBy: referrerId,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Add referral record
            const referralRef = this.db.collection('referrals').doc();
            batch.set(referralRef, {
                referrerId: referrerId,
                referredId: userId,
                referralCode: referralCode,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await batch.commit();
            
            return referrerId;
        } catch (error) {
            console.error('Error adding referral:', error);
            throw error;
        }
    }

    // Products Management
    async getProducts(platform = 'all', category = 'all', limit = 20, offset = 0) {
        try {
            let query = this.db.collection('products');
            
            if (platform !== 'all') {
                query = query.where('platform', '==', platform);
            }
            
            if (category !== 'all') {
                query = query.where('category', '==', category);
            }
            
            const snapshot = await query
                .orderBy('commission', 'desc')
                .limit(limit)
                .offset(offset)
                .get();
            
            this.products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return this.products;
        } catch (error) {
            console.error('Error getting products:', error);
            throw error;
        }
    }

    async addProduct(productData) {
        try {
            const docRef = await this.db.collection('products').add({
                ...productData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return docRef.id;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    // Transactions Management
    async getTransactions(userId, type = 'all', limit = 20, offset = 0) {
        try {
            let query = this.db.collection('transactions')
                .where('userId', '==', userId);
            
            if (type !== 'all') {
                query = query.where('type', '==', type);
            }
            
            const snapshot = await query
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .offset(offset)
                .get();
            
            this.transactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return this.transactions;
        } catch (error) {
            console.error('Error getting transactions:', error);
            throw error;
        }
    }

    async addWithdrawal(userId, amount, method, details = {}) {
        try {
            const batch = this.db.batch();
            
            // Update user balance
            const userRef = this.db.collection('users').doc(userId);
            batch.update(userRef, {
                totalEarnings: firebase.firestore.FieldValue.increment(-amount),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Add withdrawal transaction
            const transactionRef = this.db.collection('transactions').doc();
            batch.set(transactionRef, {
                userId: userId,
                amount: -amount,
                platform: 'withdrawal',
                type: 'withdrawal',
                status: 'pending',
                method: method,
                details: details,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Add withdrawal record
            const withdrawalRef = this.db.collection('withdrawals').doc();
            batch.set(withdrawalRef, {
                userId: userId,
                amount: amount,
                method: method,
                details: details,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await batch.commit();
            
            // Update local data
            if (this.userData) {
                this.userData.totalEarnings -= amount;
            }
            
            return withdrawalRef.id;
        } catch (error) {
            console.error('Error adding withdrawal:', error);
            throw error;
        }
    }

    // Analytics
    async getEarningsData(userId, period = 'day') {
        try {
            const now = new Date();
            let startDate;
            
            switch (period) {
                case 'day':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            }
            
            const snapshot = await this.db.collection('transactions')
                .where('userId', '==', userId)
                .where('type', 'in', ['sale', 'referral'])
                .where('createdAt', '>=', startDate)
                .where('status', '==', 'completed')
                .get();
            
            const transactions = snapshot.docs.map(doc => doc.data());
            const total = transactions.reduce((sum, t) => sum + t.amount, 0);
            
            return {
                total: total,
                transactions: transactions,
                period: period
            };
        } catch (error) {
            console.error('Error getting earnings data:', error);
            throw error;
        }
    }

    async getPlatformEarnings(userId) {
        try {
            const snapshot = await this.db.collection('transactions')
                .where('userId', '==', userId)
                .where('type', 'in', ['sale', 'referral'])
                .where('status', '==', 'completed')
                .get();
            
            const transactions = snapshot.docs.map(doc => doc.data());
            const platformEarnings = {};
            
            transactions.forEach(t => {
                if (!platformEarnings[t.platform]) {
                    platformEarnings[t.platform] = 0;
                }
                platformEarnings[t.platform] += t.amount;
            });
            
            return platformEarnings;
        } catch (error) {
            console.error('Error getting platform earnings:', error);
            throw error;
        }
    }

    // Leaderboard
    async getLeaderboard(limit = 10) {
        try {
            const snapshot = await this.db.collection('users')
                .orderBy('totalEarnings', 'desc')
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            throw error;
        }
    }

    // Notifications
    async addNotification(userId, title, message, type = 'info') {
        try {
            const notificationRef = await this.db.collection('notifications').add({
                userId: userId,
                title: title,
                message: message,
                type: type,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return notificationRef.id;
        } catch (error) {
            console.error('Error adding notification:', error);
            throw error;
        }
    }

    async getNotifications(userId, limit = 20) {
        try {
            const snapshot = await this.db.collection('notifications')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            await this.db.collection('notifications').doc(notificationId).update({
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }
}

// Initialize database manager
const dbManager = new DatabaseManager();
