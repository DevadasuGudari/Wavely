# 🎵 WAVELY — Spotify-Inspired Music Website

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Frontend-Only-1ED760?style=for-the-badge" alt="Frontend Only">
</p>

<p align="center"><strong>Spotify-inspired frontend clone with skeleton loading &amp; live search — HTML, CSS, Bootstrap, vanilla JS.</strong></p>

> ⚠️ Educational practice project. Not affiliated with Spotify AB. Songs and 30-second previews come from the free iTunes Search and Deezer APIs.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📱 Responsive layout | Bootstrap 5 grid, collapsing navbar, mobile player bar |
| 🦴 Skeleton loading | Shimmer placeholders for ~1.5 s before content appears |
| 🔎 Live search | Filters songs, artists and playlists as you type (Esc clears) |
| 🌐 API songs | Songs, artwork and artists in 20 languages are fetched live from the iTunes Search API, with Deezer as a backup (no keys needed) |
| 🗣️ Language filters | Browse songs and artists by language: Hindi, Telugu, Tamil, Malayalam, Kannada, Punjabi, Bengali, Marathi, English, Spanish, Portuguese, French, German, Italian, Korean, Japanese, Chinese, Arabic, Turkish and Russian |
| 🎧 Audio player | Real playback of 30-second previews: play/pause, next/previous, shuffle, repeat, seek and volume |
| ❤️ Liked songs | Heart any song; saved in `localStorage` |
| 👤 Follow artists | Follow/unfollow with a saved list |
| 🎭 Language browsing | Language tiles and chips filter songs and artists |
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
└── script.js    → API fetch, rendering, skeletons, search, likes, audio player
```

The navbar, footer and player are injected by `script.js`, so they are defined once and shared by every page. To add or change a language, edit the `LANGS` list at the top of `script.js` (name, color, search term, store country).

## 🚀 Run locally

No build step. Open `index.html` in a browser, or run a local server:

```bash
python3 -m http.server 8000
```

## ⚠️ Known limitations

- The API only provides 30-second previews, not full songs.
- Playback stops when you open another page (each page is separate).
- No backend or real authentication; likes, follows and the demo login are stored only in this browser.
- Needs an internet connection to load songs. Results are cached in the browser for 12 hours.
- Search results for a language come from keyword searches, so a few songs may be in another language.

## 🔮 Future improvements

Full-length tracks (for example a licensed API), user playlists, artist and album detail pages, and a backend with a database.

## 👨‍💻 Author

**Gudari Devadasu** — B.Tech Computer Science & Engineering Graduate, aspiring Full Stack Developer.

---

<p align="center"><strong>🎵 WAVELY</strong> — Browse • Discover • Listen (in your imagination)</p>