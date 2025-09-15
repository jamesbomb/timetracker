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
- **Frontend**: Vue 3 + Vuetify (attivo)
- **Database**: MySQL
- **Email Testing**: MailHog (Docker)


## Installazione e Avvio

### 🐳 Opzione 1: Docker Compose (Consigliato)

#### Prerequisiti
- Docker e Docker Compose installati
- Configurazione Firebase (per l'autenticazione Google)

#### Configurazione Firebase
1. Copia il file di esempio delle variabili d'ambiente:
   ```bash
   cp docker.env.example .env
   ```

2. Modifica il file `.env` con le tue credenziali Firebase:
   - Vai su https://console.firebase.google.com
   - Seleziona il tuo progetto
   - Vai in Settings > Project settings
   - Copia i valori dalla sezione "Your apps"
   - Incolla i valori nel file `.env`

#### Avvia l'intero stack con un comando
```bash
# Nella directory principale del progetto
docker-compose up -d --build
```

Questo avvierà automaticamente:
- **MySQL** su porta `3306`
- **MailHog** su porta `1025` (SMTP) e `8025` (Web UI)
- **Backend FastAPI** su porta `8000`
- **Frontend React** su porta `5173`

**Nota**: Al primo avvio, attendi che MySQL sia completamente inizializzato prima che il backend possa connettersi.

#### Gestione dei container
```bash
# Visualizza i container in esecuzione
docker-compose ps

# Visualizza i log di un servizio specifico
docker-compose logs -f backend
docker-compose logs -f frontend

# Riavvia un servizio
docker-compose restart backend

# Ferma tutto
docker-compose down

# Ferma e rimuovi anche i volumi (attenzione: cancella il database!)
docker-compose down -v
```

### 💻 Opzione 2: Sviluppo Locale (Senza Docker per Backend/Frontend)

#### Prerequisiti
- Docker e Docker Compose (per MySQL e MailHog)
- Python 3.10+
- Node.js 16+

#### 1. Avvia solo i servizi di supporto
```bash
# Avvia solo MySQL e MailHog
docker-compose up -d mysql mailhog
```

#### 2. Configura il Backend
```bash
cd backend
python3 -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Crea il file .env
```

Crea `backend/.env`:
```env
DATABASE_URL=mysql://user:password@localhost:3306/dbname
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_CLIENT_ID=403868323138-fnb6c48jojgst876jcrmkviipe9ujpj5.apps.googleusercontent.com
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
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

#### 3. Configura il Frontend Vue
```bash
cd vue-frontend
npm install
npm run dev
```

### 📍 Accedi all'Applicazione
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
- **Manager approva/rifiuta**: l'email di notifica al dipendente viene catturata
- **Dipendente crea richiesta**: le notifiche ai manager vengono catturate
- **Motivazione rifiuto**: visibile nell'email catturata

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
