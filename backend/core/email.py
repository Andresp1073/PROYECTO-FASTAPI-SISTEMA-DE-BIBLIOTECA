import logging
import asyncio
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr

from core.settings import settings

logger = logging.getLogger("biblioteca")


def _build_mail_conf() -> ConnectionConfig:
    return ConnectionConfig(
        MAIL_USERNAME=settings.SMTP_USER,
        MAIL_PASSWORD=settings.SMTP_PASSWORD,
        MAIL_FROM=settings.EMAIL_FROM,
        MAIL_FROM_NAME=settings.EMAIL_FROM_NAME or "Biblioteca",
        MAIL_SERVER=settings.SMTP_HOST,
        MAIL_PORT=settings.SMTP_PORT,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
    )


async def _send_email_async(to_email: EmailStr, subject: str, html_body: str) -> None:
    if not settings.SMTP_HOST or not settings.SMTP_PORT or not settings.EMAIL_FROM:
        logger.warning("SMTP/EMAIL_FROM no configurado. Email NO enviado (modo dev).")
        return

    conf = _build_mail_conf()
    fm = FastMail(conf)

    message = MessageSchema(
        subject=subject,
        recipients=[to_email],
        body=html_body,
        subtype="html",
    )

    await fm.send_message(message)
    logger.info("Email enviado a %s (subject=%s)", to_email, subject)


def send_email(to_email: EmailStr, subject: str, html_body: str) -> None:
    """
    Enviar email HTML - versión síncrona que ejecuta el async.
    Requiere SMTP_* y EMAIL_FROM configurados en .env
    """
    try:
        asyncio.run(_send_email_async(to_email, subject, html_body))
    except Exception as e:
        logger.error("Error enviando email a %s: %s", to_email, e)