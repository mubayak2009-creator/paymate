// app.js
import { auth } from "./firebase.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ---------- SIGN UP ----------
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Sign up successful: " + userCredential.user.email);
      signupForm.reset();
    } catch (error) {
      console.error("Signup error:", error.message);
      alert("❌ Signup failed: " + error.message);
    }
  });
}

// ---------- LOGIN ----------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Login successful: " + userCredential.user.email);
      loginForm.reset();
    } catch (error) {
      console.error("Login error:", error.message);
      alert("❌ Login failed: " + error.message);
    }
  });
}

