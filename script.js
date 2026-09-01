/* =========================================================
   WirelessLearn — script.js
   ========================================================= */
(function(){
'use strict';

/* ---------------------------------------------------------
   Shared data
--------------------------------------------------------- */
const NETWORKS = {
  wpan: {
    name: 'WPAN',
    full: 'Wireless Personal Area Network',
    range: '± 10 meter (sangat dekat)',
    tech: 'Bluetooth, Zigbee',
    usage: 'Menghubungkan perangkat pribadi: headset, smartwatch, keyboard/mouse wireless, sensor IoT.',
    hub: { emoji:'📱', label:'Smartphone' },
    devices: [
      { emoji:'🎧', label:'Earbuds', desc:'Earbuds terhubung ke smartphone melalui Bluetooth untuk memutar audio tanpa kabel.', x:22, y:70 },
      { emoji:'⌚', label:'Smartwatch', desc:'Smartwatch dapat menerima notifikasi dari smartphone melalui koneksi Bluetooth.', x:78, y:70 },
      { emoji:'⌨️', label:'Keyboard Wireless', desc:'Keyboard wireless memakai Bluetooth/RF untuk mengirim ketikan ke perangkat lain.', x:50, y:88 }
    ],
    coverageScale: 0.32
  },
  wlan: {
    name: 'WLAN',
    full: 'Wireless Local Area Network',
    range: '< 100 meter (area lokal)',
    tech: 'Wi-Fi',
    usage: 'Menghubungkan perangkat dalam rumah, sekolah, kantor, atau gedung melalui access point.',
    hub: { emoji:'📡', label:'Access Point' },
    devices: [
      { emoji:'💻', label:'Laptop Guru', desc:'Access Point berfungsi menyediakan koneksi wireless kepada perangkat di sekitarnya, seperti laptop guru.', x:18, y:75 },
      { emoji:'📱', label:'Smartphone Siswa', desc:'Smartphone dapat terhubung ke WLAN melalui Wi-Fi untuk mengakses internet sekolah.', x:50, y:88 },
      { emoji:'💻', label:'Laptop Siswa', desc:'Laptop siswa terhubung ke access point yang sama untuk mengakses e-learning.', x:82, y:75 }
    ],
    coverageScale: 0.55
  },
  wman: {
    name: 'WMAN',
    full: 'Wireless Metropolitan Area Network',
    range: '< 50 km (area kota)',
    tech: 'WiMAX, Broadband Wireless',
    usage: 'Menghubungkan beberapa gedung dan lokasi berbeda dalam satu wilayah kota.',
    hub: { emoji:'📡', label:'Tower WMAN' },
    devices: [
      { emoji:'🏢', label:'Gedung Kantor', desc:'Gedung kantor terhubung ke tower WMAN untuk akses internet broadband wireless.', x:15, y:30 },
      { emoji:'🏫', label:'Sekolah', desc:'Sekolah di kota yang sama dapat memakai jaringan WMAN yang sama untuk konektivitas.', x:85, y:30 },
      { emoji:'🏥', label:'Rumah Sakit', desc:'Rumah sakit memakai WMAN untuk menghubungkan sistem informasi antar cabang di kota.', x:50, y:88 }
    ],
    coverageScale: 0.8
  },
  wwan: {
    name: 'WWAN',
    full: 'Wireless Wide Area Network',
    range: 'Nasional – Global',
    tech: '4G, 5G, Jaringan Seluler, Satelit',
    usage: 'Menghubungkan pengguna lintas kota bahkan negara melalui BTS dan satelit.',
    hub: { emoji:'📡', label:'BTS' },
    devices: [
      { emoji:'🛰️', label:'Satelit', desc:'Satelit membantu menjangkau area yang tidak terjangkau oleh BTS darat, termasuk wilayah terpencil.', x:50, y:15 },
      { emoji:'🌍', label:'Kota A', desc:'Pengguna di Kota A terhubung ke jaringan seluler 4G/5G melalui BTS terdekat.', x:16, y:80 },
      { emoji:'🌍', label:'Kota B', desc:'Pengguna di Kota B tetap dapat terhubung ke jaringan yang sama meski berjarak sangat jauh.', x:84, y:80 }
    ],
    coverageScale: 1
  }
};

const STORAGE_KEY = 'wirelessLearnProgress';

function loadProgress(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){ /* ignore corrupt data */ }
  return { materi:{}, quizScore:null, quizCategory:null, gameScore:null };
}
function saveProgress(p){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }catch(e){ /* storage unavailable */ }
}
let progress = loadProgress();

const MATERI_LABELS = [
  { key:'pengantar', label:'Pengantar' },
  { key:'wpan', label:'WPAN' },
  { key:'wlan', label:'WLAN' },
  { key:'wman', label:'WMAN' },
  { key:'wwan', label:'WWAN' }
];
function renderProgressDash(){
  const list = document.getElementById('progressMateri');
  if(list){
    list.innerHTML = '';
    MATERI_LABELS.forEach(m => {
      const done = !!progress.materi[m.key];
      const li = document.createElement('li');
      li.className = done ? 'is-done' : '';
      li.innerHTML = `<i class="fa-solid ${done ? 'fa-circle-check' : 'fa-circle'}"></i> ${m.label}`;
      list.appendChild(li);
    });
  }
  const quizScoreEl = document.getElementById('progressQuizScore');
  if(quizScoreEl){
    quizScoreEl.textContent = progress.quizScore != null ? `${progress.quizScore} (${progress.quizCategory})` : 'Belum dikerjakan';
  }
  const gameScoreEl = document.getElementById('progressGameScore');
  if(gameScoreEl){
    gameScoreEl.textContent = progress.gameScore != null ? progress.gameScore : 'Belum dimainkan';
  }
}

function markMateri(key){
  progress.materi[key] = true;
  saveProgress(progress);
  renderProgressDash();
}

/* ---------------------------------------------------------
   Sound effects (tiny WebAudio beeps, no external files)
--------------------------------------------------------- */
const Sound = (function(){
  let enabled = false;
  let ctx = null;
  function ensureCtx(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(AC) ctx = new AC();
    }
    return ctx;
  }
  function tone(freq, duration, type){
    if(!enabled) return;
    const c = ensureCtx();
    if(!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  }
  return {
    setEnabled(v){ enabled = v; if(v) ensureCtx(); },
    isEnabled(){ return enabled; },
    success(){ tone(880,.12); setTimeout(()=>tone(1180,.15),90); },
    error(){ tone(180,.25,'sawtooth'); }
  };
})();

/* ---------------------------------------------------------
   Navbar / hamburger / smooth nav / scroll spy
--------------------------------------------------------- */
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  hamburger.classList.toggle('is-open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('[data-nav]').forEach(el => {
  el.addEventListener('click', (e) => {
    const scrollTarget = el.getAttribute('data-scroll-target');
    const href = el.getAttribute('href');
    let targetId = scrollTarget || (href && href.startsWith('#') ? href.slice(1) : null);
    if(targetId){
      e.preventDefault();
      const target = document.getElementById(targetId);
      if(target){
        target.scrollIntoView({ behavior:'smooth', block:'start' });
      }
      const preset = el.getAttribute('data-preset');
      if(preset){
        setTimeout(() => setSimTab(preset), 350);
      }
    }
    navLinks.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded','false');
  });
});

const sectionIds = ['beranda','materi','simulasi','game','quiz','tentang'];
const navAnchors = Array.from(document.querySelectorAll('.nav-links a[data-nav]'));
function updateScrollSpy(){
  let current = sectionIds[0];
  const scrollPos = window.scrollY + 140;
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if(el && el.offsetTop <= scrollPos) current = id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
  });
}

/* ---------------------------------------------------------
   Scroll progress bar + back to top + navbar shadow
--------------------------------------------------------- */
const scrollFill = document.getElementById('scrollProgressFill');
const backToTop = document.getElementById('backToTop');

function onScroll(){
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;
  const pct = height > 0 ? (scrollTop / height) * 100 : 0;
  scrollFill.style.width = pct + '%';
  backToTop.classList.toggle('is-visible', scrollTop > 500);
  navbar.style.boxShadow = scrollTop > 10 ? '0 8px 24px -16px rgba(0,0,0,.6)' : 'none';
  updateScrollSpy();
}
document.addEventListener('scroll', onScroll, { passive:true });
backToTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

/* ---------------------------------------------------------
   Sound toggle
--------------------------------------------------------- */
const soundToggle = document.getElementById('soundToggle');
soundToggle.addEventListener('click', () => {
  const next = !Sound.isEnabled();
  Sound.setEnabled(next);
  soundToggle.setAttribute('aria-pressed', String(next));
  soundToggle.innerHTML = next ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
});

/* ---------------------------------------------------------
   Reveal on scroll (IntersectionObserver)
--------------------------------------------------------- */
const revealItems = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.12 });
  revealItems.forEach(el => io.observe(el));
}else{
  revealItems.forEach(el => el.classList.add('is-visible'));
}

/* ---------------------------------------------------------
   Klasifikasi cards -> scroll to detail section
--------------------------------------------------------- */
document.querySelectorAll('.class-card').forEach(card => {
  card.addEventListener('click', () => {
    const target = card.getAttribute('data-target');
    const el = document.getElementById(target);
    if(el) el.scrollIntoView({ behavior:'smooth', block:'start' });
    markMateri(target);
  });
});

/* mark materi visited when detail sections come into view */
['wpan','wlan','wman','wwan'].forEach(id => {
  const el = document.getElementById(id);
  if(el && 'IntersectionObserver' in window){
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) markMateri(id); });
    }, { threshold:0.4 });
    obs.observe(el);
  }
});
{
  const introEl = document.getElementById('materi');
  if(introEl && 'IntersectionObserver' in window){
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) markMateri('pengantar'); });
    }, { threshold:0.4 });
    obs.observe(introEl);
  }
}

/* ---------------------------------------------------------
   Compare rings (Visual Perbandingan Jangkauan)
--------------------------------------------------------- */
const rings = document.querySelectorAll('.ring');
const compareInfo = document.getElementById('compareInfo');
const RING_INFO = {
  wpan: { title:'WPAN — Personal Area', body:'Contoh: Smartphone ↔ Earbuds ↔ Smartwatch. Jaringan pribadi dengan jangkauan sangat dekat.' },
  wlan: { title:'WLAN — Local Area', body:'Contoh: Laptop ↔ Access Point ↔ Smartphone dalam satu rumah/sekolah/gedung.' },
  wman: { title:'WMAN — Metropolitan Area', body:'Contoh: Beberapa gedung dan area dalam satu kota saling terhubung.' },
  wwan: { title:'WWAN — Wide Area', body:'Contoh: Beberapa kota/negara terhubung melalui jaringan seluler dan satelit.' }
};
rings.forEach(ring => {
  ring.addEventListener('click', () => {
    const key = ring.getAttribute('data-ring');
    rings.forEach(r => r.classList.remove('is-active'));
    ring.classList.add('is-active');
    const info = RING_INFO[key];
    compareInfo.innerHTML = `<h4>${info.title}</h4><p>${info.body}</p>`;
  });
});

/* ---------------------------------------------------------
   Simulator
--------------------------------------------------------- */
const simTabs = document.querySelectorAll('.sim-tab');
const simCoverage = document.getElementById('simCoverage');
const simDevices = document.getElementById('simDevices');
const simPanelTitle = document.getElementById('simPanelTitle');
const simPanelList = document.getElementById('simPanelList');
const deviceTooltip = document.getElementById('deviceTooltip');

function setSimTab(key){
  const data = NETWORKS[key];
  if(!data) return;
  simTabs.forEach(t => {
    const active = t.getAttribute('data-sim') === key;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', String(active));
  });

  simCoverage.classList.remove('is-active');
  void simCoverage.offsetWidth; // restart animation
  simCoverage.style.width = (data.coverageScale * 100) + '%';
  simCoverage.style.height = (data.coverageScale * 100) + '%';
  requestAnimationFrame(() => simCoverage.classList.add('is-active'));

  simDevices.innerHTML = '';
  const hub = document.createElement('button');
  hub.className = 'sim-device sim-device--hub';
  hub.style.left = '50%'; hub.style.top = '50%';
  hub.style.animationDelay = '0s';
  hub.textContent = data.hub.emoji;
  hub.setAttribute('aria-label', data.hub.label);
  hub.addEventListener('click', () => showTooltip(`${data.hub.label} adalah pusat jaringan ${data.name} pada simulasi ini.`));
  simDevices.appendChild(hub);

  data.devices.forEach((d, i) => {
    const btn = document.createElement('button');
    btn.className = 'sim-device';
    btn.style.left = d.x + '%';
    btn.style.top = d.y + '%';
    btn.style.animationDelay = (0.1 + i * 0.08) + 's';
    btn.textContent = d.emoji;
    btn.setAttribute('aria-label', d.label);
    btn.addEventListener('click', () => showTooltip(d.desc));
    simDevices.appendChild(btn);
  });

  simPanelTitle.textContent = `${data.name} — ${data.full}`;
  simPanelList.innerHTML = `
    <dt>Area Jangkauan</dt><dd>${data.range}</dd>
    <dt>Contoh Teknologi</dt><dd>${data.tech}</dd>
    <dt>Contoh Penggunaan</dt><dd>${data.usage}</dd>
  `;
  deviceTooltip.textContent = '';
  markMateri('simulasi-' + key);
}
function showTooltip(text){
  deviceTooltip.textContent = text;
}
simTabs.forEach(tab => tab.addEventListener('click', () => setSimTab(tab.getAttribute('data-sim'))));
setSimTab('wpan');

/* ---------------------------------------------------------
   Flashcards
--------------------------------------------------------- */
const flashGrid = document.getElementById('flashGrid');
const FLASH_DATA = [
  { key:'WPAN', back:'Wireless Personal Area Network. Jaringan untuk perangkat pribadi dengan jangkauan dekat. Contoh: Bluetooth dan Zigbee.' },
  { key:'WLAN', back:'Wireless Local Area Network. Jaringan untuk area lokal seperti rumah/sekolah/kantor. Contoh: Wi-Fi.' },
  { key:'WMAN', back:'Wireless Metropolitan Area Network. Jaringan untuk area satu kota. Contoh: WiMAX, Broadband Wireless.' },
  { key:'WWAN', back:'Wireless Wide Area Network. Jaringan dengan cakupan nasional–global. Contoh: 4G, 5G, satelit.' }
];
FLASH_DATA.forEach(item => {
  const card = document.createElement('div');
  card.className = 'flash-card';
  card.tabIndex = 0;
  card.setAttribute('role','button');
  card.setAttribute('aria-label', `Kartu ${item.key}, klik untuk membalik`);
  card.innerHTML = `
    <div class="flash-card__inner">
      <div class="flash-card__face flash-card__face--front">${item.key}</div>
      <div class="flash-card__face flash-card__face--back"><span>${item.back}</span></div>
    </div>`;
  function flip(){ card.classList.toggle('is-flipped'); }
  card.addEventListener('click', flip);
  card.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); } });
  flashGrid.appendChild(card);
});

/* ---------------------------------------------------------
   Drag & drop game
--------------------------------------------------------- */
const DND_ITEMS = [
  { id:'bluetooth', label:'Bluetooth', answer:'WPAN' },
  { id:'wifi', label:'Wi-Fi', answer:'WLAN' },
  { id:'wimax', label:'WiMAX', answer:'WMAN' },
  { id:'4g', label:'4G', answer:'WWAN' },
  { id:'5g', label:'5G', answer:'WWAN' },
  { id:'zigbee', label:'Zigbee', answer:'WPAN' },
  { id:'satelit', label:'Satelit', answer:'WWAN' }
];
const dndItemsEl = document.getElementById('dndItems');
const dndTargetsEl = document.getElementById('dndTargets');
const dndScoreEl = document.getElementById('dndScore');
const dndResetBtn = document.getElementById('dndReset');
let dndScore = 0;
let dndSelectedId = null;

function buildDnd(){
  dndItemsEl.innerHTML = '';
  dndScore = 0;
  dndSelectedId = null;
  dndScoreEl.textContent = `Skor: 0 / ${DND_ITEMS.length}`;

  DND_ITEMS.forEach(item => {
    const el = document.createElement('div');
    el.className = 'dnd-item';
    el.textContent = item.label;
    el.draggable = true;
    el.tabIndex = 0;
    el.dataset.id = item.id;
    el.setAttribute('role','button');
    el.setAttribute('aria-label', `${item.label}, pilih lalu ketuk kategori tujuan`);

    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.id);
      el.classList.add('is-dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('is-dragging'));

    // touch/click fallback: select then tap target
    el.addEventListener('click', () => {
      document.querySelectorAll('.dnd-item').forEach(i => i.classList.remove('is-selected'));
      if(dndSelectedId === item.id){
        dndSelectedId = null;
      }else{
        dndSelectedId = item.id;
        el.classList.add('is-selected');
      }
    });
    el.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); el.click(); } });

    dndItemsEl.appendChild(el);
  });

  dndTargetsEl.innerHTML = '';
  ['WPAN','WLAN','WMAN','WWAN'].forEach(cat => {
    const target = document.createElement('div');
    target.className = 'dnd-target';
    target.dataset.cat = cat;
    target.innerHTML = `<span class="dnd-target__label">${cat}</span><div class="dnd-target__items"></div>`;

    target.addEventListener('dragover', (e) => { e.preventDefault(); target.classList.add('is-over'); });
    target.addEventListener('dragleave', () => target.classList.remove('is-over'));
    target.addEventListener('drop', (e) => {
      e.preventDefault();
      target.classList.remove('is-over');
      const id = e.dataTransfer.getData('text/plain');
      placeDndItem(id, cat, target);
    });
    target.addEventListener('click', () => {
      if(dndSelectedId){
        placeDndItem(dndSelectedId, cat, target);
        dndSelectedId = null;
        document.querySelectorAll('.dnd-item').forEach(i => i.classList.remove('is-selected'));
      }
    });

    dndTargetsEl.appendChild(target);
  });
}

function placeDndItem(id, cat, targetEl){
  const item = DND_ITEMS.find(i => i.id === id);
  const itemEl = dndItemsEl.querySelector(`[data-id="${id}"]`);
  if(!item || !itemEl || itemEl.classList.contains('is-placed')) return;

  const correct = item.answer === cat;
  const tag = document.createElement('span');
  tag.textContent = item.label + (correct ? ' ✓' : ' ✕');
  if(!correct) tag.classList.add('is-wrong');
  targetEl.querySelector('.dnd-target__items').appendChild(tag);

  itemEl.classList.add('is-placed');

  if(correct){
    dndScore++;
    Sound.success();
  }else{
    Sound.error();
  }
  dndScoreEl.textContent = `Skor: ${dndScore} / ${DND_ITEMS.length}`;

  if(dndScore === DND_ITEMS.length || dndItemsEl.querySelectorAll('.dnd-item:not(.is-placed)').length === 0){
    progress.gameScore = `${dndScore}/${DND_ITEMS.length}`;
    saveProgress(progress);
    renderProgressDash();
    markMateri('game');
  }
}

dndResetBtn.addEventListener('click', buildDnd);
buildDnd();

/* ---------------------------------------------------------
   Mini game: Siapa Aku? (Tebak Jaringan)
--------------------------------------------------------- */
const GUESS_ROUNDS = [
  { clues:['Saya digunakan untuk jaringan pribadi.','Jangkauan saya sangat dekat.','Bluetooth merupakan salah satu contoh saya.'], answer:'WPAN' },
  { clues:['Saya sering ditemukan di rumah dan sekolah.','Saya memakai access point.','Wi-Fi adalah teknologi utama saya.'], answer:'WLAN' },
  { clues:['Jangkauan saya mencakup satu kota.','Saya menghubungkan beberapa gedung.','WiMAX adalah salah satu contoh teknologi saya.'], answer:'WMAN' },
  { clues:['Jangkauan saya sangat luas.','Saya bisa mencakup satu negara bahkan dunia.','4G, 5G, dan satelit adalah bagian dari saya.'], answer:'WWAN' }
];
const guessClueEl = document.getElementById('guessClue');
const guessStartBtn = document.getElementById('guessStart');
const guessOptionsEl = document.getElementById('guessOptions');
const guessFeedbackEl = document.getElementById('guessFeedback');
let guessRound = null;
let guessClueIndex = 0;

function startGuessGame(){
  guessRound = GUESS_ROUNDS[Math.floor(Math.random() * GUESS_ROUNDS.length)];
  guessClueIndex = 0;
  guessFeedbackEl.textContent = '';
  guessOptionsEl.hidden = false;
  guessStartBtn.textContent = 'Petunjuk Berikutnya';
  showNextClue();
}
function showNextClue(){
  if(guessClueIndex < guessRound.clues.length){
    guessClueEl.textContent = `Clue ${guessClueIndex + 1}: "${guessRound.clues[guessClueIndex]}"`;
    guessClueIndex++;
  }
  if(guessClueIndex >= guessRound.clues.length){
    guessStartBtn.disabled = true;
  }
}
guessStartBtn.addEventListener('click', () => {
  if(!guessRound){ startGuessGame(); }
  else{ showNextClue(); }
});
guessOptionsEl.querySelectorAll('[data-guess]').forEach(btn => {
  btn.addEventListener('click', () => {
    if(!guessRound) return;
    const correct = btn.getAttribute('data-guess') === guessRound.answer;
    const cluesUsed = guessClueIndex;
    if(correct){
      const score = Math.max(10, (GUESS_ROUNDS[0].clues.length - cluesUsed + 1) * 10);
      guessFeedbackEl.textContent = `Benar! Jawabannya ${guessRound.answer}. Skor: ${score} (memakai ${cluesUsed} petunjuk).`;
      guessFeedbackEl.style.color = 'var(--success)';
      Sound.success();
    }else{
      guessFeedbackEl.textContent = `Belum tepat. Jawaban yang benar adalah ${guessRound.answer}.`;
      guessFeedbackEl.style.color = 'var(--danger)';
      Sound.error();
    }
    guessStartBtn.disabled = false;
    guessStartBtn.textContent = 'Main Lagi';
    guessRound = null;
  });
});

/* ---------------------------------------------------------
   Studi Kasus
--------------------------------------------------------- */
const CASES = [
  { scenario:'Rina menghubungkan smartphone dengan smartwatch menggunakan Bluetooth.', answer:'WPAN' },
  { scenario:'Sebuah sekolah menggunakan beberapa access point untuk menyediakan koneksi Wi-Fi kepada siswa.', answer:'WLAN' },
  { scenario:'Sebuah operator menyediakan koneksi wireless untuk pengguna di berbagai kota.', answer:'WWAN' },
  { scenario:'Sebuah jaringan wireless digunakan untuk menghubungkan beberapa wilayah dalam satu kota.', answer:'WMAN' }
];
let caseIndex = 0;
const caseScenarioEl = document.getElementById('caseScenario');
const caseOptionsEl = document.getElementById('caseOptions');
const caseFeedbackEl = document.getElementById('caseFeedback');
const caseProgressText = document.getElementById('caseProgressText');
const caseNextBtn = document.getElementById('caseNext');

function renderCase(){
  const c = CASES[caseIndex];
  caseProgressText.textContent = `Kasus ${caseIndex + 1} dari ${CASES.length}`;
  caseScenarioEl.textContent = c.scenario;
  caseFeedbackEl.textContent = '';
  caseNextBtn.hidden = true;
  caseOptionsEl.innerHTML = '';
  ['WPAN','WLAN','WMAN','WWAN'].forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.addEventListener('click', () => answerCase(opt, btn));
    caseOptionsEl.appendChild(btn);
  });
}
function answerCase(choice, btnEl){
  const c = CASES[caseIndex];
  const correct = choice === c.answer;
  Array.from(caseOptionsEl.children).forEach(b => {
    b.disabled = true;
    if(b.textContent === c.answer) b.classList.add('is-correct');
    else if(b === btnEl) b.classList.add('is-wrong');
  });
  caseFeedbackEl.style.color = correct ? 'var(--success)' : 'var(--danger)';
  caseFeedbackEl.textContent = correct ? 'Benar! Analisismu tepat.' : `Belum tepat. Jawaban yang benar: ${c.answer}.`;
  correct ? Sound.success() : Sound.error();
  caseNextBtn.hidden = false;
  markMateri('studikasus');
}
caseNextBtn.addEventListener('click', () => {
  caseIndex = (caseIndex + 1) % CASES.length;
  renderCase();
});
renderCase();

/* ---------------------------------------------------------
   Quiz
--------------------------------------------------------- */
const QUIZ_QUESTIONS = [
  { q:'Jaringan nirkabel adalah jaringan yang memungkinkan perangkat berkomunikasi tanpa menggunakan...', options:['Sinyal radio','Kabel fisik sebagai media transmisi utama','Daya listrik','Perangkat lunak'], answer:1 },
  { q:'Teknologi yang umum digunakan untuk menghubungkan smartphone dengan headset dalam jarak dekat adalah...', options:['WiMAX','Bluetooth','5G','Satelit'], answer:1 },
  { q:'WPAN adalah singkatan dari...', options:['Wireless Public Area Network','Wireless Personal Area Network','Wired Personal Access Network','Wireless Private Access Node'], answer:1 },
  { q:'Jangkauan WPAN pada materi ini digambarkan sekitar...', options:['± 10 meter','< 100 meter','< 50 km','Nasional–global'], answer:0 },
  { q:'Contoh teknologi yang termasuk kategori WPAN adalah...', options:['Wi-Fi dan WiMAX','Bluetooth dan Zigbee','4G dan 5G','Satelit dan BTS'], answer:1 },
  { q:'WLAN paling umum digunakan untuk menghubungkan perangkat di...', options:['Satu negara','Satu benua','Rumah, sekolah, atau gedung','Antar planet'], answer:2 },
  { q:'Teknologi utama yang digunakan pada WLAN adalah...', options:['Wi-Fi','Zigbee','WiMAX','Satelit'], answer:0 },
  { q:'WMAN memiliki cakupan area seluas...', options:['Beberapa meter','Satu ruangan','Satu wilayah kota/metropolitan','Seluruh dunia'], answer:2 },
  { q:'Contoh teknologi yang termasuk WMAN adalah...', options:['Bluetooth','WiMAX','Zigbee','NFC'], answer:1 },
  { q:'WWAN memiliki cakupan hingga...', options:['Satu ruangan','Satu gedung','Satu kota saja','Nasional hingga global'], answer:3 },
  { q:'Berikut yang termasuk contoh teknologi WWAN adalah...', options:['4G dan 5G','Bluetooth','Wi-Fi rumah','Zigbee'], answer:0 },
  { q:'Rina menghubungkan smartphone dengan smartwatch menggunakan Bluetooth. Ini termasuk kategori...', options:['WPAN','WLAN','WMAN','WWAN'], answer:0 },
  { q:'Sebuah sekolah menyediakan koneksi Wi-Fi bagi siswa melalui beberapa access point. Ini termasuk kategori...', options:['WPAN','WLAN','WMAN','WWAN'], answer:1 },
  { q:'Manakah urutan jaringan dari jangkauan terkecil ke terbesar yang benar?', options:['WWAN, WMAN, WLAN, WPAN','WPAN, WLAN, WMAN, WWAN','WLAN, WPAN, WWAN, WMAN','WMAN, WWAN, WPAN, WLAN'], answer:1 },
  { q:'Faktor yang dapat memengaruhi jangkauan nyata suatu jaringan nirkabel adalah...', options:['Warna perangkat','Frekuensi, daya pancar, dan kondisi lingkungan','Jumlah aplikasi terpasang','Merek smartphone'], answer:1 }
];

let quizIndex = 0;
let quizScore = 0;
const quizProgressText = document.getElementById('quizProgressText');
const quizProgressFill = document.getElementById('quizProgressFill');
const quizQuestionEl = document.getElementById('quizQuestion');
const quizOptionsEl = document.getElementById('quizOptions');
const quizFeedbackEl = document.getElementById('quizFeedback');
const quizNextBtn = document.getElementById('quizNext');
const quizCard = document.getElementById('quizCard');
const quizResult = document.getElementById('quizResult');
const quizResultScore = document.getElementById('quizResultScore');
const quizResultCategory = document.getElementById('quizResultCategory');
const quizRetryBtn = document.getElementById('quizRetry');

function renderQuiz(){
  quizCard.hidden = false;
  quizResult.hidden = true;
  const total = QUIZ_QUESTIONS.length;
  const q = QUIZ_QUESTIONS[quizIndex];
  quizProgressText.textContent = `Soal ${quizIndex + 1} dari ${total}`;
  quizProgressFill.style.width = ((quizIndex) / total * 100) + '%';
  quizQuestionEl.textContent = `${quizIndex + 1}. ${q.q}`;
  quizFeedbackEl.textContent = '';
  quizNextBtn.hidden = true;
  quizOptionsEl.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
    btn.addEventListener('click', () => answerQuiz(i, btn));
    quizOptionsEl.appendChild(btn);
  });
}
function answerQuiz(choiceIdx, btnEl){
  const q = QUIZ_QUESTIONS[quizIndex];
  const correct = choiceIdx === q.answer;
  Array.from(quizOptionsEl.children).forEach((b, i) => {
    b.disabled = true;
    if(i === q.answer) b.classList.add('is-correct');
    else if(i === choiceIdx) b.classList.add('is-wrong');
  });
  if(correct){
    quizScore += 10;
    quizFeedbackEl.style.color = 'var(--success)';
    quizFeedbackEl.textContent = 'Benar!';
    Sound.success();
  }else{
    quizFeedbackEl.style.color = 'var(--danger)';
    quizFeedbackEl.textContent = `Kurang tepat. Jawaban benar: ${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}`;
    Sound.error();
  }
  quizNextBtn.hidden = false;
  quizNextBtn.textContent = quizIndex === QUIZ_QUESTIONS.length - 1 ? 'Lihat Hasil' : 'Lanjut';
}
quizNextBtn.addEventListener('click', () => {
  if(quizIndex < QUIZ_QUESTIONS.length - 1){
    quizIndex++;
    renderQuiz();
  }else{
    finishQuiz();
  }
});
function finishQuiz(){
  quizCard.hidden = true;
  quizResult.hidden = false;
  quizProgressFill.style.width = '100%';
  const max = QUIZ_QUESTIONS.length * 10;
  const finalScore = Math.round((quizScore / max) * 100);
  let category;
  if(finalScore >= 90) category = 'Sangat Baik';
  else if(finalScore >= 80) category = 'Baik';
  else if(finalScore >= 70) category = 'Cukup';
  else category = 'Perlu Belajar Lagi';
  quizResultScore.textContent = finalScore;
  quizResultCategory.textContent = category;
  progress.quizScore = finalScore;
  progress.quizCategory = category;
  saveProgress(progress);
  renderProgressDash();
  markMateri('quiz');
}
quizRetryBtn.addEventListener('click', () => {
  quizIndex = 0;
  quizScore = 0;
  renderQuiz();
});
renderQuiz();

/* ---------------------------------------------------------
   Progress dashboard — initial paint
   (MATERI_LABELS / renderProgressDash are defined earlier,
   right after markMateri, so they're available from the start)
--------------------------------------------------------- */
renderProgressDash();

/* ---------------------------------------------------------
   Background node canvas (subtle animated network)
--------------------------------------------------------- */
(function initCanvas(){
  const canvas = document.getElementById('nodeCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, nodes = [];
  const reduceMotion = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = Math.min(window.innerHeight * 1.2, 1200);
    const count = Math.min(50, Math.floor((w * h) / 40000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    }));
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if(n.x < 0 || n.x > w) n.vx *= -1;
      if(n.y < 0 || n.y > h) n.vy *= -1;
    });
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 140){
          ctx.strokeStyle = `rgba(53,231,255,${0.12 * (1 - dist/140)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.fillStyle = 'rgba(53,231,255,0.5)';
      ctx.beginPath(); ctx.arc(n.x,n.y,1.6,0,Math.PI*2); ctx.fill();
    });
    if(!reduceMotion) requestAnimationFrame(step);
  }
  window.addEventListener('resize', resize);
  resize();
  step();
})();

/* initial scroll spy paint */
onScroll();

})();
