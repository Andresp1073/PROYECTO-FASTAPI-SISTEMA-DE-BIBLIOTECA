import logging
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from core.settings import settings
from models.user import User, UserRol

logger = logging.getLogger("biblioteca")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _clean_password(raw: str) -> str:
    """
    Limpia espacios y comillas típicas del .env.
    """
    if raw is None:
        return ""
    pw = str(raw)

    # quitar BOM / caracteres invisibles comunes
    pw = pw.replace("\ufeff", "")

    pw = pw.strip()

    # quitar comillas si existen
    if (pw.startswith('"') and pw.endswith('"')) or (pw.startswith("'") and pw.endswith("'")):
        pw = pw[1:-1].strip()

    return pw


def seed_admin(db: Session) -> None:
    admin_email = (settings.ADMIN_EMAIL or "").strip().lower()
    admin_password = _clean_password(settings.ADMIN_PASSWORD or "")

    if not admin_email or not admin_password:
        logger.warning("ADMIN_EMAIL o ADMIN_PASSWORD no configurados. Seed ADMIN omitido.")
        return

    pw_bytes_len = len(admin_password.encode("utf-8"))
    logger.info("Seed ADMIN: password bytes_len=%s", pw_bytes_len)

    # bcrypt: máximo 72 bytes
    if pw_bytes_len > 72:
        raise ValueError(
            "ADMIN_PASSWORD supera 72 bytes (límite bcrypt). "
            "Revisa caracteres invisibles o usa una contraseña más corta."
        )

    exists = db.query(User).filter(User.email == admin_email).first()
    if exists:
        logger.info("ADMIN ya existe: %s", admin_email)
        return

    user = User(
        nombre="Administrador",
        email=admin_email,
        password_hash=pwd_context.hash(admin_password),
        rol=UserRol.ADMIN,
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    db.commit()
    logger.info("ADMIN seeded: %s", admin_email)