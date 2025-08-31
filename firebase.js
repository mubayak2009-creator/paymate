// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCM7__CBDBWAOH8c3TKShNEOyG-Pq5NDMs",
  authDomain: "paymate-e4949.firebaseapp.com",
  projectId: "paymate-e4949",
  storageBucket: "paymate-e4949.firebasestorage.app",
  messagingSenderId: "930809633379",
  appId: "1:930809633379:web:d10f7f62f1243dfdc5f656",
  measurementId: "G-EVVG2TCZEC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
