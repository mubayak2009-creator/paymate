// app.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const balanceAmount = document.getElementById("balance-amount");
const userEmailDisplay = document.getElementById("user-email-display");
const txList = document.getElementById("tx-list");

// --- Register ---
document.getElementById("register-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const name = document.getElementById("reg-name").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      email,
      balance: 0
    });
    alert("Registered ✅");
  } catch (err) {
    alert(err.message);
  }
});

// --- Login ---
document.getElementById("login-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in 🎉");
  } catch (err) {
    alert(err.message);
  }
});

// --- Auth state listener ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userEmailDisplay.textContent = user.email;

    const userRef = doc(db, "users", user.uid);
    onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        balanceAmount.textContent = `GH₵ ${snap.data().balance.toFixed(2)}`;
      }
    });

    const txRef = collection(db, "users", user.uid, "transactions");
    onSnapshot(txRef, (snap) => {
      txList.innerHTML = "";
      snap.forEach((doc) => {
        const li = document.createElement("li");
        li.textContent = `${doc.data().type}: GH₵ ${doc.data().amount}`;
        txList.appendChild(li);
      });
    });
  } else {
    userEmailDisplay.textContent = "Not signed in";
    balanceAmount.textContent = "GH₵ 0.00";
    txList.innerHTML = "";
  }
});

// --- Deposit ---
document.getElementById("do-deposit")?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first");

  const amount = parseFloat(document.getElementById("deposit-amount").value);
  if (amount <= 0) return alert("Enter valid amount");

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  let newBalance = snap.data().balance + amount;

  await updateDoc(userRef, { balance: newBalance });
  await addDoc(collection(db, "users", user.uid, "transactions"), {
    type: "Deposit",
    amount,
    created: new Date()
  });
});

// --- Withdraw ---
document.getElementById("do-withdraw")?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first");

  const amount = parseFloat(document.getElementById("withdraw-amount").value);
  if (amount <= 0) return alert("Enter valid amount");

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  let balance = snap.data().balance;

  if (balance < amount) return alert("Insufficient funds");

  await updateDoc(userRef, { balance: balance - amount });
  await addDoc(collection(db, "users", user.uid, "transactions"), {
    type: "Withdraw",
    amount,
    created: new Date()
  });
});

// --- Transfer ---
document.getElementById("do-transfer")?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first");

  const toEmail = document.getElementById("transfer-to").value;
  const amount = parseFloat(document.getElementById("transfer-amount").value);

  if (!toEmail || amount <= 0) return alert("Enter valid details");

  // Find recipient
  const userSnap = await getDoc(doc(db, "users", user.uid));
  const senderBalance = userSnap.data().balance;
  if (senderBalance < amount) return alert("Insufficient funds");

  // Naive query (in real app you'd use Firebase query)
  alert("For demo: manually find recipient by UID in Firestore and credit them 🚀");

  await updateDoc(doc(db, "users", user.uid), {
    balance: senderBalance - amount
  });

  await addDoc(collection(db, "users", user.uid, "transactions"), {
    type: `Transfer to ${toEmail}`,
    amount,
    created: new Date()
  });
});
