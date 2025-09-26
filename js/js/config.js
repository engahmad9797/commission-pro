// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "commissionpro.firebaseapp.com",
    projectId: "commissionpro",
    storageBucket: "commissionpro.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://api.commissionpro.com/v1',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3
};

// Platform Configuration
const PLATFORMS = {
    amazon: {
        name: 'أمازون',
        commission: { min: 4, max: 10 },
        api: 'https://affiliate-api.amazon.com',
        trackingId: 'commissionpro-20'
    },
    aliexpress: {
        name: 'علي إكسبريس',
        commission: { min: 5, max: 50 },
        api: 'https://api.aliexpress.com',
        trackingId: 'commissionpro'
    },
    temu: {
        name: 'تيمو',
        commission: { min: 5, max: 20 },
        api: 'https://api.temu.com',
        trackingId: 'commissionpro'
    },
    ebay: {
        name: 'إيباي',
        commission: { min: 3, max: 12 },
        api: 'https://api.ebay.com',
        trackingId: 'commissionpro'
    }
};

// App Configuration
const APP_CONFIG = {
    MIN_WITHDRAWAL: 10,
    REFERRAL_COMMISSION: 10,
    CURRENCY: 'USD',
    SUPPORTED_COUNTRIES: ['SA', 'AE', 'EG', 'KW', 'QA', 'BH', 'OM', 'JO', 'LB', 'IQ'],
    DEFAULT_LANGUAGE: 'ar',
    TIMEZONE: 'Asia/Riyadh'
};
