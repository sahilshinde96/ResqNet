# ResqNet - Community Crisis & Resource Platform

ResqNet is a high-performance, real-time crisis management ecosystem designed to bridge the gap between citizens, volunteers, and authorities during humanitarian emergencies.

## Features & Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Leaflet.js + OpenStreetMap
- **Backend**: Django REST Framework + PostgreSQL Support + SQLite Local Fallback
- **AI Intelligence**: Google Gemini 3 Flash / 3 Pro / TTS audio voice assistance
- **Role-Based Access Control**: Tailored workflows for Citizens, Volunteers, and Authorities

## Run Locally

### 1. Launch Django Backend
```bash
python backend/manage.py migrate
python backend/manage.py seed_db
python backend/manage.py runserver 8000
```

### 2. Launch React Frontend
```bash
npm install
npm run dev
```
- Open `http://localhost:3000/` in your browser.
