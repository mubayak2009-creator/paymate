// app.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    alert("Registered as: " + userCred.user.email);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Signup failed: " + err.message);
  }
});

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    alert("Welcome back, " + userCred.user.email);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

