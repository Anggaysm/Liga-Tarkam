// ============================================
// FIREBASE CONFIG - LIGA WARGA
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyCpePR-6vvSW7nXSdccDsMcgxnkBu0P836I",
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

console.log("🔥 Firebase initialized!");
console.log("📁 Project:", firebaseConfig.projectId);
console.log("👤 Auth:", auth.currentUser ? "Logged in" : "Not logged in");
