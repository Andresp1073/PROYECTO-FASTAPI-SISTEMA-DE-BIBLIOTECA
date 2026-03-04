import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from core.settings import settings
from models.email_token import EmailToken, EmailTokenTipo
from models.user import User

logger = logging.getLogger("biblioteca")


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_raw_token() -> str:
    """
    Token aleatorio (se envía al usuario). En BD se guarda el hash.
    """
    return secrets.token_urlsafe(48)


def create_email_token(
    db: Session,
    user: User,
    tipo: EmailTokenTipo,
    expires_minutes: int = 60,
) -> str:
    """
    Crea un token de email (VERIFY_EMAIL o RESET_PASSWORD).
    Retorna el token raw (para enviarlo por email).
    """
    raw = generate_raw_token()
    token_hash = _hash_token(raw)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)

    row = EmailToken(
        token_hash=token_hash,
        user_id=user.id,
        tipo=tipo,
        expires_at=expires_at,
        used_at=None,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    logger.info("EmailToken creado tipo=%s user_id=%s exp=%s", tipo.value, user.id, expires_at.isoformat())
    return raw


def consume_email_token(
    db: Session,
    raw_token: str,
    tipo: EmailTokenTipo,
) -> Optional[User]:
    """
    Valida el token (hash), verifica expiración y que no esté usado.
    Si es válido, marca used_at y retorna el usuario.
    """
    token_hash = _hash_token(raw_token)
    now = datetime.now(timezone.utc)

    row = (
        db.query(EmailToken)
        .filter(
            EmailToken.token_hash == token_hash,
            EmailToken.tipo == tipo,
            EmailToken.used_at.is_(None),
        )
        .first()
    )

    if not row:
        return None

    # expires_at puede venir naive según driver; normalizamos si hace falta
    exp = row.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)

    if exp < now:
        return None

    row.used_at = now
    db.commit()

    user = db.query(User).filter(User.id == row.user_id).first()
    return user


def build_verify_email_link(raw_token: str) -> str:
    """
    Link que irá al frontend (tu frontend debe manejar esta ruta).
    """
    return f"{settings.FRONTEND_URL}/verify-email?token={raw_token}"


def build_reset_password_link(raw_token: str) -> str:
    """
    Link que irá al frontend (tu frontend debe manejar esta ruta).
    """
    return f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"