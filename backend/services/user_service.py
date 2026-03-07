from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.user import User, UserRol
from core.security import hash_password


def create_user(db: Session, nombre: str, email: str, password: str, documento: str | None = None) -> User:
    # [NUEVO]
    email_norm = email.strip().lower()
    exists = db.query(User).filter(User.email == email_norm).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email ya registrado")

    user = User(
        nombre=nombre.strip(),
        email=email_norm,
        password_hash=hash_password(password),
        documento=documento.strip() if documento else None,
        rol=UserRol.USUARIO,
        is_active=True,
        is_email_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    # [NUEVO]
    return db.query(User).filter(User.email == email.strip().lower()).first()


def list_users(db: Session) -> list[User]:
    # [NUEVO]
    return db.query(User).order_by(User.id.asc()).all()


def get_user_by_id(db: Session, user_id: int) -> User:
    # [NUEVO]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return user


def update_user_admin(
    db: Session,
    user_id: int,
    nombre: str | None = None,
    email: str | None = None,
    documento: str | None = None,
    is_active: bool | None = None,
    is_email_verified: bool | None = None,
    rol: UserRol | None = None,
) -> User:
    # [NUEVO]
    user = get_user_by_id(db, user_id)

    if nombre is not None:
        user.nombre = nombre.strip()

    if email is not None:
        email_norm = email.strip().lower()
        other = db.query(User).filter(User.email == email_norm, User.id != user_id).first()
        if other:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email ya en uso")
        user.email = email_norm

    if documento is not None:
        user.documento = documento.strip() if documento else None

    if is_active is not None:
        user.is_active = is_active

    if is_email_verified is not None:
        user.is_email_verified = is_email_verified

    if rol is not None:
        user.rol = rol

    db.commit()
    db.refresh(user)
    return user


def admin_reset_password(db: Session, user_id: int, new_password: str) -> None:
    # [NUEVO]
    user = get_user_by_id(db, user_id)
    user.password_hash = hash_password(new_password)
    db.commit()