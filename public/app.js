const API = '';
const COLORS = ['color-0', 'color-1', 'color-2', 'color-3', 'color-4'];
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
    <div class="book-cover ${bookColor(b.id)}">
      <i class="ti ${bookIcon(b.id)} book-cover-icon" aria-hidden="true"></i>
    </div>
    <h4>${b.title}</h4>
    <p class="book-author">${b.author}</p>
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
    allBooks = data.map(b => ({ ...b, cat: b.category ?? 'other' }));
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
    <div class="book-modal-header">
      <div class="book-modal-cover ${bookColor(b.id)}">
        <i class="ti ${bookIcon(b.id)} book-modal-cover-icon" aria-hidden="true"></i>
      </div>
      <div>
        <h2 class="book-modal-title">${b.title}</h2>
        <p class="book-modal-author">${b.author}</p>
        <span class="badge ${b.available ? 'badge-available' : 'badge-unavailable'}">${b.available ? 'Szabad' : 'Kölcsönzött'}</span>
        <p class="book-modal-isbn">ISBN: ${b.isbn}</p>
      </div>
    </div>
    ${canLoan
      ? `<label class="modal-date-label">Visszahozási határidő</label>
         <input type="date" id="dueDateInput" min="${minDate}" class="modal-date-input">
         <div id="loanError" class="form-error"></div>
         <div class="modal-actions">
           <button class="btn" onclick="closeModal('bookModal')">Mégse</button>
           <button class="btn btn-primary" onclick="doLoan(${b.id})">Kölcsönzés</button>
         </div>`
      : !token
        ? `<p class="modal-info-text">Kölcsönzéshez be kell jelentkezni.</p>
           <div class="modal-actions">
             <button class="btn btn-primary" onclick="closeModal('bookModal');openModal('loginModal')">Belépés</button>
           </div>`
        : `<p class="modal-info-text">Ez a könyv jelenleg nem elérhető.</p>
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
    const created = await r.json();
    const b = allBooks.find(x => x.id === bookId);
    b.available = false;
    loans.push({ id: created.id, bookId, title: b.title, dueDate: due });
    renderGrids();
    await loadLoans();
    closeModal('bookModal');
    return;
  } catch {
    // fallback: helyi állapot frissítés
  }
  const b = allBooks.find(x => x.id === bookId);
  b.available = false;
  loans.push({ id: -(Date.now()), bookId, title: b.title, dueDate: due });
  renderGrids();
  renderLoans();
  closeModal('bookModal'); // fallback: no backend call
}

function renderLoans() {
  const lv = document.getElementById('loansContent');
  const sl = document.getElementById('sideLoans');
  if (!token) {
    if (lv) lv.innerHTML = '<p class="loans-empty">Bejelentkezés szükséges.</p>';
    if (sl) sl.innerHTML = '<span class="loans-empty-side">Nincs aktív kölcsönzés.</span>';
    return;
  }
  if (loans.length === 0) {
    if (lv) lv.innerHTML = '<p class="loans-empty">Nincs aktív kölcsönzésed.</p>';
    if (sl) sl.innerHTML = '<span class="loans-empty-side">Nincs aktív kölcsönzés.</span>';
    return;
  }
  if (lv) lv.innerHTML = loans.map(l => `
    <div class="loan-card">
      <div>
        <p class="loan-card-title">${l.title}</p>
        <p class="loan-card-due">Határidő: ${l.dueDate}</p>
      </div>
      <button class="btn btn-return" onclick="doReturn(${l.id}, ${l.bookId})">Visszaadás</button>
    </div>`).join('');
  if (sl) sl.innerHTML = loans.map(l => `
    <div class="loan-item"><p>${l.title}</p><span>${l.dueDate}</span></div>`).join('');
}

async function doReturn(loanId, bookId) {
  try {
    const r = await fetch(`${API}/api/loans/${loanId}/return`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!r.ok) {
      const d = await r.json();
      alert(d.error || 'Hiba történt.');
      return;
    }
  } catch {
    // fallback: helyi állapot frissítés
  }
  loans = loans.filter(l => l.id !== loanId);
  const b = allBooks.find(x => x.id === bookId);
  if (b) b.available = true;
  renderGrids();
  await loadLoans();
}


async function loadLoans() {
  if (!token) { renderLoans(); return; }
  try {
    const r = await fetch(`${API}/api/loans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (r.ok) {
      const data = await r.json();
      loans = data.map(l => ({
        id: l.id,
        bookId: l.bookId,
        title: l.title,
        dueDate: l.dueDate ? l.dueDate.split('T')[0] : ''
      }));
    }
  } catch { /* fallback: meglévő loans tömb marad */ }
  renderLoans();
}

function showView(v) {
  ['homeView', 'booksView', 'loansView', 'aboutView', 'blogView', 'faqView']
    .forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(v + 'View').classList.remove('hidden');
  document.querySelectorAll('nav a').forEach((a, i) => {
    a.classList.remove('active');
    if (['home', 'books', 'loans', 'about', 'blog', 'faq'][i] === v) a.classList.add('active');
  });
  if (v === 'loans') { loadLoans(); }
  document.getElementById('homeSidebar').classList.toggle('hidden', v === 'books');
  document.getElementById('booksSidebar').classList.toggle('hidden', v !== 'books');
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
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('userGreeting').textContent = currentUser;
  document.getElementById('userGreeting').classList.remove('hidden');
  document.getElementById('loginBtn').classList.add('hidden');
  document.getElementById('registerBtn').classList.add('hidden');
  document.getElementById('logoutBtn').classList.remove('hidden');
  closeModal('loginModal');
  await loadLoans();
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
  document.getElementById('userGreeting').classList.add('hidden');
  document.getElementById('loginBtn').classList.remove('hidden');
  document.getElementById('registerBtn').classList.remove('hidden');
  document.getElementById('logoutBtn').classList.add('hidden');
  loadBooks();
  renderLoans();
}

document.getElementById('searchInput').addEventListener('input', renderGrids);
loadBooks();

['loginEmail', 'loginPass'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
});

['regUser', 'regEmail', 'regPass'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') doRegister();
  });
});
