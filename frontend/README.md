# ⚠️ DEPRECATO - Timetracker Frontend React

> **❌ ATTENZIONE: Questo frontend React NON è più mantenuto.**  
> **✅ Usa il frontend Vue nella cartella `/vue-frontend`**

## Stato del Progetto

Questo frontend React è stato sostituito da un nuovo frontend Vue 3 + Vuetify che offre:
- UI più moderna e consistente
- Migliore gestione dello stato con Pinia
- Componenti Material Design con Vuetify
- Supporto completo per multi-unità
- Drag & drop nel pannello admin

## Per Utilizzare il Frontend Attivo

```bash
# Vai al frontend Vue
cd ../vue-frontend
npm install
npm run dev
```

## Docker

Il `docker-compose.yml` è già configurato per usare il frontend Vue:

```bash
# Dalla root del progetto
docker-compose up -d --build
```

## Contenuto Originale (per riferimento)

### Environment Variables

Copy `.env.example` to `.env` in this directory and configure the following variables:

```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development Setup

```bash
npm install
npm run dev
```

