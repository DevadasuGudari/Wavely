/* WAVELY shared script
   Data, page rendering, skeleton loading, live search, likes/follows,
   and a SIMULATED player (a timer drives the progress bar; no audio plays). */

/* ---------- Data ---------- */
const img = (s, n) => `https://picsum.photos/seed/${s.replace(/\W/g, '')}/${n}/${n}`;

const GENRES = [["Pop", "#e8115b"], ["Hip-Hop", "#8d67ab"], ["Rock", "#e13300"], ["Electronic", "#1e3264"],
["Chill", "#477d95"], ["Jazz", "#af2896"], ["Indie", "#509bf5"], ["Classical", "#608108"]];

const SONGS = [
  ["Midnight Drive", "Nova Kane", "Electronic", 214], ["Neon Rain", "Lumen", "Pop", 187],
  ["Paper Moon", "Ivy Rowe", "Indie", 203], ["Afterglow", "The Hollows", "Rock", 241],
  ["Redline", "Static Bloom", "Rock", 196], ["Harbor Lights", "Mira Vale", "Chill", 228],
  ["Dead Reckoning", "Kite & Co", "Hip-Hop", 175], ["Slow Orbit", "Juno Park", "Chill", 252],
  ["Velvet Hours", "Sable Quartet", "Jazz", 263], ["Glass Garden", "Ivy Rowe", "Indie", 190],
  ["Wire & Wonder", "Lumen", "Electronic", 208], ["Clair de Nuit", "Elena Moreau", "Classical", 279],
  ["City Lights Hum", "Nova Kane", "Pop", 181], ["Low Tide", "Mira Vale", "Chill", 234],
  ["Backroads", "The Hollows", "Rock", 219], ["Night Shift", "Kite & Co", "Hip-Hop", 192]
].map(([title, artist, genre, dur], id) => ({ id, title, artist, genre, dur, cover: img(title, 400) }));

const ARTISTS = [["Nova Kane", "Electronic", 482], ["Lumen", "Pop", 1260], ["Ivy Rowe", "Indie", 310],
["The Hollows", "Rock", 905], ["Static Bloom", "Rock", 274], ["Mira Vale", "Chill", 668],
["Kite & Co", "Hip-Hop", 1530], ["Juno Park", "Chill", 198], ["Sable Quartet", "Jazz", 142],
["Elena Moreau", "Classical", 356]].map(([name, genre, f], id) => ({ id, name, genre, f, img: img(name, 400) }));

const PLAYLISTS = [
  ["Late Night Drive", "Synths and slow beats for empty roads", [0, 10, 7, 5]],
  ["Focus Flow", "Calm tracks to get work done", [5, 7, 13, 11]],
  ["Indie Mornings", "Soft guitars to start the day", [2, 9, 3]],
  ["Rock Essentials", "Loud, live and unforgettable", [3, 4, 14]],
  ["Hip-Hop Heat", "Fresh bars and heavy bass", [6, 15, 12]],
  ["Jazz & Wine", "Dinner music for slow evenings", [8, 11, 13]]
].map(([name, desc, ids], i) => ({ i, name, desc, ids, cover: img(name, 400) }));

/* ---------- State ---------- */
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('wv_' + k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem('wv_' + k, JSON.stringify(v))
};
const S = {
  q: '', genre: 'All', queue: null, t: 0, playing: false, shuffle: false, repeat: false,
  liked: store.get('liked', []), follow: store.get('follow', []),
  recent: store.get('recent', []), now: store.get('now', null)
};
let timer;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const page = document.body.dataset.page;
const user = store.get('user', null);

/* ---------- Templates ---------- */
const COL = 'col-6 col-md-4 col-lg-3 col-xl-2';
const heart = (id) => `<button class="icon-btn heart ${S.liked.includes(id) ? 'on' : ''}" data-like="${id}" aria-label="Like song">&#9829;</button>`;
const key = (...a) => a.join(' ').toLowerCase();

const card = (s) => `<div class="${COL}" data-q="${key(s.title, s.artist, s.genre)}" data-genre="${s.genre}">
  <article class="song-card ${S.now === s.id ? 'playing' : ''}" data-play="${s.id}">
    <div class="cover"><img src="${s.cover}" alt="${s.title} cover" loading="lazy">
      <button class="play-fab" aria-label="Play ${s.title}">&#9654;</button>${heart(s.id)}</div>
    <h3>${s.title}</h3><p>${s.artist}</p></article></div>`;

const row = (s, i) => `<tr class="${S.now === s.id ? 'playing' : ''}" data-play="${s.id}" data-q="${key(s.title, s.artist, s.genre)}" data-genre="${s.genre}">
  <td class="num">${i + 1}</td>
  <td><div class="d-flex align-items-center gap-3"><img src="${s.cover}" alt="" loading="lazy">
    <div><div class="t">${s.title}</div><small>${s.artist}</small></div></div></td>
  <td class="d-none d-md-table-cell text-secondary">${s.genre}</td>
  <td class="text-end text-nowrap">${heart(s.id)} <span class="dur">${fmt(s.dur)}</span></td></tr>`;

const artistCard = (a) => {
  const f = S.follow.includes(a.id);
  return `<div class="${COL}" data-q="${key(a.name, a.genre)}">
  <article class="artist-card"><img src="${a.img}" alt="${a.name}" loading="lazy">
    <h3>${a.name}</h3><p>${a.genre} &bull; ${a.f}K followers</p>
    <button class="btn btn-sm rounded-pill px-3 ${f ? 'btn-light' : 'btn-outline-light'}" data-follow="${a.id}">${f ? 'Following' : 'Follow'}</button>
  </article></div>`;
};

const playlistCard = (p) => `<div class="${COL}" data-q="${key(p.name, p.desc)}">
  <article class="song-card" data-play="${p.ids[0]}" data-pl="${p.i}">
    <div class="cover"><img src="${p.cover}" alt="${p.name} cover" loading="lazy"><button class="play-fab" aria-label="Play ${p.name}">&#9654;</button></div>
    <h3>${p.name}</h3><p>${p.desc}</p></article></div>`;

const tile = ([g, c]) => `<div class="col-6 col-md-4 col-lg-3"><button class="genre-tile" style="--c:${c}" data-genre-btn="${g}">
  <span>${g}</span><small>${SONGS.filter((s) => s.genre === g).length} songs</small></button></div>`;

const empty = (msg, cols = 4) => `<tr><td colspan="${cols}" class="empty-state">${msg}</td></tr>`;
const byIds = (ids) => ids.map((id) => SONGS[id]);

const R = {
  chips: () => ['All', ...GENRES.map((g) => g[0])].map((g) => `<button class="chip ${S.genre === g ? 'active' : ''}" data-genre-btn="${g}">${g}</button>`).join(''),
  songs: () => SONGS.map(card).join(''),
  new: () => SONGS.slice(-8).reverse().map(row).join(''),
  all: () => SONGS.map(row).join(''),
  artists: () => ARTISTS.map(artistCard).join(''),
  playlists: () => PLAYLISTS.map(playlistCard).join(''),
  genres: () => GENRES.map(tile).join(''),
  liked: () => S.liked.length ? byIds(S.liked).map(row).join('') : empty('No liked songs yet. Tap the heart on any song to save it.'),
  recent: () => S.recent.length ? byIds(S.recent).map(row).join('') : empty('Nothing played yet. Press play on a song to start your history.'),
  following: () => S.follow.length ? ARTISTS.filter((a) => S.follow.includes(a.id)).map(artistCard).join('') : '<p class="empty-state col-12">You are not following anyone yet. Visit the Artists page to find someone.</p>'
};

const SK = {
  card: `<div class="${COL}"><div class="sk sk-card"></div></div>`,
  tile: '<div class="col-6 col-md-4 col-lg-3"><div class="sk sk-tile"></div></div>',
  row: '<tr><td colspan="4"><div class="sk sk-row"></div></td></tr>'
};

/* ---------- Rendering, skeleton loading, live search ---------- */
function renderAll() {
  $$('[data-render]').forEach((el) => { el.innerHTML = R[el.dataset.render]?.() ?? ''; });
  applyFilters();
}

function boot() {
  $$('[data-render]').forEach((el) => {
    el.innerHTML = el.hasAttribute('data-instant')
      ? R[el.dataset.render]()
      : Array(+el.dataset.skel || 6).fill(SK[el.dataset.kind || 'card']).join('');
  });
  setTimeout(renderAll, 1500); // simulated loading time
}

function applyFilters() {
  let shown = 0, total = 0;
  $$('[data-q]').forEach((el) => {
    const scoped = el.closest('[data-genre-scope]');
    const ok = (!S.q || el.dataset.q.includes(S.q)) && (!scoped || S.genre === 'All' || el.dataset.genre === S.genre);
    el.classList.toggle('d-none', !ok);
    total++; if (ok) shown++;
  });
  $$('[data-block]').forEach((sec) => {
    const items = $$('[data-q]', sec);
    sec.classList.toggle('d-none', !!S.q && items.length > 0 && items.every((i) => i.classList.contains('d-none')));
  });
  let b = $('#empty');
  if (S.q && total && !shown) {
    if (!b) {
      b = document.createElement('div');
      b.id = 'empty';
      b.className = 'container text-center text-secondary py-5';
      b.innerHTML = '<p class="h5 mb-1">No matches for &ldquo;<b></b>&rdquo;</p><p>Try a different song, artist or genre.</p>';
      $('main').prepend(b);
    }
    $('b', b).textContent = S.q;
  } else if (b) b.remove();
}

/* ---------- Likes, follows, toast ---------- */
function toast(msg) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1800);
}

function like(id) {
  const on = !S.liked.includes(id);
  S.liked = on ? [...S.liked, id] : S.liked.filter((x) => x !== id);
  store.set('liked', S.liked);
  toast(on ? 'Added to Liked songs' : 'Removed from Liked songs');
  renderAll(); ui();
}

function follow(id) {
  const on = !S.follow.includes(id);
  S.follow = on ? [...S.follow, id] : S.follow.filter((x) => x !== id);
  store.set('follow', S.follow);
  toast(on ? `Following ${ARTISTS[id].name}` : `Unfollowed ${ARTISTS[id].name}`);
  renderAll();
}

/* ---------- Simulated player (no audio) ---------- */
const allIds = () => SONGS.map((s) => s.id);

function play(id, queue) {
  S.queue = queue || (S.queue && S.queue.includes(id) ? S.queue : allIds());
  S.now = id; S.t = 0;
  S.recent = [id, ...S.recent.filter((x) => x !== id)].slice(0, 12);
  store.set('recent', S.recent); store.set('now', id);
  resume();
}

function resume() {
  clearInterval(timer);
  S.playing = true;
  timer = setInterval(tick, 1000);
  ui(); renderAll();
}

function pause() { clearInterval(timer); S.playing = false; ui(); }
const toggle = () => (S.now === null ? play(0) : S.playing ? pause() : resume());

function tick() {
  if (++S.t >= SONGS[S.now].dur) { if (S.repeat) S.t = 0; else return step(1); }
  ui();
}

function step(d) {
  const q = S.queue || allIds();
  const next = S.shuffle ? q[Math.floor(Math.random() * q.length)] : q[(q.indexOf(S.now) + d + q.length) % q.length];
  play(next, q);
}

function ui() {
  if (!$('#player')) return;
  const s = SONGS[S.now];
  $('#pTitle').textContent = s ? s.title : 'Nothing playing';
  $('#pArtist').textContent = s ? s.artist : 'Choose a song to start';
  $('#pCover').hidden = !s;
  if (s) $('#pCover').src = s.cover;
  $('#pHeart').innerHTML = s ? heart(s.id) : '';
  $('#pPlay').innerHTML = S.playing ? ICON.pause : ICON.play;
  $('#seek').value = s ? (S.t / s.dur) * 100 : 0;
  $('#tNow').textContent = fmt(S.t);
  $('#tEnd').textContent = fmt(s ? s.dur : 0);
  $('#pShuf').classList.toggle('on', S.shuffle);
  $('#pRep').classList.toggle('on', S.repeat);
}

/* ---------- Page chrome (navbar, footer, player) ---------- */
const ICON = {
  play: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M4 2.5v11l9-5.5z"/></svg>',
  pause: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M4 2h3v12H4zM9 2h3v12H9z"/></svg>',
  prev: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3 2h2v12H3zM14 2v12L5.5 8z"/></svg>',
  next: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11 2h2v12h-2zM2 2l8.5 6L2 14z"/></svg>',
  shuffle: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 4h3c3 0 4 8 7 8h3M1 12h3c1 0 1.8-1 2.6-2.3M10 5c.5-.6 1-1 2-1h2M12 2l2 2-2 2M12 10l2 2-2 2"/></svg>',
  repeat: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 7V6a2 2 0 0 1 2-2h8l-2-2M14 9v1a2 2 0 0 1-2 2H4l2 2"/></svg>',
  vol: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 6h3l4-3v10l-4-3H2zM11 5.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" fill-opacity="1"/></svg>'
};

function chrome() {
  const links = [['home', 'index.html', 'Home'], ['browse', 'browse.html', 'Browse'], ['artists', 'artists.html', 'Artists'], ['library', 'library.html', 'Your library']]
    .map(([p, h, t]) => `<li class="nav-item"><a class="nav-link ${page === p ? 'active' : ''}" href="./${h}">${t}</a></li>`).join('');
  const auth = user
    ? `<span class="small text-secondary">Hi, ${user.name.split(' ')[0]}</span><button class="btn btn-sm btn-outline-light rounded-pill px-3" id="logout">Log out</button>`
    : '<a href="./login.html" class="btn btn-sm btn-outline-light rounded-pill px-3">Log in</a><a href="./signup.html" class="btn btn-sm btn-accent px-3">Sign up</a>';

  const nav = $('#app-nav');
  if (nav) nav.outerHTML = `<nav class="navbar navbar-expand-lg navbar-dark fixed-top wv-nav"><div class="container-fluid px-3 px-lg-4">
    <a class="navbar-brand wv-brand" href="./index.html">WAVELY</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#wvMenu" aria-label="Toggle menu"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="wvMenu">
      <ul class="navbar-nav me-auto gap-lg-2">${links}</ul>
      <input id="search" type="search" class="form-control wv-search me-lg-3 my-2 my-lg-0" placeholder="Search songs, artists, playlists" aria-label="Search">
      <div class="d-flex align-items-center gap-2">${auth}</div>
    </div></div></nav>`;

  const foot = $('#app-footer');
  if (foot) foot.outerHTML = `<footer class="wv-footer"><div class="container-fluid px-3 px-lg-5"><div class="row gy-4">
    <div class="col-lg-4"><a class="wv-brand fs-4" href="./index.html">WAVELY</a><p class="mt-2 text-secondary small col-lg-9">Music for every mood. A frontend practice project built with HTML, CSS, Bootstrap and JavaScript.</p></div>
    <div class="col-6 col-lg-2"><h4>Explore</h4><a href="./index.html">Home</a><a href="./browse.html">Browse</a><a href="./artists.html">Artists</a></div>
    <div class="col-6 col-lg-2"><h4>Account</h4><a href="./library.html">Your library</a><a href="./login.html">Log in</a><a href="./signup.html">Sign up</a></div>
    <div class="col-6 col-lg-2"><h4>Company</h4><a href="#">About</a><a href="#">Jobs</a><a href="#">Press</a></div>
    <div class="col-6 col-lg-2"><h4>Help</h4><a href="#">Support</a><a href="#">Privacy</a><a href="#">Terms</a></div>
  </div><p class="mt-5 mb-0 pt-3 border-top small text-secondary">Not affiliated with Spotify AB. Playback is simulated and no audio plays. &copy; 2026 WAVELY.</p></div></footer>`;

  const pl = $('#app-player');
  if (pl) pl.outerHTML = `<div class="player" id="player">
    <div class="pl-now"><img id="pCover" alt="" hidden><div class="min-w-0"><div id="pTitle" class="t text-truncate"></div><small id="pArtist" class="text-secondary text-truncate d-block"></small></div><span id="pHeart"></span></div>
    <div class="pl-mid"><div class="pl-btns">
      <button id="pShuf" class="icon-btn d-none d-sm-inline-flex" aria-label="Shuffle">${ICON.shuffle}</button>
      <button id="pPrev" class="icon-btn" aria-label="Previous">${ICON.prev}</button>
      <button id="pPlay" class="main" aria-label="Play or pause">${ICON.play}</button>
      <button id="pNext" class="icon-btn" aria-label="Next">${ICON.next}</button>
      <button id="pRep" class="icon-btn d-none d-sm-inline-flex" aria-label="Repeat">${ICON.repeat}</button></div>
      <div class="pl-time d-none d-md-flex"><span id="tNow">0:00</span><input id="seek" type="range" min="0" max="100" value="0" aria-label="Seek"><span id="tEnd">0:00</span></div></div>
    <div class="pl-vol d-none d-lg-flex"><span class="text-secondary">${ICON.vol}</span><input id="vol" type="range" min="0" max="100" value="70" aria-label="Volume"></div>
  </div><div id="toast" class="wv-toast" role="status"></div>`;
}

/* ---------- Events ---------- */
function bind() {
  document.addEventListener('click', (e) => {
    let b;
    if ((b = e.target.closest('[data-like]'))) return like(+b.dataset.like);
    if ((b = e.target.closest('[data-follow]'))) return follow(+b.dataset.follow);
    if ((b = e.target.closest('[data-genre-btn]'))) {
      S.genre = b.dataset.genreBtn; renderAll();
      if (page === 'browse') $('#songs-title')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if ((b = e.target.closest('[data-play]'))) {
      const id = +b.dataset.play, pl = b.dataset.pl;
      if (id === S.now && pl === undefined) toggle(); else play(id, pl !== undefined ? PLAYLISTS[pl].ids : undefined);
    }
    if (e.target.closest('#logout')) { store.set('user', null); location.reload(); }
  });

  $('#search')?.addEventListener('input', (e) => { S.q = e.target.value.trim().toLowerCase(); applyFilters(); });
  $('#search')?.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.target.value = ''; S.q = ''; applyFilters(); } });

  if (!$('#player')) return;
  $('#pPlay').onclick = toggle;
  $('#pNext').onclick = () => (S.now === null ? play(0) : step(1));
  $('#pPrev').onclick = () => (S.now === null ? play(0) : S.t > 3 ? (S.t = 0, ui()) : step(-1));
  $('#pShuf').onclick = () => { S.shuffle = !S.shuffle; ui(); };
  $('#pRep').onclick = () => { S.repeat = !S.repeat; ui(); };
  $('#seek').oninput = (e) => { if (S.now !== null) { S.t = (e.target.value / 100) * SONGS[S.now].dur; ui(); } };
}

/* ---------- Login / signup forms (no real auth) ---------- */
function initAuth() {
  const form = $('form[data-auth]'); if (!form) return;
  const pw = $('#password', form), cp = $('#confirm-password', form);
  const sync = () => cp && cp.setCustomValidity(cp.value === pw.value ? '' : 'mismatch');
  form.addEventListener('input', sync);
  form.addEventListener('submit', (e) => {
    e.preventDefault(); sync();
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;
    const email = $('#email', form).value;
    store.set('user', { name: $('#name', form)?.value || email.split('@')[0] });
    location.href = './index.html';
  });
}

/* ---------- Start ---------- */
chrome();
bind();
initAuth();
ui();
boot();
