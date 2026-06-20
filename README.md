# js-projects (JavaScript Projects Repository)

Welcome to my personal JavaScript projects collection! This repository hosts various web applications demonstrating modern full-stack web development techniques using HTML, CSS, JavaScript, React, Express, and MongoDB.

## Current Projects

### 🔗 SnipURL — URL Shortener & Real-Time Analytics
SnipURL is a feature-rich, high-performance URL shortening service with a premium dark-themed glassmorphic dashboard. It is located inside the [`url-shortner`](./url-shortner) directory.

#### Key Features
- **URL Shortening**: Instantly convert long URLs into compact redirect codes.
- **QR Code Generation**: Automatically generates a scan-to-open QR code for every shortened link.
- **Real-Time AJAX Monitoring**: Monitored tables (`Your Created Links`, `Global Click Stats`, and `Your Activity Timeline`) refresh automatically every 2 seconds via AJAX polling.
- **Device-Bound Session Tracking**:
  - Assigns a permanent, unique **Virtual Static IP** (e.g., `10.244.x.y`) to each user.
  - Uses a robust combination of **HTTP-only cookies** and client-side **`localStorage` fallbacks** to maintain user session history.
  - Tracking is fully resilient to physical network shifts (switching from Wi-Fi to cellular data updates the connection record but preserves history and the Virtual Static IP).
- **In-Memory Fallback**: Connects to local MongoDB by default; automatically spins up an in-memory database server (`mongodb-memory-server`) if no local database instance is running.

#### Technology Stack
- **Frontend**: React (with smooth transitions, custom glows, dynamic timelines, and toast notifications)
- **Backend**: Node.js & Express.js
- **Database**: MongoDB (via the official `mongodb` driver)
- **Tooling**: Nodemon & Concurrently

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Optional — falls back to an in-memory DB if not running locally)

### Setup & Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/punit-20/js-projects.git
   cd js-projects
   ```

2. Navigate into the project folder (e.g., `url-shortner`):
   ```bash
   cd url-shortner
   ```

3. Install root and client-side dependencies:
   ```bash
   # Install backend / dev tooling dependencies
   npm install

   # Install React frontend dependencies
   npm install --prefix client
   ```

4. Run the application in development mode:
   ```bash
   npm run dev
   ```
   *This starts both the backend server (on port `5000`) and the React development server (on port `3000`) concurrently.*

---

## Upcoming Projects
The following projects are currently planned or under construction:
- **💬 Live Chat App** (`live-chat-app`): Real-time chat application with WebSockets/Socket.io.
- **📝 Notes App** (`notes-app`): Clean markdown-supported note-taking dashboard.
- **✓ Task Manager** (`task-manager`): Interactive kanban task tracking application.
