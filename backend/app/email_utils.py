import os
import smtplib
from email.mime.text import MIMEText
from fastapi import BackgroundTasks


def send_email(background_tasks: BackgroundTasks, to_email: str, subject: str, body: str):
    background_tasks.add_task(_send_email, to_email, subject, body)


def _send_email(to_email: str, subject: str, body: str):
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", 587))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to_email
    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(user, password)
        server.sendmail(user, [to_email], msg.as_string())