// ============================================
// FIREBASE CONFIG - LIGA WARGA
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyCePR-6vvSW7nXSdccDsMcgxnkBuoP836I",
  authDomain: "ligawarga-9909e.firebaseapp.com",
  projectId: "ligawarga-9909e",
  storageBucket: "ligawarga-9909e.firebasestorage.app",
  messagingSenderId: "27401056602",
  appId: "1:27401056602:web:64016548badc5d9ba48363",
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
