// Authentication Module
class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Listen for auth state changes
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.user = user;
                this.isAuthenticated = true;
                this.updateUI();
                this.loadUserData();
            } else {
                this.user = null;
                this.isAuthenticated = false;
                this.showLandingPage();
            }
        });

        // Setup form handlers
        this.setupFormHandlers();
    }

    setupFormHandlers() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            showLoading();
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            showNotification('تم تسجيل الدخول بنجاح', 'مرحباً بك في كوميشن برو', 'success');
            closeModal('authModal');
        } catch (error) {
            console.error('Login error:', error);
            showNotification('خطأ في تسجيل الدخول', this.getAuthErrorMessage(error.code), 'error');
        } finally {
            hideLoading();
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const phone = document.getElementById('registerPhone').value;

        try {
            showLoading();
            
            // Create user in Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update user profile
            await userCredential.user.updateProfile({
                displayName: name
            });

            // Create user document in Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                phone: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalEarnings: 0,
                totalSales: 0,
                totalReferrals: 0,
                referralCode: this.generateReferralCode(),
                referralBy: null,
                withdrawalMethods: [],
                preferences: {
                    notifications: true,
                    currency: 'USD',
                    language: 'ar'
                }
            });

            showNotification('تم إنشاء الحساب بنجاح', 'مرحباً بك في كوميشن برو', 'success');
            closeModal('authModal');
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('خطأ في إنشاء الحساب', this.getAuthErrorMessage(error.code), 'error');
        } finally {
            hideLoading();
        }
    }

    async signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        try {
            showLoading();
            const result = await auth.signInWithPopup(provider);
            
            // Check if user exists in Firestore
            const userDoc = await db.collection('users').doc(result.user.uid).get();
            
            if (!userDoc.exists) {
                // Create new user document
                await db.collection('users').doc(result.user.uid).set({
                    name: result.user.displayName,
                    email: result.user.email,
                    phone: result.user.phoneNumber || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    totalEarnings: 0,
                    totalSales: 0,
                    totalReferrals: 0,
                    referralCode: this.generateReferralCode(),
                    referralBy: null,
                    withdrawalMethods: [],
                    preferences: {
                        notifications: true,
                        currency: 'USD',
                        language: 'ar'
                    }
                });
            }

            showNotification('تم تسجيل الدخول بنجاح', 'مرحباً بك في كوميشن برو', 'success');
            closeModal('authModal');
        } catch (error) {
            console.error('Google sign-in error:', error);
            showNotification('خطأ في تسجيل الدخول', this.getAuthErrorMessage(error.code), 'error');
        } finally {
            hideLoading();
        }
    }

    async signInWithFacebook() {
        const provider = new firebase.auth.FacebookAuthProvider();
        
        try {
            showLoading();
            const result = await auth.signInWithPopup(provider);
            
            // Check if user exists in Firestore
            const userDoc = await db.collection('users').doc(result.user.uid).get();
            
            if (!userDoc.exists) {
                // Create new user document
                await db.collection('users').doc(result.user.uid).set({
                    name: result.user.displayName,
                    email: result.user.email,
                    phone: result.user.phoneNumber || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    totalEarnings: 0,
                    totalSales: 0,
                    totalReferrals: 0,
                    referralCode: this.generateReferralCode(),
                    referralBy: null,
                    withdrawalMethods: [],
                    preferences: {
                        notifications: true,
                        currency: 'USD',
                        language: 'ar'
                    }
                });
            }

            showNotification('تم تسجيل الدخول بنجاح', 'مرحباً بك في كوميشن برو', 'success');
            closeModal('authModal');
        } catch (error) {
            console.error('Facebook sign-in error:', error);
            showNotification('خطأ في تسجيل الدخول', this.getAuthErrorMessage(error.code), 'error');
        } finally {
            hideLoading();
        }
    }

    async logout() {
        try {
            await auth.signOut();
            showNotification('تم تسجيل الخروج', 'نتمنى لك يوماً سعيداً', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('خطأ في تسجيل الخروج', 'يرجى المحاولة مرة أخرى', 'error');
        }
    }

    updateUI() {
        // Show dashboard
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('mainDashboard').style.display = 'block';
        
        // Show user info
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('userDropdown').style.display = 'block';
        document.getElementById('loginBtn').style.display = 'none';
        
        // Update user info
        if (this.user) {
            document.getElementById('userName').textContent = this.user.displayName || 'مستخدم';
            document.getElementById('userEmail').textContent = this.user.email;
            document.getElementById('userAvatar').textContent = (this.user.displayName || 'م')[0];
        }
    }

    showLandingPage() {
        // Show landing page
        document.getElementById('landingPage').style.display = 'block';
        document.getElementById('mainDashboard').style.display = 'none';
        
        // Hide user info
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('userDropdown').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'block';
    }

    async loadUserData() {
        if (!this.user) return;

        try {
            const userDoc = await db.collection('users').doc(this.user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Update referral link
                const referralLink = `https://commissionpro.com/ref/${userData.referralCode}`;
                document.getElementById('referralLink').value = referralLink;
                
                // Load user data into dashboard
                this.updateDashboardStats(userData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    updateDashboardStats(userData) {
        // Update banner stats
        document.getElementById('totalEarningsBanner').textContent = `$${userData.totalEarnings.toFixed(2)}`;
        document.getElementById('totalSalesBanner').textContent = userData.totalSales;
        document.getElementById('totalReferralsBanner').textContent = userData.totalReferrals;
        
        // Update earnings display
        document.getElementById('todayEarnings').textContent = '$0.00';
        document.getElementById('weekEarnings').textContent = '$0.00';
        document.getElementById('monthEarnings').textContent = '$0.00';
        document.getElementById('totalEarnings').textContent = `$${userData.totalEarnings.toFixed(2)}`;
        
        // Update available balance
        document.getElementById('availableBalance').textContent = `$${userData.totalEarnings.toFixed(2)}`;
    }

    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    getAuthErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'المستخدم غير موجود',
            'auth/wrong-password': 'كلمة المرور خاطئة',
            'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
            'auth/weak-password': 'كلمة المرور ضعيفة جداً',
            'auth/invalid-email': 'البريد الإلكتروني غير صالح',
            'auth/user-disabled': 'حساب المستخدم معطل',
            'auth/too-many-requests': 'محاولات كثيرة جداً، يرجى المحاولة لاحقاً',
            'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت',
            'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول'
        };
        return errorMessages[errorCode] || 'حدث خطأ غير معروف';
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Global functions for auth
function signInWithGoogle() {
    authManager.signInWithGoogle();
}

function signInWithFacebook() {
    authManager.signInWithFacebook();
}

function logout() {
    authManager.logout();
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabs[1].classList.add('active');
    }
}
