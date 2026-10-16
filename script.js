const songs = [
  ["Midnight Drive", "Nova Kane"], ["Neon Rain", "Lumen"], ["Paper Moon", "Ivy Rowe"], ["Afterglow", "The Hollows"],
  ["Redline", "Static Bloom"], ["Harbor Lights", "Mira Vale"], ["Dead Reckoning", "Kite & Co"], ["Slow Orbit", "Juno Park"]
].map(([title, artist], i) => ({
  id: i, title, artist,
  cover: `https://picsum.photos/seed/${title.replace(/\W/g, '')}/400/400`,
  src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`
}));

const $ = (id) => document.getElementById(id);
const audio = $('audio'), list = $('songs');
let liked = JSON.parse(localStorage.getItem('liked') || '[]');
let current = -1;

function render(q = '') {
  const only = list.dataset.liked;
  const shown = songs.filter(s => (!only || liked.includes(s.id)) &&
    (s.title + s.artist).toLowerCase().includes(q.toLowerCase()));
  list.innerHTML = shown.length ? shown.map(s => `
    <div class="col-6 col-md-4 col-lg-3 col-xl-2">
      <div class="song ${s.id === current ? 'playing' : ''}" onclick="play(${s.id})">
        <img src="${s.cover}" alt="${s.title} cover" loading="lazy">
        <button class="like ${liked.includes(s.id) ? 'on' : ''}" onclick="toggleLike(event, ${s.id})">&#9829;</button>
        <b class="d-block mt-2">${s.title}</b><small>${s.artist}</small>
      </div>
    </div>`).join('') : '<p class="text-secondary">Nothing here yet. Tap the heart on a song to add it.</p>';
}

function play(id) {
  current = id;
  const s = songs[id];
  audio.src = s.src; audio.play();
  $('pTitle').textContent = s.title; $('pArtist').textContent = s.artist; $('pCover').src = s.cover;
  render($('search').value);
}

function toggleLike(e, id) {
  e.stopPropagation();
  liked = liked.includes(id) ? liked.filter(x => x !== id) : [...liked, id];
  localStorage.setItem('liked', JSON.stringify(liked));
  render($('search').value);
}

$('play').onclick = () => current < 0 ? play(0) : (audio.paused ? audio.play() : audio.pause());
$('next').onclick = () => play((current + 1) % songs.length);
$('prev').onclick = () => play((current - 1 + songs.length) % songs.length);
$('search').oninput = (e) => render(e.target.value);
$('bar').oninput = (e) => audio.currentTime = (e.target.value / 100) * audio.duration;
audio.ontimeupdate = () => $('bar').value = (audio.currentTime / audio.duration) * 100 || 0;
audio.onplay = () => $('play').innerHTML = '&#10074;&#10074;';
audio.onpause = () => $('play').innerHTML = '&#9654;';
audio.onended = () => $('next').click();

render();
