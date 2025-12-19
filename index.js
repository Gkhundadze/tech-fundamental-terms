
const DATA_URL = 'https://raw.githubusercontent.com/Gkhundadze/tech-fundamental-terms/refs/heads/main/terms.json';

const pad2 = (n) => String(n).padStart(2, '0');

let categories = [];
let termMap = {};
let total = 0;

const counter = document.getElementById('counter');
const view = document.getElementById('view');
const navList = document.getElementById('navList');

const langGeBtn = document.getElementById('langGe');
const langEnBtn = document.getElementById('langEn');
const uiTitle = document.getElementById('uiTitle');
const uiSubtitle = document.getElementById('uiSubtitle');
const uiCategories = document.getElementById('uiCategories');

let i = 0;
let lang = 'ge'; // 'ge' or 'en'

// Restore language from localStorage
const savedLang = localStorage.getItem('tt_lang');
if (savedLang === 'ge' || savedLang === 'en') lang = savedLang;

function setUIText() {
  if (lang === 'ge') {
    uiTitle.textContent = 'ვებ-ფუნდამენტები — ტერმინების ლექსიკონი';
    uiSubtitle.textContent = 'ლექციის გეგმა: ტერმინები კატეგორიებად + 1 წინადადება';
    uiCategories.textContent = 'კატეგორიები';
  } else {
    uiTitle.textContent = 'Web Fundamentals — Term Dictionary';
    uiSubtitle.textContent = 'Lecture guide: terms by category + one sentence';
    uiCategories.textContent = 'Categories';
  }
}

function setLang(next) {
  lang = next;
  localStorage.setItem('tt_lang', lang);

  langGeBtn.classList.toggle('active', lang === 'ge');
  langEnBtn.classList.toggle('active', lang === 'en');

  setUIText();
  render();
}

langGeBtn.addEventListener('click', () => setLang('ge'));
langEnBtn.addEventListener('click', () => setLang('en'));

// Apply saved language state on load
langGeBtn.classList.toggle('active', lang === 'ge');
langEnBtn.classList.toggle('active', lang === 'en');

function buildNav() {
  navList.innerHTML = '';
  categories.forEach((cat, idx) => {
    const btn = document.createElement('button');
    btn.className = 'navbtn' + (idx === 0 ? ' active' : '');
    btn.dataset.i = String(idx);
    btn.textContent = `${pad2(idx + 1)} • ${cat}`;
    btn.addEventListener('click', () => go(idx));
    navList.appendChild(btn);
  });
}

function setActiveButton() {
  const buttons = Array.from(navList.querySelectorAll('.navbtn'));
  buttons.forEach((b) => b.classList.toggle('active', Number(b.dataset.i) === i));
  counter.textContent = `${pad2(i + 1)} / ${pad2(total)}`;
}

function render() {
  setUIText();

  const cat = categories[i];
  const items = (termMap[cat] || []);

  const rows = items.map(x => `
    <div class="row">
      <div class="term">${x.t}</div>
      <div class="def">${lang === 'ge' ? x.ge : x.en}</div>
    </div>
  `).join('');

  view.innerHTML = `
    <div class="kicker">${pad2(i + 1)} • ${cat}</div>
    <h1>${cat}</h1>
    <p>${lang === 'ge'
      ? 'ტერმინი + 1 წინადადება. ენა შეცვალე ზედა მარჯვენა კუთხეში.'
      : 'Term + one sentence. Switch language in the top right.'}</p>

    <div class="toolbar">
      <div style="display:flex; gap:10px">
        <button class="btn" id="prev">⬅</button>
        <button class="btn primary" id="next">➡</button>
      </div>
    </div>

    <div class="list">${rows || `
      <div class="row">
        <div class="term">—</div>
        <div class="def">${lang === 'ge' ? 'კატეგორიაში მონაცემი არ მოიძებნა.' : 'No data found in this category.'}</div>
      </div>
    `}</div>
  `;

  document.getElementById('next').addEventListener('click', () => go(i + 1));
  document.getElementById('prev').addEventListener('click', () => go(i - 1));
}

function go(n) {
  i = (n + total) % total;
  setActiveButton();
  render();
}

document.addEventListener('keydown', (e) => {
  if (['ArrowRight', 'j', 'J'].includes(e.key)) go(i + 1);
  if (['ArrowLeft', 'k', 'K'].includes(e.key)) go(i - 1);
  if (e.key === 'Home') go(0);
  if (e.key === 'End') go(total - 1);
});

async function loadData() {
  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load JSON (${res.status})`);
    const data = await res.json();

    categories = Array.isArray(data.categories) ? data.categories : [];
    termMap = data.termMap && typeof data.termMap === 'object' ? data.termMap : {};
    total = categories.length;

    if (!total) throw new Error('No categories found in JSON');

    buildNav();
    setActiveButton();
    render();
  } catch (err) {
    console.error(err);
    setUIText();
    counter.textContent = '-- / --';
    view.innerHTML = `
      <h1 style="margin:0 0 10px 0;">${lang === 'ge' ? 'ვერ ჩაიტვირთა მონაცემი' : 'Failed to load content'}</h1>
      <p style="margin:0; color: rgba(238,244,255,.78);">
        ${lang === 'ge'
          ? 'შეამოწმე DATA_URL (terms.json ბმული) და გახსენი პროექტი ლოკალურ სერვერზე (file:// არ მუშაობს fetch-თან).'
          : 'Check DATA_URL (terms.json link) and run a local server (fetch does not work reliably on file://).'}
      </p>
    `;
  }
}

loadData();
