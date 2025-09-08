import os
import smtplib
from email.mime.text import MIMEText
from fastapi import BackgroundTasks
import logging

logger = logging.getLogger(__name__)


def send_email(background_tasks: BackgroundTasks, to_email: str, subject: str, body: str):
    background_tasks.add_task(_send_email, to_email, subject, body)


def _send_email(to_email: str, subject: str, body: str):
    # Configurazione SMTP con valori di default per MailHog
    host = os.getenv("SMTP_HOST", "localhost")
    port = int(os.getenv("SMTP_PORT", 1025))
    user = os.getenv("SMTP_USER", "noreply@tempocasa-timetracker.local")
    password = os.getenv("SMTP_PASSWORD", "")
    use_tls = os.getenv("SMTP_USE_TLS", "false").lower() == "true"

    # Se l'host non è configurato, logga solo il messaggio
    if not host:
        logger.info(
            f"Email non inviata (SMTP non configurato): To={to_email}, Subject={subject}"
        )
        logger.info(f"Body: {body}")
        return

    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = user
        msg["To"] = to_email

        with smtplib.SMTP(host, port) as server:
            # MailHog (porta 1025) non richiede TLS o autenticazione
            # Altri server SMTP potrebbero richiedere TLS e autenticazione
            if use_tls and port != 1025:
                server.starttls()

            if password and port != 1025:
                server.login(user, password)

            server.sendmail(user, [to_email], msg.as_string())

        logger.info(f"✉️ Email inviata a {to_email}: {subject}")

        # Se stiamo usando MailHog, logga l'URL per visualizzare l'email
        if host == "localhost" and port == 1025:
            logger.info(f"📧 Visualizza l'email su: http://localhost:8025")

    except Exception as e:
        logger.error(f"❌ Errore invio email a {to_email}: {str(e)}")
        # Non solleviamo l'eccezione per evitare che l'applicazione si blocchi
