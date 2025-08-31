// Import Firebase + Auth
import { auth } from "./firebase.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Handle signup
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Account created for: " + userCred.user.email);
    // redirect after signup
    window.location.href = "dashboard.html"; // <-- create this page
  } catch (error) {
    alert("❌ Signup error: " + error.message);
  }
});

// Handle login
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Logged in as: " + userCred.user.email);
    // redirect after login
    window.location.href = "dashboard.html"; // <-- create this page
  } catch (error) {
    alert("❌ Login error: " + error.message);
  }
});

