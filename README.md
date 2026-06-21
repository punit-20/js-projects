<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=220&section=header&text=JS%20Projects%20Showcase&fontSize=34&fontColor=ffffff&animation=twinkling&fontAlignY=45" width="100%" />
</p>

<h1 align="center">🚀 JS Projects Portfolio</h1>
<h3 align="center"><em>A Collection of Premium Full-Stack Web Applications & Real-Time Utilities</em></h3>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-18/19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Express-v4-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Socket.io-v4-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/MongoDB-Local/Memory-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-v6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong>Express Backend → React Frontend → Socket.io WebSockets → MongoDB Database</strong><br/>
  <sub>Interactive full-stack applications with premium glassmorphic UI/UX and automated integrations.</sub>
</p>

---

## 🧰 Core Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white" />
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [🧰 Core Tech Stack](#-core-tech-stack)
- [✨ Showcase Overview](#-showcase-overview)
- [🏗️ Portfolio Projects](#-portfolio-projects)
  - [1. 🔗 Advanced URL Shortener](#1--advanced-url-shortener)
  - [2. 📝 Notes App with Auth](#2--notes-app-with-auth)
  - [3. 💬 SyncTalk Chat Room](#3--synctalk-chat-room)
  - [4. 📋 SyncTasks Task Manager](#4--synctasks-task-manager)
- [📁 Repository Structure](#-repository-structure)
- [⚡ Quick Start & Deployment](#-quick-start--deployment)
- [⚙️ Database fallback Configuration](#️-database-fallback-configuration)
- [🧪 Automated Test Suites](#-automated-test-suites)
- [📈 GitHub Stats](#-github-stats)
- [🌐 Socials](#-socials)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Showcase Overview

This repository is a showcase of clean, production-ready full-stack applications. Each project is designed to solve a specific problem while demonstrating architectural patterns suitable for B2C & B2B application deployments.

> 💡 **Development Standards:**
> * UI interfaces are customized with responsive dark glassmorphic styling, HSL parameters, and micro-animations.
> * Servers implement a dual database design (Local MongoDB + instant in-memory fallback databases) to run instantly out-of-the-box.
> * Every project features automated integration tests verifying API endpoints and real-time WebSocket messaging.

---

## 🏗️ Portfolio Projects

### 1. 🔗 Advanced URL Shortener
An interactive service that turns long URLs into compact, shareable links, equipped with dynamic analytics tracking.
- **Key Features:** Click counters, real-time activity timelines, visual statistics grids, client session identifiers (IP/cookie checks), and custom layout headers.
- **Tech Stack:** React, Express, MongoDB.
- **Access Port:** Server `5000`

### 2. 📝 Notes App with Auth
A secure notebook manager featuring JWT-based user registries and customizable styling cards.
- **Key Features:** User Register/Login (creds hashed via `bcryptjs`), JWT middleware authorization headers, notes CRUD, tags, custom color filters, and dynamic timelines.
- **Tech Stack:** React, JWT, Express, MongoDB.
- **Access Ports:** Server `5001` | Client `5173`

### 3. 💬 SyncTalk Chat Room
A highly responsive multi-room real-time messaging application.
- **Key Features:** Custom avatar selector, real-time message broadcasting, typing notifications ("Alex is typing..."), active room users catalog, in-memory chat message history caching (stores last 50 messages), and scroll triggers.
- **Tech Stack:** React, Socket.io, Express.
- **Access Ports:** Server `5002` | Client `5174`

### 4. 📋 SyncTasks Task Manager
An interactive organizer to monitor daily tasks and priorities.
- **Key Features:** Task priority tags (High 🔥, Medium ⚡, Low 💤), progress bars, pending/completed task counters, title text search, status filters, and checkmark micro-animations.
- **Tech Stack:** React, Express, MongoDB.
- **Access Ports:** Server `5003` | Client `5175`

---

## 📁 Repository Structure

```
js-projects/
├── 📂 url-shortner/         # 🔗 URL Shortener Project
│   ├── 📂 client/           # React frontend
│   └── 📂 server/           # Express server
│
├── 📂 notes-app/            # 📝 Notes App Project
│   ├── 📂 client/           # React frontend
│   ├── 📂 server/           # Express + JWT routes
│   └── test-notes.js        # Auth & CRUD tests
│
├── 📂 live-chat-app/        # 💬 Real-Time Chat Room Project
│   ├── 📂 client/           # React + Socket.io client
│   ├── 📂 server/           # Node.js + Socket.io server
│   └── test-chat.js         # WebSocket event tests
│
├── 📂 task-manager/         # 📋 Task Manager Project
│   ├── 📂 client/           # React + Axios client
│   ├── 📂 server/           # REST API Express routes
│   └── test-tasks.js        # Task CRUD & filter tests
│
└── .gitignore               # Config to exclude dependencies
```

---

## ⚡ Quick Start & Deployment

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/punit-20/js-projects.git
cd js-projects
```

### 2️⃣ Running any Project
Every project is structured to run concurrently with a single command. Choose any project folder:

```bash
# Go to project folder
cd live-chat-app

# Install all dependencies (installs root, client and server modules)
npm install && npm install --prefix client && npm install --prefix server

# Start both backend and frontend dev servers concurrently
npm run dev
```

### 3️⃣ Access URLs

| Project | Backend Port | React Client Port |
|---|---|---|
| **URL Shortener** | `http://localhost:5000` | — |
| **Notes App** | `http://localhost:5001` | `http://localhost:5173` |
| **SyncTalk Chat** | `http://localhost:5002` | `http://localhost:5174` |
| **SyncTasks Manager** | `http://localhost:5003` | `http://localhost:5175` |

---

## ⚙️ Database fallback Configuration

To prevent crashes and blockages when the local MongoDB service is offline during dev/testing, backends include an automatic **in-memory database fallback** manager:
```javascript
const client = new MongoClient(MONGO_URI, {
  connectTimeoutMS: 2000,
  serverSelectionTimeoutMS: 2000
});
// Falls back automatically to MongoMemoryServer if connection fails
```

---

## 🧪 Automated Test Suites

Verify backend APIs and real-time connectivity programmatically by executing the automated test scripts in each project folder:

```bash
# Verify Notes App API (auth, tokens, CRUD)
cd notes-app
node test-notes.js

# Verify SyncTalk WebSocket events (rooms, broadcasts, typing notifications)
cd live-chat-app
node test-chat.js

# Verify Task Manager REST API (creation, priority queries, status filters, delete)
cd task-manager
node test-tasks.js
```

---

## 📈 GitHub Stats

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=punit-20&show_icons=true&theme=radical&hide_border=true&bg_color=0d1117&title_color=58a6ff&icon_color=f8d866&text_color=c9d1d9&ring_color=58a6ff" alt="Punit's GitHub Stats" width="48%" />
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=punit-20&theme=radical&hide_border=true&background=0d1117&stroke=58a6ff&ring=58a6ff&fire=f8d866&currStreakLabel=58a6ff&sideLabels=c9d1d9&dates=8b949e" alt="GitHub Streak" width="48%" />
</p>

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=punit-20&layout=compact&theme=radical&hide_border=true&bg_color=0d1117&title_color=58a6ff&text_color=c9d1d9&langs_count=8" alt="Top Languages" width="48%" />
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=punit-20&repo=js-projects&theme=radical&hide_border=true&bg_color=0d1117&title_color=58a6ff&icon_color=f8d866&text_color=c9d1d9" alt="Portfolio Repo Card" width="48%" />
</p>

<p align="center">
  <img src="https://github-profile-trophy.vercel.app/?username=punit-20&theme=algolia&no-frame=true&no-bg=true&column=7&margin-w=10" alt="GitHub Trophies" width="90%" />
</p>

<!-- GitHub Activity Graph -->
<p align="center">
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=punit-20&theme=react-dark&hide_border=true&bg_color=0d1117&color=58a6ff&line=58a6ff&point=f8d866&area=true&area_color=58a6ff" alt="GitHub Activity Graph" width="95%" />
</p>

---

## 🌐 Socials

<p align="center">
  <a href="https://github.com/punit-20"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://www.linkedin.com/in/punit-soni-227467203?utm_source=share_via&utm_content=profile&utm_medium=member_android"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://www.instagram.com/heispunit/"><img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
  <a href="mailto:punitsoni202@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>
</p>

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=170&section=footer&text=Built%20with%20%E2%9D%A4%EF%B8%8F%20by%20Punit&fontSize=24&fontColor=ffffff&animation=twinkling&fontAlignY=65" width="100%" />
</p>

<p align="center">
  <sub>Powered by React · Node.js · Socket.io · MongoDB · TailwindCSS</sub>
</p>

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=punit-20&label=Profile%20Views&color=58a6ff&style=for-the-badge" alt="Profile Views" />
  <img src="https://img.shields.io/badge/⭐_Star_this_repo-If_you_find_it_useful!-yellow?style=for-the-badge" alt="Star" />
</p>
