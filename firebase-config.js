// ============================================
// FIREBASE CONFIG - LIGA WARGA
// ============================================

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Services
const db = firebase.firestore();
const auth = firebase.auth();

// 🔥 MATIKAN OFFLINE PERSISTENCE DULU (COMMENT INI)
// db.enablePersistence({ synchronizeTabs: true })
//   .then(() => {
//     console.log('✅ Offline persistence enabled!');
//   })
//   .catch((err) => {
//     console.log('⚠️ Persistence error:', err);
//   });

console.log("🔥 Firebase initialized!");
console.log("📁 Project:", firebaseConfig.projectId);
