// firebase-config.js

// Firebase yapılandırma bilgileri
const firebaseConfig = {
    apiKey: "AIzaSyCl4xH2on7Xb0UiLzJq_-PqQcLtcWpnDCE", // Firebase API Key
    authDomain: "husearch-e2cdd.firebaseapp.com",
    projectId: "husearch-e2cdd",
    storageBucket: "husearch-e2cdd.firebasestorage.app",
    messagingSenderId: "493356143603",
    appId: "1:493356143603:web:783c14375db314b94eb886"
  };
  
  // Firebase'i başlatma
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

// Firebase'i başlatıyoruz
const app = initializeApp(firebaseConfig);

// Firestore'u başlatma
const db = getFirestore(app);
