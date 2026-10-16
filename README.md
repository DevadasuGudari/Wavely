# 🎬 CLONEFLIX — Netflix UI Clone

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Frontend-Only-00A98F?style=for-the-badge" alt="Frontend Only">
</p>

<p align="center">
  <strong>A responsive Netflix-inspired frontend interface built with HTML, CSS, Bootstrap 5, and vanilla JavaScript.</strong>
</p>

<p align="center">
  🎬 Browse &nbsp; • &nbsp;
  🔎 Search &nbsp; • &nbsp;
  📺 Discover &nbsp; • &nbsp;
  ⭐ Explore
</p>

---

## 📌 About the Project

**CLONEFLIX** is a frontend-only Netflix-inspired website created as a practice project for learning and improving frontend development skills.

The project recreates the overall structure and visual experience of a streaming platform using:

- HTML5
- CSS3
- Bootstrap 5
- Vanilla JavaScript

There is **no backend and no real authentication**. The application uses static data with JavaScript-based UI interactions.

> ⚠️ This is a practice project for learning purposes only. It is not affiliated with Netflix, Inc.

---

# ✨ Features

| Feature | Description |
|---|---|
| 📱 Responsive Layout | Mobile-friendly design using Bootstrap 5 |
| 🎬 Netflix-Style UI | Hero banner, movie cards, rows and genre sections |
| 🖼️ Movie Cards | Poster cards with hover interactions |
| 🦴 Skeleton Loading | Animated loading placeholders before cards appear |
| 🔎 Live Search | Filters visible cards in real time |
| 📺 TV Shows | Dedicated TV shows catalogue |
| 🎥 Movies | Dedicated movie catalogue |
| 🔥 New & Popular | Popular content catalogue |
| ⭐ My List | Static saved-list interface |
| 🔐 Authentication UI | Sign in and sign up pages |
| 🎨 Modern Interface | Dark streaming-platform inspired design |

---

# 📄 Pages

| File | Description |
|---|---|
| `index.html` | Home page — hero banner, trending/popular/top-10 rows, genre grid |
| `movies.html` | Movies catalog |
| `tvshows.html` | TV shows catalog |
| `popular.html` | New & Popular catalog |
| `mylist.html` | User's saved list (static placeholder data) |
| `login.html` | Sign in form (no real auth) |
| `signup.html` | Create account form (no real auth) |

---

# 🏠 Home Page

The home page provides the main streaming-platform experience.

It includes:

- 🎬 Hero banner
- 🔥 Trending content
- ⭐ Popular content
- 🔟 Top 10 section
- 🎭 Genre grid
- 🧭 Responsive navigation
- 🔎 Search interface

---

# 🎬 Movies & TV Shows

CLONEFLIX separates content into dedicated catalog pages.

### 🎥 Movies

The Movies page displays movie cards in a responsive grid.

### 📺 TV Shows

The TV Shows page provides a dedicated catalogue for television content.

### 🔥 New & Popular

The Popular page provides access to new and popular content.

---

# 🦴 Skeleton Loading

CLONEFLIX includes a simulated skeleton-loading experience.

When the page loads:

```text
Page Load
    ↓
Skeleton Placeholders
    ↓
~3 Second Simulation
    ↓
Cards Fade In
    ↓
Content Available
```

The loading animation is implemented through:

```javascript
initSkeletonLoading()
```

> This is only a UI simulation. No real network data is fetched.

---

# 🔎 Live Search

The navigation includes an interactive search feature.

### Search Flow

```text
🔍 Click Search Icon
        ↓
Search Input Expands
        ↓
⌨️ User Types
        ↓
JavaScript Filters Cards
        ↓
🎬 Matching Content Displayed
        ↓
❌ No Match Message
```

The search filters the cards available on the **current page** by:

- Title
- Genre

The functionality is implemented through:

```javascript
initSearch()
```

---

# 🎨 UI & Design

CLONEFLIX follows a streaming-platform-inspired interface.

### Design Elements

- 🌑 Dark-themed interface
- 🎬 Large hero banner
- 🖼️ Movie poster cards
- ✨ Hover effects
- 🏷️ Content badges
- 🎭 Genre tiles
- 📱 Responsive navigation
- 🦴 Skeleton loading animations
- 🔎 Expandable search interface

---

# 📂 File Structure

```text
cloneflix/
│
├── index.html
├── movies.html
├── tvshows.html
├── popular.html
├── mylist.html
├── login.html
├── signup.html
│
├── style.css
│   └── All custom styling
│
└── script.js
    ├── Skeleton loading
    └── Search bar logic
```

---

# 🛠️ Technologies Used

## 💻 Frontend

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap 5">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</p>

### Libraries & Resources

- [Bootstrap 5.3.3](https://getbootstrap.com/) — Layout, grid, navbar and forms
- Vanilla JavaScript — Interactive functionality without frameworks
- [Lorem Picsum](https://picsum.photos/) — Placeholder poster and banner images
- Inline SVG icons — Interface icons

---

# 🧩 Application Flow

```text
                         🎬 CLONEFLIX
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
           🏠 Home         🎥 Movies       📺 TV Shows
              │               │               │
              └───────────────┼───────────────┘
                              │
                              ▼
                       🔥 New & Popular
                              │
                              ▼
                         ⭐ My List
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
              🔐 Sign In                📝 Sign Up
```

---

# 🚀 Running the Project Locally

No build tools or package dependencies are required.

## 1️⃣ Download or Clone

Place all project files inside a single folder.

All pages reference each other using relative paths such as:

```text
./style.css
./script.js
```

---

## 2️⃣ Open Directly

You can simply open:

```text
index.html
```

in a modern web browser.

---

## 3️⃣ Run with a Local Server

For more accurate local behavior, you can use a development server.

### Using `npx`

```bash
npx serve .
```

### Using Python

```bash
python3 -m http.server 8000
```

Then open the local address provided by the server.

---

# 🧭 Website Navigation

Use the navigation bar to access:

```text
🏠 Home
   ↓
📺 TV Shows
   ↓
🎥 Movies
   ↓
🔥 New & Popular
   ↓
⭐ My List
   ↓
🔐 Sign In
   ↓
📝 Sign Up
```

---

# ⚠️ Known Limitations

This project is intentionally frontend-only.

### 🔐 Authentication

Sign in and sign up forms do not create or validate real user accounts.

### ⭐ My List

"My List" and "+ My List" buttons are currently static/decorative.

### 🔔 Notifications

Notifications are currently static/decorative.

### 🔎 Search

Search only filters cards already available on the **current page**.

It does not:

- Fetch external data
- Search across the entire website
- Connect to a backend API

### 📦 Content Data

All movie and show information is hardcoded directly into the HTML.

---

# 🎯 Learning Objectives

This project was created to practice and demonstrate:

- Semantic HTML5
- CSS3 styling
- Bootstrap responsive layouts
- Bootstrap grid system
- Responsive navigation
- JavaScript DOM manipulation
- Search filtering
- Loading animations
- UI/UX design
- Multi-page website development
- Responsive web development

---

# 🔮 Future Improvements

The project can be extended with:

- 🔐 Real authentication
- 🗄️ Backend integration
- 🔎 Global movie search
- 🎬 Real movie API integration
- ⭐ Functional My List
- 👤 User profiles
- ▶️ Video playback
- 💳 Subscription system
- 💾 Database integration
- ❤️ Favorites and watchlist
- 📊 User watch history
- 🔔 Real notifications
- 🎥 Movie details pages
- 📝 User reviews and ratings

---

# 💡 Future Architecture

The current project is a static frontend.

It can later evolve into a full-stack streaming application:

```text
                    🎬 CLONEFLIX
                         │
                    ⚛️ Frontend
                         │
                   REST API / API
                         │
                    🟢 Backend
                         │
                    🗄️ Database
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           👤 Users    🎬 Movies   ⭐ Lists
```

---

# 📚 What This Project Demonstrates

```text
HTML5
   ↓
CSS3
   ↓
Bootstrap
   ↓
Responsive Design
   ↓
JavaScript
   ↓
DOM Manipulation
   ↓
Search Filtering
   ↓
UI Animations
   ↓
Multi-Page Frontend
```

CLONEFLIX demonstrates how these frontend technologies can be combined to create a modern streaming-platform interface.

---

# 👨‍💻 Author

## Gudari Devadasu

**B.Tech Computer Science & Engineering Graduate**

Aspiring Full Stack Developer

---

# ⭐ Show Your Support

If you found this project useful, consider giving the repository a **⭐ Star** on GitHub.

Your support helps motivate further development and improvements.

---

# ⚖️ Disclaimer

CLONEFLIX is an **educational frontend practice project**.

It is not affiliated with, endorsed by, or connected to **Netflix, Inc.**

All content, branding, and imagery are used for educational and demonstration purposes.

---

<p align="center">

## 🎬 CLONEFLIX

### Browse • Discover • Explore 🚀

**Built with HTML5 • CSS3 • Bootstrap • JavaScript**

⭐ **Keep Learning • Keep Building • Keep Improving**

</p>
