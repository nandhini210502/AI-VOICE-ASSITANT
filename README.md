# Aura — AI Voice Assistant

Aura is a full-stack AI-powered voice assistant built with a Node.js/Express backend and a React + Vite frontend. It supports real-time voice interaction, text chat, multilingual support, and persistent chat history.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Stopping the Application](#stopping-the-application)

---

## Features

- 🎤 **Voice Recognition** — Real-time speech-to-text input
- 🔊 **AI Voice Responses** — Natural text-to-speech output
- 💬 **Text Chat Support** — Type instead of speaking, when preferred
- 📜 **Chat History** — Persistent conversation log in the sidebar
- ⚙️ **Voice Settings** — Adjustable speed, pitch, volume, and language
- 🌐 **Multilingual Support** — 30+ languages supported
- 👤 **Flexible Authentication** — Guest login, sign in, or account creation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Frontend | React, Vite |
| AI/LLM | Groq API |
| Auth | JWT |

---

## Project Structure

```
voice-assistant/
├── backend/               # Node.js + Express server
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── .env               # API keys and environment variables
│   └── server.js
└── frontend/               # React + Vite app
    ├── src/
    └── index.html
```

---

## Getting Started

### Prerequisites

- Node.js and npm installed
- A Groq API key ([get one here](https://console.groq.com/keys))

### Environment Setup

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=3001
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=any_random_secret_string_min_32_chars
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

### Installation

**Backend:**
```powershell
cd "C:\Users\Neural Gen-AI\Desktop\ANTRGRAVITY\voice-assistant\backend"
npm install
```

**Frontend:**
```powershell
cd "C:\Users\Neural Gen-AI\Desktop\ANTRGRAVITY\voice-assistant\frontend"
npm install
```

---

## Running the Application

The backend and frontend must run in **separate terminals simultaneously**.

**Terminal 1 — Backend**
```powershell
cd "C:\Users\Neural Gen-AI\Desktop\ANTRGRAVITY\voice-assistant\backend"
node server.js
```
Expected output:
```
🚀 Voice Assistant Backend running on port 3001
```

**Terminal 2 — Frontend**
```powershell
cd "C:\Users\Neural Gen-AI\Desktop\ANTRGRAVITY\voice-assistant\frontend"
npm run dev
```
Expected output:
```
➜ Local: http://localhost:5173/
```

Then open your browser at:
```
http://localhost:5173
```

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Cannot find module server.js` | Running command from the wrong directory | `cd backend` before running the command |
| `GROQ_API_KEY missing` | Missing `.env` file | Create `backend/.env` with the required keys |
| `Port 3001 already in use` | Another process is using the port | Run `npx kill-port 3001` |
| `vite is not recognized` | Frontend dependencies not installed | Run `npm install` inside `frontend/` |
| `&&` operator fails in terminal | PowerShell doesn't support `&&` chaining | Run commands on separate lines |
| Path errors with spaces | Folder path contains spaces | Wrap the path in double quotes `"..."` |

---

## Stopping the Application

Press **Ctrl + C** in each terminal window to stop the backend and frontend servers.

---

## Author

**Nandhini Manickkam**
GitHub: [@nandhini210502](https://github.com/nandhini210502)