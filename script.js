/* WAVELY shared script
   Songs from 20 languages are fetched from the iTunes Search API (Deezer as a backup).
   Both give free 30-second previews and need no API key.
   Also handles rendering, skeleton loading, live search, likes/follows and the audio player. */

/* ---------- Languages: [name, color, search term, iTunes country] ---------- */
const LANGS = [
  ["Hindi", "#e8115b", "bollywood hits", "IN"], ["Telugu", "#af2896", "telugu hits", "IN"],
  ["Tamil", "#e13300", "tamil hits", "IN"], ["Malayalam", "#1e3264", "malayalam hits", "IN"],
  ["Kannada", "#8d67ab", "kannada hits", "IN"], ["Punjabi", "#477d95", "punjabi hits", "IN"],
  ["Bengali", "#509bf5", "bengali songs", "IN"], ["Marathi", "#608108", "marathi songs", "IN"],
  ["English", "#0d73ec", "top hits", "US"], ["Spanish", "#c2410c", "reggaeton", "MX"],
  ["Portuguese", "#0f766e", "brazilian hits", "BR"], ["French", "#7c3aed", "chanson francaise", "FR"],
  ["German", "#b45309", "deutsch pop", "DE"], ["Italian", "#be123c", "italian pop", "IT"],
  ["Korean", "#db2777", "k-pop", "KR"], ["Japanese", "#4f46e5", "j-pop", "JP"],
  ["Chinese", "#b91c1c", "mandopop", "TW"], ["Arabic", "#15803d", "arabic pop", "AE"],
  ["Turkish", "#0369a1", "turkish pop", "TR"], ["Russian", "#6d28d9", "russian pop", "RU"]
];
const PL_DEFS = [
  ["Bollywood Hits", "Hindi chart-toppers and dance numbers", "Hindi"],
  ["Telugu Hits", "Tollywood favorites", "Telugu"],
  ["Tamil Hits", "Kollywood favorites", "Tamil"],
  ["English Top Hits", "Pop, rock and more", "English"],
  ["Latin Heat", "Spanish and Latin beats", "Spanish"],
  ["K-Pop Wave", "Korean pop essentials", "Korean"]
];

let SONGS = [], MIX = [], ARTISTS = [], PLAYLISTS = [];
const BY = {}, ARB = {};

function build(list) {
  SONGS = list;
  list.forEach((s) => { BY[s.id] = s; });
  // MIX = songs from all languages interleaved, so the first few cards show every language
  const groups = LANGS.map(([n]) => list.filter((s) => s.lang === n));
  MIX = [];
  for (let i = 0; i < Math.max(...groups.map((g) => g.length)); i++) groups.forEach((g) => g[i] && MIX.push(g[i]));
  const map = new Map();
  MIX.forEach((s) => {
    if (!map.has(s.artistId)) map.set(s.artistId, { id: s.artistId, name: s.artist, lang: s.lang, n: 0, img: s.cover });
    map.get(s.artistId).n++;
  });
  ARTISTS = [...map.values()];
  ARTISTS.forEach((a) => { ARB[a.id] = a; });
  PLAYLISTS = PL_DEFS.map(([name, desc, lang], i) => {
    const ids = list.filter((s) => s.lang === lang).slice(0, 10).map((s) => s.id);
    return { i, name, desc, ids, cover: ids.length ? BY[ids[0]].cover : '' };
  }).filter((p) => p.ids.length);
}

/* ---------- API calls ---------- */
const fromItunes = async ([lang, , term, cc]) => {
  const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${cc}&media=music&entity=song&limit=8`);
  if (!r.ok) throw new Error('iTunes error');
  const j = await r.json();
  return j.results.filter((t) => t.previewUrl).map((t) => ({
    id: String(t.trackId), title: t.trackName, artist: t.artistName, artistId: String(t.artistId), lang,
    genre: t.primaryGenreName, dur: Math.round(t.trackTimeMillis / 1000), preview: t.previewUrl,
    cover: t.artworkUrl100.replace('100x100', '400x400')
  }));
};

const jsonp = (url) => new Promise((res, rej) => {
  const cb = 'wv' + Math.random().toString(36).slice(2), tag = document.createElement('script');
  const done = () => { tag.remove(); delete window[cb]; };
  window[cb] = (d) => { res(d); done(); };
  tag.onerror = () => { rej(new Error('jsonp')); done(); };
  tag.src = `${url}&output=jsonp&callback=${cb}`;
  document.head.append(tag);
  setTimeout(() => rej(new Error('timeout')), 8000);
});

const fromDeezer = async ([lang, , term]) => {
  const j = await jsonp(`https://api.deezer.com/search?q=${encodeURIComponent(term)}&limit=8`);
  return (j.data || []).filter((t) => t.preview).map((t) => ({
    id: 'dz' + t.id, title: t.title, artist: t.artist.name, artistId: 'dz' + t.artist.id, lang,
    genre: 'Music', dur: t.duration, preview: t.preview, cover: t.album.cover_big || t.album.cover_medium
  }));
};

const fetchLang = async (l) => {
  try { const r = await fromItunes(l); if (r.length) return r; } catch { /* try the backup API */ }
  try { return await fromDeezer(l); } catch { return []; }
};

const CACHE = 'wv_data_v3';
async function loadData() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE));
    if (c && Date.now() - c.t < 12 * 3600e3) return build(c.list);
  } catch { /* no cache */ }
  const all = (await Promise.all(LANGS.map(fetchLang))).flat();
  const seen = new Set();
  const list = all.filter((s) => !seen.has(s.id) && seen.add(s.id));
  if (!list.length) throw new Error('No songs');
  try { localStorage.setItem(CACHE, JSON.stringify({ t: Date.now(), list })); } catch { /* storage full */ }
  build(list);
}

/* ---------- State ---------- */
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('wv_' + k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem('wv_' + k, JSON.stringify(v))
};
const S = {
  q: '', lang: 'All', queue: null, t: 0, playing: false, shuffle: false, repeat: false,
  liked: store.get('liked', []).map(String), follow: store.get('follow', []).map(String),
  recent: store.get('recent', []).map(String), now: store.get('now', null) === null ? null : String(store.get('now', null))
};
const audio = new Audio();
audio.volume = 0.7;
audio.preload = 'auto';
let fails = 0;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const page = document.body.dataset.page;
const user = store.get('user', null);

/* ---------- Templates ---------- */
const COL = 'col-6 col-md-4 col-lg-3 col-xl-2';
const heart = (id) => `<button class="icon-btn heart ${S.liked.includes(id) ? 'on' : ''}" data-like="${id}" aria-label="Like song">&#9829;</button>`;
const key = (...a) => a.join(' ').toLowerCase().replace(/"/g, '');
const esc = (t) => String(t).replace(/"/g, '&quot;');

const card = (s) => `<div class="${COL}" data-q="${key(s.title, s.artist, s.lang, s.genre)}" data-lang="${s.lang}">
  <article class="song-card ${S.now === s.id ? 'playing' : ''}" data-play="${s.id}">
    <div class="cover"><img src="${s.cover}" alt="${esc(s.title)} cover" loading="lazy">
      <button class="play-fab" aria-label="Play ${esc(s.title)}">&#9654;</button>${heart(s.id)}</div>
    <h3>${s.title}</h3><p>${s.artist}</p></article></div>`;

const row = (s, i) => `<tr class="${S.now === s.id ? 'playing' : ''}" data-play="${s.id}" data-q="${key(s.title, s.artist, s.lang, s.genre)}" data-lang="${s.lang}">
  <td class="num">${i + 1}</td>
  <td><div class="d-flex align-items-center gap-3"><img src="${s.cover}" alt="" loading="lazy">
    <div><div class="t">${s.title}</div><small>${s.artist}</small></div></div></td>
  <td class="d-none d-md-table-cell text-secondary">${s.lang}</td>
  <td class="text-end text-nowrap">${heart(s.id)} <span class="dur">${fmt(s.dur)}</span></td></tr>`;

const artistCard = (a) => {
  const f = S.follow.includes(a.id);
  return `<div class="${COL}" data-q="${key(a.name, a.lang)}" data-lang="${a.lang}">
  <article class="artist-card"><img src="${a.img}" alt="${esc(a.name)}" loading="lazy">
    <h3>${a.name}</h3><p>${a.lang} &bull; ${a.n} song${a.n > 1 ? 's' : ''}</p>
    <button class="btn btn-sm rounded-pill px-3 ${f ? 'btn-light' : 'btn-outline-light'}" data-follow="${a.id}">${f ? 'Following' : 'Follow'}</button>
  </article></div>`;
};

const playlistCard = (p) => `<div class="${COL}" data-q="${key(p.name, p.desc)}">
  <article class="song-card" data-play="${p.ids[0]}" data-pl="${p.i}">
    <div class="cover"><img src="${p.cover}" alt="${esc(p.name)} cover" loading="lazy"><button class="play-fab" aria-label="Play ${esc(p.name)}">&#9654;</button></div>
    <h3>${p.name}</h3><p>${p.desc}</p></article></div>`;

const tile = ([g, c]) => `<div class="col-6 col-md-4 col-lg-3"><button class="genre-tile" style="--c:${c}" data-lang-btn="${g}">
  <span>${g}</span><small>${SONGS.filter((s) => s.lang === g).length} songs</small></button></div>`;

const empty = (msg, cols = 4) => `<tr><td colspan="${cols}" class="empty-state">${msg}</td></tr>`;
const byIds = (ids) => ids.map((id) => BY[id]).filter(Boolean);
const filtering = () => S.q || S.lang !== 'All';

const R = {
  chips: () => ['All', ...LANGS.map((l) => l[0])].map((g) => `<button class="chip ${S.lang === g ? 'active' : ''}" data-lang-btn="${g}">${g}</button>`).join(''),
  songs: () => (filtering() ? SONGS : MIX.slice(0, 24)).map(card).join(''),
  new: () => MIX.slice(24, 32).map(row).join(''),
  all: () => SONGS.map(row).join(''),
  artists: () => ARTISTS.map(artistCard).join(''),
  artistsTop: () => (S.q ? ARTISTS : ARTISTS.slice(0, 12)).map(artistCard).join(''),
  playlists: () => PLAYLISTS.map(playlistCard).join(''),
  genres: () => LANGS.filter(([n]) => SONGS.some((s) => s.lang === n)).map(tile).join(''),
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

function showError() {
  const msg = 'Could not load songs. Check your internet connection. <button class="btn btn-accent btn-sm ms-2" data-retry>Try again</button>';
  $$('[data-render]:not([data-instant])').forEach((el) => {
    el.innerHTML = el.tagName === 'TBODY' ? empty(msg) : `<p class="empty-state col-12">${msg}</p>`;
  });
}

async function boot() {
  $$('[data-render]').forEach((el) => {
    el.innerHTML = el.hasAttribute('data-instant')
      ? R[el.dataset.render]()
      : Array(+el.dataset.skel || 6).fill(SK[el.dataset.kind || 'card']).join('');
  });
  try { await loadData(); } catch { return showError(); }
  if (S.now !== null && !BY[S.now]) S.now = null;
  renderAll(); hero(); ui();
}

function hero() {
  const s = MIX[0], card = $('#heroCard');
  if (!card || !s) return;
  card.dataset.play = s.id; $('#heroPlay').dataset.play = s.id;
  $('#heroImg').src = s.cover; $('#heroImg').alt = `${s.title} cover`;
  $('#heroTitle').textContent = s.title; $('#heroArtist').textContent = s.artist;
}

function applyFilters() {
  let shown = 0, total = 0;
  $$('[data-q]').forEach((el) => {
    const scoped = el.closest('[data-lang-scope]');
    const ok = (!S.q || el.dataset.q.includes(S.q)) && (!scoped || S.lang === 'All' || el.dataset.lang === S.lang);
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
      b.innerHTML = '<p class="h5 mb-1">No matches for &ldquo;<b></b>&rdquo;</p><p>Try a different song, artist or language.</p>';
      $('main').prepend(b);
    }
    $('b', b).textContent = S.q;
  } else if (b) b.remove();
}

/* ---------- Likes, follows, toast ---------- */
function toast(msg) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2500);
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
  toast(on ? `Following ${ARB[id].name}` : `Unfollowed ${ARB[id].name}`);
  renderAll();
}

/* ---------- Audio player ---------- */
const allIds = () => SONGS.map((s) => s.id);

function play(id, queue) {
  const s = BY[id]; if (!s) return;
  S.queue = queue || (S.queue && S.queue.includes(id) ? S.queue : allIds());
  S.now = id; S.t = 0;
  S.recent = [id, ...S.recent.filter((x) => x !== id)].slice(0, 12);
  store.set('recent', S.recent); store.set('now', id);
  audio.src = s.preview;
  audio.loop = S.repeat;
  audio.play().catch((err) => {
    if (err.name === 'NotAllowedError') toast('Your browser blocked autoplay. Press the play button.');
  });
  ui(); renderAll();
}

const toggle = () => {
  if (S.now === null || !BY[S.now]) return play(allIds()[0]);
  if (!audio.src) return play(S.now);
  audio.paused ? audio.play().catch(() => { }) : audio.pause();
};

function step(d) {
  const q = (S.queue || allIds()).filter((id) => BY[id]);
  if (!q.length) return;
  const next = S.shuffle ? q[Math.floor(Math.random() * q.length)] : q[(q.indexOf(S.now) + d + q.length) % q.length];
  play(next, q);
}

audio.onplay = () => { S.playing = true; ui(); };
audio.onpause = () => { S.playing = false; ui(); };
audio.onplaying = () => { fails = 0; };
audio.onended = () => step(1);
audio.ontimeupdate = () => { S.t = audio.currentTime; ui(); };
audio.onloadedmetadata = () => ui();
audio.onerror = () => {
  if (!audio.getAttribute('src')) return;
  console.error('Audio error', audio.error, audio.src);
  if (++fails < 4) { toast('That preview could not play. Trying the next song...'); step(1); }
  else toast('Audio is not available. Check your connection or ad blocker.');
};

function ui() {
  if (!$('#player')) return;
  const s = BY[S.now], d = audio.duration || 0;
  $('#pTitle').textContent = s ? s.title : 'Nothing playing';
  $('#pArtist').textContent = s ? s.artist : 'Choose a song to start';
  $('#pCover').hidden = !s;
  if (s) $('#pCover').src = s.cover;
  $('#pHeart').innerHTML = s ? heart(s.id) : '';
  $('#pPlay').innerHTML = S.playing ? ICON.pause : ICON.play;
  $('#seek').value = s && d ? (S.t / d) * 100 : 0;
  $('#tNow').textContent = fmt(S.t);
  $('#tEnd').textContent = fmt(d);
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
      <input id="search" type="search" class="form-control wv-search me-lg-3 my-2 my-lg-0" placeholder="Search songs, artists, languages" aria-label="Search">
      <div class="d-flex align-items-center gap-2">${auth}</div>
    </div></div></nav>`;

  const foot = $('#app-footer');
  if (foot) foot.outerHTML = `<footer class="wv-footer"><div class="container-fluid px-3 px-lg-5"><div class="row gy-4">
    <div class="col-lg-4"><a class="wv-brand fs-4" href="./index.html">WAVELY</a><p class="mt-2 text-secondary small col-lg-9">Music for every mood, in every language. A frontend practice project built with HTML, CSS, Bootstrap and JavaScript.</p></div>
    <div class="col-6 col-lg-2"><h4>Explore</h4><a href="./index.html">Home</a><a href="./browse.html">Browse</a><a href="./artists.html">Artists</a></div>
    <div class="col-6 col-lg-2"><h4>Account</h4><a href="./library.html">Your library</a><a href="./login.html">Log in</a><a href="./signup.html">Sign up</a></div>
    <div class="col-6 col-lg-2"><h4>Company</h4><a href="#">About</a><a href="#">Jobs</a><a href="#">Press</a></div>
    <div class="col-6 col-lg-2"><h4>Help</h4><a href="#">Support</a><a href="#">Privacy</a><a href="#">Terms</a></div>
  </div><p class="mt-5 mb-0 pt-3 border-top small text-secondary">Songs and 30-second previews come from the iTunes Search API and Deezer API. Not affiliated with Spotify AB. &copy; 2026 WAVELY.</p></div></footer>`;

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
    if (e.target.closest('[data-retry]')) return boot();
    if ((b = e.target.closest('[data-like]'))) return like(b.dataset.like);
    if ((b = e.target.closest('[data-follow]'))) return follow(b.dataset.follow);
    if ((b = e.target.closest('[data-lang-btn]'))) {
      S.lang = b.dataset.langBtn; renderAll();
      if (page === 'browse') $('#songs-title')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if ((b = e.target.closest('[data-play]'))) {
      const id = b.dataset.play, pl = b.dataset.pl;
      if (!BY[id]) return;
      if (id === S.now && pl === undefined) toggle(); else play(id, pl !== undefined ? PLAYLISTS[pl].ids : undefined);
    }
    if (e.target.closest('#logout')) { store.set('user', null); location.reload(); }
  });

  const search = $('#search');
  search?.addEventListener('input', (e) => { S.q = e.target.value.trim().toLowerCase(); renderAll(); });
  search?.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.target.value = ''; S.q = ''; renderAll(); } });

  if (!$('#player')) return;
  $('#pPlay').onclick = toggle;
  $('#pNext').onclick = () => (S.now === null ? toggle() : step(1));
  $('#pPrev').onclick = () => (S.now === null ? toggle() : audio.currentTime > 3 ? (audio.currentTime = 0) : step(-1));
  $('#pShuf').onclick = () => { S.shuffle = !S.shuffle; ui(); };
  $('#pRep').onclick = () => { S.repeat = !S.repeat; audio.loop = S.repeat; ui(); };
  $('#seek').oninput = (e) => { if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration; };
  $('#vol').oninput = (e) => { audio.volume = e.target.value / 100; };
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
