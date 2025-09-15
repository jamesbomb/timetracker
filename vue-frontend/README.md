# Timetracker Vue Frontend

> ✅ **QUESTO È IL FRONTEND ATTIVO E MANTENUTO**  
> Il frontend React nella cartella `/frontend` è deprecato e non più aggiornato.

This is the Vue 3 + TypeScript frontend for the Timetracker application, built with Vite, Pinia, Vue Router, and Vuetify.

## Stack Tecnologico

- **Vue 3** - Framework progressivo per UI
- **TypeScript** - Type safety
- **Vuetify 3** - Material Design component framework
- **Pinia** - State management
- **Vue Router** - Routing
- **Vite** - Build tool

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Setup & Run

```bash
cd vue-frontend
npm install
npm run dev
```

The app will start on `http://localhost:5173` by default.

## Build

```bash
npm run build
npm run preview
```

## Docker

Il frontend è integrato nel docker-compose principale:

```bash
# Dalla root del progetto
docker-compose up -d --build frontend
```

## Funzionalità

- ✅ Login con email/password e Google OAuth
- ✅ Dashboard personalizzata con saluto basato sull'orario
- ✅ Richiesta ferie e permessi
- ✅ Pannello Manager per approvazioni
- ✅ Pannello Admin con drag & drop per gestione unità
- ✅ UI moderna con tema verde aziendale
- ✅ Fully responsive
- ✅ Gestione multi-unità per dipendenti
