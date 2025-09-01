// Import Firebase SDKs from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCM7__CBDBWAOH8c3TKShNEOyG-Pq5NDMs",
  authDomain: "paymate-e4949.firebaseapp.com",
  projectId: "paymate-e4949",
  storageBucket: "paymate-e4949.firebasestorage.app",
  messagingSenderId: "930809633379",
  appId: "1:930809633379:web:ecef5709c2d80514c5f656",
  measurementId: "G-7X9V0DYKRZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
