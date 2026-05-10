const API = '';
const COLORS = ['#E1F5EE', '#E6F1FB', '#FAEEDA', '#FBEAF0', '#EAF3DE'];
const ICONS = ['ti-book', 'ti-book-2', 'ti-books', 'ti-notebook', 'ti-file-text'];

let allBooks = [];
let loans = [];
let token = null;
let currentUser = null;
let catFilter = 'all';
let availFilter = null;

function bookColor(id) { return COLORS[id % COLORS.length]; }
function bookIcon(id) { return ICONS[id % ICONS.length]; }

function renderBookCard(b) {
  return `<div class="book-card" onclick="openBook(${b.id})">
    <div class="book-cover" style="background:${bookColor(b.id)}">
      <i class="ti ${bookIcon(b.id)}" style="color:#0F6E56;font-size:32px" aria-hidden="true"></i>
    </div>
    <h4>${b.title}</h4>
    <p style="margin-bottom:6px">${b.author}</p>
    <span class="badge ${b.available ? 'badge-available' : 'badge-unavailable'}">
      ${b.available ? 'Szabad' : 'Kölcsönzött'}
    </span>
  </div>`;
}

function getFiltered() {
  return allBooks.filter(b => {
    if (catFilter !== 'all' && b.cat !== catFilter) return false;
    if (availFilter !== null && b.available !== availFilter) return false;
    const q = document.getElementById('searchInput').value.toLowerCase();
    if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderGrids() {
  const filtered = getFiltered();
  const mainGrid = document.getElementById('mainGrid');
  const homeGrid = document.getElementById('homeGrid');
  const bookCount = document.getElementById('bookCount');
  if (mainGrid) mainGrid.innerHTML = filtered.map(renderBookCard).join('');
  if (bookCount) bookCount.textContent = `(${filtered.length} könyv)`;
  if (homeGrid) homeGrid.innerHTML = allBooks.slice(0, 4).map(renderBookCard).join('');
}

async function loadBooks() {
  try {
    const r = await fetch(`${API}/api/books`);
    if (!r.ok) throw new Error();
    const data = await r.json();
    allBooks = data.map(b => ({ ...b, cat: 'prog' }));
  } catch {
    allBooks = [
      { id: 1, title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', available: true, cat: 'prog' },
      { id: 2, title: 'The Pragmatic Programmer', author: 'David Thomas', isbn: '9780201616224', available: true, cat: 'prog' },
      { id: 3, title: 'Design Patterns', author: 'Gang of Four', isbn: '9780201633610', available: false, cat: 'prog' },
      { id: 4, title: 'The Design of Everyday Things', author: 'Don Norman', isbn: '9780465050659', available: true, cat: 'design' },
      { id: 5, title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', available: true, cat: 'sci' },
      { id: 6, title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', available: false, cat: 'sci' },
      { id: 7, title: '1984', author: 'George Orwell', isbn: '9780451524935', available: true, cat: 'novel' },
      { id: 8, title: 'Dune', author: 'Frank Herbert', isbn: '9780441013593', available: true, cat: 'novel' },
    ];
  }
  renderGrids();
}

function openBook(id) {
  const b = allBooks.find(x => x.id === id);
  const canLoan = token && b.available;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  document.getElementById('bookModalContent').innerHTML = `
    <div style="display:flex;gap:1rem;margin-bottom:1rem">
      <div style="width:80px;height:120px;border-radius:8px;background:${bookColor(b.id)};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="ti ${bookIcon(b.id)}" style="font-size:36px;color:#0F6E56" aria-hidden="true"></i>
      </div>
      <div>
        <h2 style="font-size:18px;font-weight:500;margin-bottom:4px">${b.title}</h2>
        <p style="font-size:13px;color:#666;margin-bottom:8px">${b.author}</p>
        <span class="badge ${b.available ? 'badge-available' : 'badge-unavailable'}">${b.available ? 'Szabad' : 'Kölcsönzött'}</span>
        <p style="font-size:12px;color:#999;margin-top:8px">ISBN: ${b.isbn}</p>
      </div>
    </div>
    ${canLoan
      ? `<label style="font-size:13px;color:#666;display:block;margin-bottom:4px">Visszahozási határidő</label>
         <input type="date" id="dueDateInput" min="${minDate}" style="width:100%;padding:7px 10px;border:0.5px solid rgba(0,0,0,0.2);border-radius:8px;font-size:13px;background:#f5f5f3;color:#1a1a1a">
         <div id="loanError" class="form-error"></div>
         <div class="modal-actions">
           <button class="btn" onclick="closeModal('bookModal')">Mégse</button>
           <button class="btn btn-primary" onclick="doLoan(${b.id})">Kölcsönzés</button>
         </div>`
      : !token
        ? `<p style="font-size:13px;color:#666;margin-top:.5rem">Kölcsönzéshez be kell jelentkezni.</p>
           <div class="modal-actions">
             <button class="btn btn-primary" onclick="closeModal('bookModal');openModal('loginModal')">Belépés</button>
           </div>`
        : `<p style="font-size:13px;color:#666;margin-top:.5rem">Ez a könyv jelenleg nem elérhető.</p>
           <div class="modal-actions">
             <button class="btn" onclick="closeModal('bookModal')">Bezárás</button>
           </div>`
    }`;
  openModal('bookModal');
}

async function doLoan(bookId) {
  const due = document.getElementById('dueDateInput').value;
  const errEl = document.getElementById('loanError');
  if (!due) {
    errEl.style.display = 'block';
    errEl.textContent = 'Adj meg visszahozási határidőt.';
    return;
  }
  try {
    const r = await fetch(`${API}/api/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bookId, dueDate: new Date(due).toISOString() })
    });
    if (!r.ok) {
      const d = await r.json();
      errEl.style.display = 'block';
      errEl.textContent = d.error || 'Hiba történt.';
      return;
    }
  } catch {
    // fallback: helyi állapot frissítés
  }
  const b = allBooks.find(x => x.id === bookId);
  b.available = false;
  loans.push({ bookId, title: b.title, dueDate: due });
  renderGrids();
  renderLoans();
  closeModal('bookModal');
}

function renderLoans() {
  const lv = document.getElementById('loansContent');
  const sl = document.getElementById('sideLoans');
  if (!token) {
    if (lv) lv.innerHTML = '<p style="font-size:13px;color:#666">Bejelentkezés szükséges.</p>';
    if (sl) sl.innerHTML = '<span style="font-size:12px;color:#999">Nincs aktív kölcsönzés.</span>';
    return;
  }

  if (loans.length === 0) {
    if (lv) lv.innerHTML = '<p style="font-size:13px;color:#666">Nincs aktív kölcsönzésed.</p>';
    if (sl) sl.innerHTML = '<span style="font-size:12px;color:#999">Nincs aktív kölcsönzés.</span>';
    return;
  }
  if (lv) lv.innerHTML = loans.map(l => `
    <div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:12px;padding:1rem;margin-bottom:8px">
      <p style="font-weight:500;font-size:14px">${l.title}</p>
      <p style="font-size:12px;color:#666;margin-top:4px">Határidő: ${l.dueDate}</p>
    </div>`).join('');
  if (sl) sl.innerHTML = loans.map(l => `
    <div class="loan-item"><p>${l.title}</p><span>${l.dueDate}</span></div>`).join('');
}

function showView(v) {
  ['homeView', 'booksView', 'loansView', 'aboutView', 'blogView', 'faqView']
    .forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(v + 'View').classList.remove('hidden');
  document.querySelectorAll('nav a').forEach((a, i) => {
    a.classList.remove('active');
    if (['home', 'books', 'loans', 'about', 'blog', 'faq'][i] === v) a.classList.add('active');
  });
  if (v === 'loans') renderLoans();

  document.getElementById('homeSidebar').style.display = ['home', 'loans', 'about', 'blog', 'faq'].includes(v) ? 'block' : 'none';
  document.getElementById('booksSidebar').style.display = v === 'books' ? 'block' : 'none';
}

function filterCat(el, cat) {
  catFilter = cat;
  document.querySelectorAll('.cat-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  renderGrids();
}

function filterAvail(el, val) {
  availFilter = val;
  document.querySelectorAll('.avail-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  renderGrids();
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

async function doLogin() {
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';
  try {
    const r = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const d = await r.json();
    if (!r.ok) {
      errEl.style.display = 'block';
      errEl.textContent = d.error || 'Hibás adatok';
      return;
    }
    token = d.token;
    const payload = JSON.parse(atob(d.token.split('.')[1]));
    currentUser = payload.username;
  } catch {
    token = 'demo_token';
    currentUser = email.split('@')[0];
  }
  document.getElementById('userGreeting').textContent = currentUser;
  document.getElementById('userGreeting').style.display = 'inline';
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('registerBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'inline-block';
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPass').value = '';
  closeModal('loginModal');
  renderLoans();
}

async function doRegister() {
  const username = document.getElementById('regUser').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPass').value;
  const errEl = document.getElementById('regError');
  const sucEl = document.getElementById('regSuccess');
  errEl.style.display = 'none';
  sucEl.style.display = 'none';
  try {
    const r = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const d = await r.json();
    if (!r.ok) {
      errEl.style.display = 'block';
      errEl.textContent = d.error || (d.errors && d.errors[0]?.msg) || 'Hiba történt';
      return;
    }
  } catch { /* fallback */ }
  sucEl.style.display = 'block';
  sucEl.textContent = 'Sikeres regisztráció! Most már bejelentkezhetsz.';
}

function logout() {
  token = null;
  currentUser = null;
  loans = [];
  document.getElementById('userGreeting').style.display = 'none';
  document.getElementById('loginBtn').style.display = 'inline-block';
  document.getElementById('registerBtn').style.display = 'inline-block';
  document.getElementById('logoutBtn').style.display = 'none';
  loadBooks();
  renderLoans();
}

document.getElementById('searchInput').addEventListener('input', renderGrids);
loadBooks();