// finto "backend" su localStorage: solo per scopi didattici

const STORAGE_KEYS = {
  USERS: 'demo_users',
  RESET_TOKENS: 'demo_reset_tokens'
};

// seed: utente demo
function seed() {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  if (!users.find(u => u.email === 'demo@acme.com')) {
    users.push({ email: 'demo@acme.com', password: 'demo123' });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}
seed();

export async function login(email, password) {
  await delay(300);
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const found = users.find(u => u.email === email && u.password === password);
  if (!found) throw new Error('Credenziali non valide');
  // nel mondo reale qui riceveresti un JWT dal server
  return { email: found.email };
}

export async function requestPasswordReset(email) {
  await delay(300);
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const exists = users.find(u => u.email === email);
  if (!exists) throw new Error('Email non trovata');

  const token = cryptoRandom();
  const tokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}');
  tokens[token] = { email, exp: Date.now() + 15 * 60 * 1000 }; // 15 min
  localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(tokens));
  return token; // in un vero sistema verrebbe inviato via email
}

export async function resetPassword(token, newPassword) {
  await delay(300);
  const tokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}');
  const item = tokens[token];
  if (!item) throw new Error('Token non valido');
  if (Date.now() > item.exp) throw new Error('Token scaduto');

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const idx = users.findIndex(u => u.email === item.email);
  if (idx === -1) throw new Error('Utente non trovato');
  users[idx].password = newPassword;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  delete tokens[token];
  localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(tokens));
  return true;
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function cryptoRandom() {
  // stringa casuale “tipo token”
  const arr = new Uint8Array(16);
  (window.crypto || window.msCrypto).getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}
