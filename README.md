# Timetracker

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
- **Email Testing**: MailHog (Docker)

## Installazione e Avvio

### 1. Prerequisiti
- Docker e Docker Compose installati
- Python 3.10+
- Node.js 16+

### 2. Avvia i servizi Docker (MySQL + MailHog)
```bash
# Nella directory principale del progetto
docker-compose up -d
```

Questo avvierà:
- **MySQL** su porta `3306`
- **MailHog** su porta `1025` (SMTP) e `8025` (Web UI)

### 3. Configura il Backend
```bash
cd backend
python3 -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Crea il file .env (se non esiste)
cp .env.example .env 2>/dev/null || echo "Crea manualmente il file .env"
```

Aggiungi al file `backend/.env`:
```env
# Database
DATABASE_URL=mysql+pymysql://timeoff:timeoff123@localhost/timeoffdb

# JWT Secret
SECRET_KEY=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# MailHog (per sviluppo locale)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=noreply@tempocasa-timetracker.local
SMTP_PASSWORD=
SMTP_USE_TLS=false
```

Esegui le migrazioni e avvia il server:
```bash
alembic upgrade head
uvicorn app.main:app --reload
```

### 4. Configura il Frontend
```bash
cd frontend
npm install

# Crea il file .env (se non esiste)
cp .env.example .env 2>/dev/null || echo "Crea manualmente il file .env"
```

Configura `frontend/.env` con i tuoi valori Firebase e API.

Avvia il frontend:
```bash
npm run dev
```

### 5. Accedi all'Applicazione
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/docs
- **MailHog Web UI**: http://localhost:8025

## 📧 MailHog - Testing Email

MailHog cattura tutte le email inviate dall'applicazione per il testing in sviluppo.

### Come Funziona
1. Quando l'app invia un'email (es. approvazione/rifiuto richieste), viene catturata da MailHog
2. Apri http://localhost:8025 per vedere tutte le email
3. Le email NON vengono inviate realmente

### Casi d'Uso
- **Manager approva/rifiuta**: L'email di notifica al dipendente viene catturata
- **Dipendente crea richiesta**: Le notifiche ai manager vengono catturate
- **Motivazione rifiuto**: Visibile nell'email catturata

### Comandi Utili
```bash
# Verifica che MailHog sia attivo
docker ps | grep mailhog

# Riavvia MailHog
docker-compose restart mailhog

# Vedi i log
docker logs tempocasa-mailhog
```

### Produzione
Per la produzione, configura un server SMTP reale nel file `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tua-email@gmail.com
SMTP_PASSWORD=tua-app-password
SMTP_USE_TLS=true
```


# 🔄 Flusso di Lavoro
1. Admin assegna unità: Nell'admin panel, l'admin può assegnare a un utente:
- Unità di appartenenza (tramite drag & drop)
- Unità da gestire come manager (tramite drag & drop)
- Flag manager (checkbox)
2. Manager vede richieste: Un manager può:
- Accedere al pannello manager dal Dashboard
- Vedere tutte le richieste dei dipendenti delle sue unità
- Filtrare per stato (tutte, in attesa, approvate, rifiutate)
3. Approvazione/Rifiuto:
- Click su "Approva" per approvare una richiesta
- Click su "Rifiuta" con motivo opzionale
- Email automatica inviata al dipendente
- Lista aggiornata automaticamente
# 📊 Esempio di Utilizzo
1. Setup Iniziale (come Admin):
- Crea unità: "Sviluppo", "Marketing", "Vendite"
- Assegna Mario come manager di "Sviluppo"
- Assegna Luigi, Anna come membri di "Sviluppo"
2. Richiesta Ferie (come Dipendente):
- Luigi richiede ferie dal Dashboard
3. Approvazione (come Manager):
- Mario accede al Manager Panel
- Vede la richiesta di Luigi in attesa
- Può approvarla o rifiutarla
