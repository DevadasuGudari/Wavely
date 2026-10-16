# 🎵 WAVELY — Spotify-Inspired Music Website

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Frontend-Only-1ED760?style=for-the-badge" alt="Frontend Only">
</p>

<p align="center"><strong>Spotify-inspired frontend clone with skeleton loading &amp; live search — HTML, CSS, Bootstrap, vanilla JS.</strong></p>

> ⚠️ Educational practice project. Not affiliated with Spotify AB. **No audio plays**: the player is a visual simulation.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📱 Responsive layout | Bootstrap 5 grid, collapsing navbar, mobile player bar |
| 🦴 Skeleton loading | Shimmer placeholders for ~1.5 s before content appears |
| 🔎 Live search | Filters songs, artists and playlists as you type (Esc clears) |
| 🎧 Simulated player | Play/pause, next/previous, shuffle, repeat, seek and a running timer, with no sound |
| ❤️ Liked songs | Heart any song; saved in `localStorage` |
| 👤 Follow artists | Follow/unfollow with a saved list |
| 🎭 Genre browsing | Genre tiles and chips filter the song list |
| 📚 Your library | Tabs for liked songs, recently played, following and playlists |
| 🔐 Auth UI | Login and signup with Bootstrap form validation (no real auth) |
| 💳 Plans section | Free / Individual / Family demo cards |

## 📄 Pages

| File | Description |
|---|---|
| `index.html` | Hero, popular songs, top artists, playlists, new releases, plans |
| `browse.html` | Genre tiles and the full song table |
| `artists.html` | Artist grid with follow buttons |
| `library.html` | Liked songs, recent plays, following, playlists |
| `login.html` / `signup.html` | Validated forms that store a demo user locally |

## 📂 Structure

```text
wavely/
├── index.html  browse.html  artists.html  library.html
├── login.html  signup.html
├── style.css    → all custom styling
└── script.js    → data, rendering, skeletons, search, likes, simulated player
```

The navbar, footer and player are injected by `script.js`, so they are defined once and shared by every page. All songs, artists and playlists live in arrays at the top of `script.js`.

## 🚀 Run locally

No build step. Open `index.html` in a browser, or run a local server:

```bash
python3 -m http.server 8000
```

## ⚠️ Known limitations

- No real audio, backend or authentication.
- Data is hardcoded; likes, follows and the demo login are stored only in this browser.
- Cover images come from [Lorem Picsum](https://picsum.photos/) and need an internet connection.

## 🔮 Future improvements

Real audio playback, a music API, user playlists, artist and album detail pages, and a backend with a database.

## 👨‍💻 Author

**Gudari Devadasu** — B.Tech Computer Science & Engineering Graduate, aspiring Full Stack Developer.

---

<p align="center"><strong>🎵 WAVELY</strong> — Browse • Discover • Listen (in your imagination)</p>
