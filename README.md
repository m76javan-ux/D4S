# D4S – Dutch for Farsi Speakers

A beginner-friendly Dutch learning app designed for Persian speakers, with AI-powered assistance.

---

## 🧩 Requirements

* Node.js (v18 or newer recommended)
* npm (comes with Node)

---

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/m76javan-ux/D4S.git
cd D4S
```

Install dependencies:

```bash
npm install
```

---

## 🔐 Environment Setup

Create a `.env.local` file:

```bash
touch .env.local
```

Add your API key:

```
GEMINI_API_KEY=your_api_key_here
```

⚠️ Never commit this file to GitHub.

---

## ▶️ Run the App

Start the development server:

```bash
npm run dev
```

Then open:

```
http://localhost:5173
```

---

## 🏗️ Project Structure

* `src/` → frontend (React/Vite)
* `server/` → backend logic
* `public/` → static files
* `firebase.json` → deployment config
* `AGENTS.md` → AI development rules

---

## 📦 Deployment

This project uses Firebase Hosting.

---

## 🎯 Future Goals

* USB portable version
* Desktop app version (Electron/Tauri)
* Offline learning mode

---
