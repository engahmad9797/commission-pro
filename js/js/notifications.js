// Notifications Management Module
class NotificationsManager {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.permissionGranted = false;
    }

    async initialize() {
        await this.loadNotifications();
        this.setupEventListeners();
        this.requestPermission();
        this.setupRealTimeListener();
    }

    async loadNotifications() {
        try {
            const snapshot = await db.collection('notifications')
                .where('userId', '==', currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            this.notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.unreadCount = this.notifications.filter(n => !n.read).length;
            this.updateNotificationBadge();
            this.displayNotifications();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    setupEventListeners() {
        // Notifications bell click
        const notificationsBell = document.getElementById('notificationsBell');
        if (notificationsBell) {
            notificationsBell.addEventListener('click', () => {
                this.toggleNotificationsDropdown();
            });
        }

        // Mark all as read
        const markAllReadBtn = document.querySelector('.mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notificationsDropdown');
            const bell = document.getElementById('notificationsBell');
            
            if (dropdown && bell && !dropdown.contains(e.target) && !bell.contains(e.target)) {
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
                dropdown.style.transform = 'translateY(-10px)';
            }
        });
    }

    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.permissionGranted = permission === 'granted';
        }
    }

    setupRealTimeListener() {
        db.collection('notifications')
            .where('userId', '==', currentUser.uid)
            .where('read', '==', false)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const notification = change.doc.data();
                        this.showRealTimeNotification(notification);
                        this.unreadCount++;
                        this.updateNotificationBadge();
                    }
                });
            });
    }

    async addNotification(title, message, type = 'info', data = {}) {
        try {
            const notification = {
                userId: currentUser.uid,
                title,
                message,
                type,
                data,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('notifications').add(notification);
            
            // Show browser notification if permission granted
            if (this.permissionGranted) {
                this.showBrowserNotification(title, message, type);
            }

            return docRef.id;
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    }

    showRealTimeNotification(notification) {
        const notificationList = document.getElementById('notificationsList');
        if (!notificationList) return;

        const notificationItem = this.createNotificationElement(notification);
        notificationList.insertBefore(notificationItem, notificationList.firstChild);

        // Limit notifications to 10
        while (notificationList.children.length > 10) {
            notificationList.removeChild(notificationList.lastChild);
        }

        // Play sound
        this.playNotificationSound();
    }

    createNotificationElement(notification) {
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${this.formatTime(notification.createdAt.toDate())}</div>
            </div>
            ${!notification.read ? `
                <button class="notification-close" onclick="notificationsManager.markAsRead('${notification.id}', this.parentElement)">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        `;

        return item;
    }

    getNotificationIcon(type) {
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            sale: 'fa-shopping-cart',
            referral: 'fa-user-plus',
            withdrawal: 'fa-money-bill',
            campaign: 'fa-bullhorn'
        };
        return iconMap[type] || 'fa-info-circle';
    }

    formatTime(date) {
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

    async markAsRead(notificationId, element) {
        try {
            await db.collection('notifications').doc(notificationId).update({
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (element) {
                element.style.opacity = '0.5';
                element.querySelector('.notification-close')?.remove();
            }

            this.unreadCount--;
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const batch = db.batch();
            const unreadNotifications = this.notifications.filter(n => !n.read);

            unreadNotifications.forEach(notification => {
                const ref = db.collection('notifications').doc(notification.id);
                batch.update(ref, {
                    read: true,
                    readAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            await batch.commit();

            this.unreadCount = 0;
            this.updateNotificationBadge();
            this.displayNotifications();

            showNotification('تم التحديث', 'تم تحديد جميع الإشعارات كمقروء', 'success');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'block' : 'none';
        }
    }

    displayNotifications() {
        const notificationList = document.getElementById('notificationsList');
        if (!notificationList) return;

        notificationList.innerHTML = '';

        if (this.notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
            return;
        }

        this.notifications.forEach(notification => {
            const element = this.createNotificationElement(notification);
            notificationList.appendChild(element);
        });
    }

    toggleNotificationsDropdown() {
        const dropdown = document.getElementById('notificationsDropdown');
        if (!dropdown) return;

        if (dropdown.style.visibility === 'visible') {
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(-10px)';
        } else {
            dropdown.style.opacity = '1';
            dropdown.style.visibility = 'visible';
            dropdown.style.transform = 'translateY(0)';
        }
    }

    showBrowserNotification(title, message, type) {
        if (!this.permissionGranted) return;

        const iconMap = {
            success: '/icons/success.png',
            error: '/icons/error.png',
            warning: '/icons/warning.png',
            info: '/icons/info.png'
        };

        new Notification(title, {
            body: message,
            icon: iconMap[type] || '/icons/info.png',
            badge: '/favicon.ico',
            tag: 'commissionpro-notification',
            renotify: true,
            requireInteraction: false
        });
    }

    playNotificationSound() {
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Failed to play notification sound:', e));
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    }

    async sendEmailNotification(email, subject, message) {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: email,
                    subject,
                    message
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending email notification:', error);
            throw error;
        }
    }

    async sendSMSNotification(phone, message) {
        try {
            const response = await fetch('/api/send-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: phone,
                    message
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send SMS');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending SMS notification:', error);
            throw error;
        }
    }

    async scheduleNotification(title, message, type, scheduledAt) {
        try {
            const notification = {
                userId: currentUser.uid,
                title,
                message,
                type,
                scheduledAt,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('scheduledNotifications').add(notification);
            
            showNotification('تم الجدولة', 'تم جدولة الإشعار بنجاح', 'success');
        } catch (error) {
            console.error('Error scheduling notification:', error);
            showNotification('خطأ', 'فشل جدولة الإشعار', 'error');
        }
    }

    async cancelScheduledNotification(notificationId) {
        try {
            await db.collection('scheduledNotifications').doc(notificationId).delete();
            
            showNotification('تم الإلغاء', 'تم إلغاء الإشعار المجدول', 'success');
        } catch (error) {
            console.error('Error canceling scheduled notification:', error);
            showNotification('خطأ', 'فشل إلغاء الإشعار المجدول', 'error');
        }
    }
}

// Initialize notifications manager
const notificationsManager = new NotificationsManager();
