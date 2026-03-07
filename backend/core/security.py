import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from jose import jwt, JWTError
from passlib.context import CryptContext

from core.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    # [NUEVO]
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    # [NUEVO]
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    # [NUEVO]
    if not settings.JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY no configurado en .env")

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes if expires_minutes is not None else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": subject,
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token() -> str:
    # [NUEVO]
    # token aleatorio fuerte (no JWT)
    return secrets.token_urlsafe(48)


def hash_refresh_token(refresh_token: str) -> str:
    # [NUEVO]
    # Guardamos SOLO el hash en BD
    return hashlib.sha256(refresh_token.encode("utf-8")).hexdigest()


def decode_access_token(token: str) -> Dict[str, Any]:
    # [NUEVO]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise JWTError("Token type inválido")
        return payload
    except JWTError as e:
        raise e


def build_refresh_cookie_kwargs() -> dict:
    # [MODIFICADO]
    is_prod = settings.ENV.upper() == "PROD"
    return {
        "httponly": True,
        "secure": True if is_prod else False,  # en DEV permite localhost sin https
        "samesite": "lax",
        "path": "/",
        "domain": "localhost",  # Permite cookies entre puertos de localhost
    }