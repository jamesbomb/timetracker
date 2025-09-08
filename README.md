# Holidays & TimeOff Management Demo

Questo è un prototipo funzionante di un sistema per la gestione di ferie e permessi aziendali.

## Funzionalità

- **Autenticazione & Accesso**
  - Registrazione e login con email e password
  - Accesso tramite Google OAuth
  - Messaggio di benvenuto dopo il login ("Buongiorno, [Nome Utente]")

- **Dashboard Utente**
  - Visualizzazione delle ferie e permessi futuri già approvati
  - Modulo per richiedere nuove ferie o permessi

- **Approvazioni**
  - I manager/moderatori di unità possono visualizzare, approvare o rifiutare le richieste dei membri del proprio team
  - Aggiornamento dello stato delle richieste e invio notifica email agli utenti

## Stack Tecnologico

- **Backend**: Python, FastAPI
- **Frontend**: React (Vite)
- **Database**: MySQL

## Installazione e Avvio

1. Clonare la repository e spostarsi nella cartella del progetto:
   ```bash
   git clone <repo_url>
   cd holidays-timeoff-demo
   ```

2. Backend
   ```bash
   cd backend
   # start a local MySQL container if you don't have one running
   docker-compose up -d mysql
   cp .env.example .env
   # Modifica .env per configurare DATABASE_URL, JWT, Google OAuth, SMTP, ecc.
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   # Esegui le migrazioni del database con Alembic
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

3. Frontend
   ```bash
   cd frontend
   cp .env.example .env
   # Modifica .env per configurare VITE_API_URL e i valori di Firebase
   npm install
   npm run dev
   ```

Apri http://localhost:5173 (o la porta indicata dagli script di vite) nel browser. L'app comunicherà con il backend FastAPI su http://localhost:8000.
