<script type="module">
/* --------------------------------------------------
   PayMate Demo Wallet (Firebase + Firestore backend)
-------------------------------------------------- */

// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// 🔑 Your Firebase Config (replace with your own from Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------- Helpers ---------- */
function cents(ghs){ return Math.round(Number(ghs) * 100); }
function fromCents(c){ return (Number(c)/100).toFixed(2); }
const el = (id)=>document.getElementById(id);
const show = (id)=>el(id).classList.remove('hide');
const hide = (id)=>el(id).classList.add('hide');

/* ---------- Firebase User Helpers ---------- */
async function getUserDoc(uid){
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if(!snap.exists()){
    // create doc if missing
    await setDoc(ref, { balance_cents: 0, transactions: [], fullName:"" });
    return { balance_cents: 0, transactions: [] };
  }
  return snap.data();
}

async function updateBalance(uid, newBalance){
  await updateDoc(doc(db, "users", uid), { balance_cents: newBalance });
}

async function pushTransaction(uid, type, amountC, meta=""){
  const ref = collection(db, "users", uid, "transactions");
  await addDoc(ref, {
    type,
    amount_cents: amountC,
    meta,
    created_at: new Date().toISOString()
  });
}

/* ---------- UI Rendering ---------- */
async function renderHeader(){
  const user = auth.currentUser;
  const userArea = el("user-area");
  userArea.innerHTML = "";
  if(user){
    const info = document.createElement("div");
    info.innerHTML = `
      <div style="text-align:right">
        <div style="font-weight:700">${user.email}</div>
      </div>
    `;
    const logoutBtn = document.createElement("button");
    logoutBtn.className="btn ghost";
    logoutBtn.textContent="Logout";
    logoutBtn.onclick = ()=> signOut(auth);
    userArea.appendChild(info);
    userArea.appendChild(logoutBtn);
  } else {
    const btn = document.createElement("button");
    btn.className="btn";
    btn.textContent="Login / Register";
    btn.onclick = ()=> openAuth();
    userArea.appendChild(btn);
  }
}

async function renderBalance(){
  const user = auth.currentUser;
  const amtEl = el("balance-amount");
  const emailEl = el("user-email-display");

  if(!user){
    amtEl.textContent = "GH₵ 0.00";
    emailEl.textContent = "Not signed in";
    return;
  }

  const udata = await getUserDoc(user.uid);
  amtEl.textContent = "GH₵ " + fromCents(udata.balance_cents);
  emailEl.textContent = user.email;

  // Listen for transactions live
  const txList = el("tx-list");
  const ref = collection(db, "users"
                         </script>
