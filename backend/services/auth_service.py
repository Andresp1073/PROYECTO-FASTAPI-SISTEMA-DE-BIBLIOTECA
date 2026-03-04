import logging
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    build_refresh_cookie_kwargs,
    hash_password,
)
from core.settings import settings
from models.auth_token import AuthToken
from models.user import User
from models.email_token import EmailTokenTipo
from services.user_service import get_user_by_email
from services.email_token_service import (
    create_email_token,
    consume_email_token,
    build_verify_email_link,
    build_reset_password_link,
)
from core.email import send_email

logger = logging.getLogger("biblioteca")

REFRESH_COOKIE_NAME = "refresh_token"


def _refresh_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    # [NUEVO]
    kwargs = build_refresh_cookie_kwargs()
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=max_age,
        **kwargs,
    )


def clear_refresh_cookie(response: Response) -> None:
    # [NUEVO]
    kwargs = build_refresh_cookie_kwargs()
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path=kwargs.get("path", "/"),
    )


def register(db: Session, nombre: str, email: str, password: str) -> None:
    # [NUEVO]
    from services.user_service import create_user  # import local para evitar ciclos

    user = create_user(db, nombre=nombre, email=email, password=password)

    # token verify email
    raw = create_email_token(db, user=user, tipo=EmailTokenTipo.VERIFY_EMAIL, expires_minutes=60 * 24)
    link = build_verify_email_link(raw)

    html = f"""
    <h2>Verifica tu email</h2>
    <p>Hola {user.nombre},</p>
    <p>Para verificar tu email haz clic aquí:</p>
    <p><a href="{link}">Verificar Email</a></p>
    """

    # async caller in router (await)
    return user, html, user.email  # type: ignore


def authenticate_user(db: Session, email: str, password: str) -> User:
    # [NUEVO]
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inactivo")

    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    return user


def issue_tokens(db: Session, response: Response, user: User) -> str:
    # [NUEVO]
    access = create_access_token(subject=str(user.id))
    refresh = create_refresh_token()

    row = AuthToken(
        refresh_token_hash=hash_refresh_token(refresh),
        user_id=user.id,
        is_revoked=False,
        expires_at=_refresh_expires_at(),
    )
    db.add(row)
    db.commit()

    set_refresh_cookie(response, refresh)
    return access


def refresh_access_token(db: Session, request: Request, response: Response) -> str:
    # [NUEVO]
    raw = request.cookies.get(REFRESH_COOKIE_NAME)
    if not raw:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")

    token_hash = hash_refresh_token(raw)
    row = db.query(AuthToken).filter(AuthToken.refresh_token_hash == token_hash).first()
    if not row or row.is_revoked:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh inválido")

    now = datetime.now(timezone.utc)
    exp = row.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < now:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh expirado")

    # Rotación: revocar actual y emitir nuevo
    row.is_revoked = True
    db.commit()

    user = db.query(User).filter(User.id == row.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no existe")

    access = create_access_token(subject=str(user.id))
    new_refresh = create_refresh_token()

    new_row = AuthToken(
        refresh_token_hash=hash_refresh_token(new_refresh),
        user_id=user.id,
        is_revoked=False,
        expires_at=_refresh_expires_at(),
    )
    db.add(new_row)
    db.commit()

    set_refresh_cookie(response, new_refresh)
    return access


def logout(db: Session, request: Request, response: Response) -> None:
    # [NUEVO]
    raw = request.cookies.get(REFRESH_COOKIE_NAME)
    if raw:
        token_hash = hash_refresh_token(raw)
        row = db.query(AuthToken).filter(AuthToken.refresh_token_hash == token_hash).first()
        if row:
            row.is_revoked = True
            db.commit()

    clear_refresh_cookie(response)


def verify_email(db: Session, token: str) -> None:
    # [NUEVO]
    user = consume_email_token(db, raw_token=token, tipo=EmailTokenTipo.VERIFY_EMAIL)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido o expirado")

    user.is_email_verified = True
    db.commit()


async def request_reset_password(db: Session, email: str) -> None:
    # [NUEVO]
    user = get_user_by_email(db, email)
    # No revelar si existe o no (seguridad)
    if not user:
        return

    raw = create_email_token(db, user=user, tipo=EmailTokenTipo.RESET_PASSWORD, expires_minutes=30)
    link = build_reset_password_link(raw)

    html = f"""
    <h2>Recuperación de contraseña</h2>
    <p>Hola {user.nombre},</p>
    <p>Para restablecer tu contraseña haz clic aquí:</p>
    <p><a href="{link}">Restablecer contraseña</a></p>
    <p>Este link expira en 30 minutos.</p>
    """

    await send_email(user.email, "Reset Password", html)


def reset_password(db: Session, token: str, new_password: str) -> None:
    # [NUEVO]
    user = consume_email_token(db, raw_token=token, tipo=EmailTokenTipo.RESET_PASSWORD)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido o expirado")

    user.password_hash = hash_password(new_password)
    db.commit()