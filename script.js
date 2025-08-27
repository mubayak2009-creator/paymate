<script>
  
}

/*
  Simple client-only wallet demo.
  Data model in localStorage:
    - users: {email: {password, fullName, wallet:{balance_cents}, transactions:[] } }
    - session: {email}
  All amounts stored as integer cents to avoid float issues.
*/

const L = {
  get(key){ try{ return JSON.parse(localStorage.getItem(key)); }catch(e){ return null; } },
  set(key,val){ localStorage.setItem(key, JSON.stringify(val)); },
  del(key){ localStorage.removeItem(key); }
};

const STORAGE_USERS = 'paylite_users_v1';
const STORAGE_SESSION = 'paylite_session_v1';

  function makePayment() {
  alert("Payment processing... ✅");
  }
function cents(ghs) {
  // convert number to integer cents (2 decimal places)
  return Math.round(Number(ghs) * 100);
}
function fromCents(c){ return (Number(c)/100).toFixed(2); }

function getUsers(){
  return L.get(STORAGE_USERS) || {};
}
function saveUsers(u){ L.set(STORAGE_USERS, u); }

function getSession(){ return L.get(STORAGE_SESSION) || null; }
function saveSession(session){ L.set(STORAGE_SESSION, session); }
function clearSession(){ L.del(STORAGE_SESSION); }

function ensureUserData(email){
  const users = getUsers();
  if(!users[email]) {
    users[email] = { password: '', fullName:'', wallet:{balance_cents:0}, transactions:[] };
    saveUsers(users);
  }
  return users[email];
}

function createUser(email, password, fullName){
  const users = getUsers();
  if(users[email]) throw new Error('User already exists');
  users[email] = {
    password: password || '',
    fullName: fullName || '',
    wallet: { balance_cents: 0 },
    transactions: []
  };
  saveUsers(users);
  return users[email];
}

function authenticate(email, password){
  const users = getUsers();
  const u = users[email];
  if(!u) return false;
  return u.password === password;
}

function currentUser(){
  const s = getSession();
  if(!s) return null;
  const users = getUsers();
  return users[s.email] ? { email: s.email, ...users[s.email] } : null;
}

function pushTransaction(email, type, amountCents, meta='') {
  const users = getUsers();
  const u = users[email];
  if(!u) throw new Error('User not found');

  const tx = {
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
    type,
    amount_cents: amountCents,
    balance_after: u.wallet.balance_cents,
    meta,
    created_at: new Date().toISOString()
  };
  u.transactions = u.transactions || [];
  u.transactions.unshift(tx);
  users[email] = u;
  saveUsers(users);
  return tx;
}

/* ---------- UI helpers ---------- */

const el = (id)=>document.getElementById(id);
const show = (id)=>el(id).classList.remove('hide');
const hide = (id)=>el(id).classList.add('hide');

function renderHeader(){
  const s = getSession();
  const userArea = el('user-area');
  userArea.innerHTML = '';
  if(s && s.email){
    const users = getUsers();
    const u = users[s.email];
    const info = document.createElement('div');
    info.style.display='flex';
    info.style.gap='12px';
    info.style.alignItems='center';
    info.innerHTML = \`
      <div style="text-align:right">
        <div style="font-weight:700">\${u.fullName || s.email}</div>
        <div style="font-size:12px;color:var(--muted)">\${s.email}</div>
      </div>
    \`;
    const logoutBtn = document.createElement('button');
    logoutBtn.className='btn ghost';
    logoutBtn.textContent='Logout';
    logoutBtn.onclick = ()=>{ clearSession(); refreshUI(); };

    userArea.appendChild(info);
    userArea.appendChild(logoutBtn);
  } else {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.id = 'open-auth-btn-2';
    btn.textContent = 'Login / Register';
    btn.onclick = ()=> openAuth();
    userArea.appendChild(btn);
  }
}

function renderBalance(){
  const cur = currentUser();
  const amtEl = el('balance-amount');
  const emailEl = el('user-email-display');
  if(!cur){
    amtEl.textContent = 'GH₵ 0.00';
    emailEl.textContent = 'Not signed in';
    hide('deposit-form'); hide('transfer-form'); hide('withdraw-form');
  } else {
    amtEl.textContent = 'GH₵ ' + fromCents(cur.wallet.balance_cents);
    emailEl.textContent = cur.email;
    // show mini forms
  }
  renderTxList();
}

function renderTxList(){
  const list = el('tx-list'); list.innerHTML = '';
  const cur = currentUser();
  if(!cur){ list.innerHTML = '<li class="small">Sign in to see transactions</li>'; return; }
  const txs = cur.transactions || [];
  if(txs.length===0){ list.innerHTML = '<li class="small">No transactions yet</li>'; return; }
  txs.slice(0,50).forEach(tx=>{
    const li = document.createElement('li');
    li.className = 'tx';
    const left = document.createElement('div');
    left.innerHTML = \`<div style="font-weight:600">\${tx.type.replace('_',' ')}</div><div class="meta">\${tx.meta}</div>\`;
    const right = document.createElement('div');
    right.style.textAlign='right';
    const sign = (tx.type==='transfer_out' || tx.type==='withdrawal') ? '-' : '+';
    right.innerHTML = \`<div class="amt">\${sign} GH₵ \${fromCents(tx.amount_cents)}</div><div class="meta">\${new Date(tx.created_at).toLocaleString()}</div>\`;
    li.appendChild(left); li.appendChild(right);
    list.appendChild(li);
  });
}

/* ---------- Actions (deposit/transfer/withdraw) ---------- */

async function depositAction(amountGhs){
  const s = getSession(); if(!s) throw new Error('No session');
  const amountC = cents(amountGhs);
  const users = getUsers();
  users[s.email].wallet.balance_cents += amountC;
  saveUsers(users);
  // ledger
  pushTransaction(s.email, 'deposit', amountC, 'Mock deposit');
  refreshUI();
}

async function transferAction(toEmail, amountGhs){
  const s = getSession(); if(!s) throw new Error('No session');
  const users = getUsers();
  if(!users[toEmail]) throw new Error('Recipient not found');
  const amountC = cents(amountGhs);
  const me = users[s.email];
  if(me.wallet.balance_cents < amountC) throw new Error('Insufficient funds');
  // move funds
  me.wallet.balance_cents -= amountC;
  users[toEmail].wallet.balance_cents += amountC;
  // ledger entries
  users[s.email] = me;
  saveUsers(users);
  pushTransaction(s.email, 'transfer_out', amountC, 'To: ' + toEmail);
  pushTransaction(toEmail, 'transfer_in', amountC, 'From: ' + s.email);
  refreshUI();
}

async function withdrawAction(amountGhs, destination){
  const s = getSession(); if(!s) throw new Error('No session');
  const users = getUsers();
  const amountC = cents(amountGhs);
  const me = users[s.email];
  if(me.wallet.balance_cents < amountC) throw new Error('Insufficient funds');
  me.wallet.balance_cents -= amountC;
  users[s.email] = me;
  saveUsers(users);
  pushTransaction(s.email, 'withdrawal', amountC, 'To: ' + destination);
  refreshUI();
}

/* ---------- UI wiring ---------- */

function openAuth(){
  show('auth-pane');
  el('auth-feedback').textContent='';
}
function closeAuth(){
  hide('auth-pane');
  el('reg-email').value=''; el('reg-password').value=''; el('reg-name').value='';
}

function refreshUI(){
  renderHeader();
  renderBalance();
}

/* Attach event listeners */
document.addEventListener('click', (e)=>{
  // open auth
  if(e.target && e.target.id === 'open-auth-btn') openAuth();
});

el('open-auth-btn')?.addEventListener('click', openAuth);
el('close-auth')?.addEventListener('click', closeAuth);

// register
el('register-btn').addEventListener('click', ()=>{
  const email = el('reg-email').value.trim().toLowerCase();
  const pw = el('reg-password').value;
  const name = el('reg-name').value.trim();
  try{
    if(!email || !pw) throw new Error('Email & password required');
    createUser(email,pw,name);
    saveSession({ email });
    el('auth-feedback').style.color = '#15803d';
    el('auth-feedback').textContent = 'Registered & signed in';
    setTimeout(()=>{ closeAuth(); refreshUI(); }, 600);
  }catch(err){
    el('auth-feedback').style.color = '#b91c1c';
    el('auth-feedback').textContent = err.message;
  }
});

// login
el('login-btn').addEventListener('click', ()=>{
  const email = el('reg-email').value.trim().toLowerCase();
  const pw = el('reg-password').value;
  if(!email || !pw){ el('auth-feedback').textContent = 'Email & password required'; return; }
  if(authenticate(email,pw)){
    saveSession({ email });
    el('auth-feedback').style.color = '#15803d';
    el('auth-feedback').textContent = 'Signed in';
    setTimeout(()=>{ closeAuth(); refreshUI(); }, 400);
  } else {
    el('auth-feedback').style.color = '#b91c1c';
    el('auth-feedback').textContent = 'Wrong email or password';
  }
});

// seed demo users
el('seed-btn').addEventListener('click', ()=>{
  const users = getUsers();
  users['alice@example.com'] = {
    password:'password', fullName:'Alice', wallet:{balance_cents: cents(150)}, transactions: []
  };
  users['bob@example.com'] = {
    password:'password', fullName:'Bob', wallet:{balance_cents: cents(40)}, transactions: []
  };
  saveUsers(users);
  alert('Created demo users: alice@example.com and bob@example.com (password: password)');
  refreshUI();
});

// clear all
el('clear-btn').addEventListener('click', ()=>{
  if(!confirm('Clear demo data from this browser?')) return;
  L.del(STORAGE_USERS); L.del(STORAGE_SESSION);
  refreshUI();
  alert('Cleared');
});

// open deposit form
el('deposit-btn').addEventListener('click', ()=>{
  if(!currentUser()){ openAuth(); return; }
  show('deposit-form'); hide('transfer-form'); hide('withdraw-form');
});
el('cancel-deposit').addEventListener('click', ()=>hide('deposit-form'));
el('do-deposit').addEventListener('click', async ()=>{
  try{
    const v = Number(el('deposit-amount').value);
    if(!v || v <= 0) throw new Error('Enter valid amount');
    await depositAction(v);
    alert('Deposit added (mock)');
    hide('deposit-form');
  }catch(e){ alert(e.message); }
});

// transfer
el('transfer-btn').addEventListener('click', ()=>{
  if(!currentUser()){ openAuth(); return; }
  show('transfer-form'); hide('deposit-form'); hide('withdraw-form');
});
el('cancel-transfer').addEventListener('click', ()=>hide('transfer-form'));
el('do-transfer').addEventListener('click', async ()=>{
  try{
    const to = el('transfer-to').value.trim().toLowerCase();
    const amt = Number(el('transfer-amount').value);
    if(!to || !amt) throw new Error('Enter recipient and amount');
    await transferAction(to, amt);
    alert('Transfer successful');
    hide('transfer-form');
  }catch(e){ el('transfer-feedback').textContent = e.message; }
});

// withdraw
el('withdraw-btn').addEventListener('click', ()=>{
  if(!currentUser()){ openAuth(); return; }
  show('withdraw-form'); hide('deposit-form'); hide('transfer-form');
});
el('cancel-withdraw').addEventListener('click', ()=>hide('withdraw-form'));
el('do-withdraw').addEventListener('click', async ()=>{
  try{
    const amt = Number(el('withdraw-amount').value);
    const dest = el('withdraw-dest').value.trim() || 'Unknown';
    if(!amt || amt <= 0) throw new Error('Enter valid amount');
    await withdrawAction(amt, dest);
    alert('Withdrawal requested (mock) and marked completed.');
    hide('withdraw-form');
  }catch(e){ alert(e.message); }
});

el('close-auth').addEventListener('click', closeAuth);

// initial render
(function init(){
  renderHeader();
  renderBalance();
  // if no users exist, create a sample account for quick testing
  const users = getUsers();
  if(Object.keys(users).length === 0){
    // leave empty to let user seed or register
  }
})();

</script>

