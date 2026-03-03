from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.user import User, UserRol
from core.security import hash_password


def create_user(db: Session, nombre: str, email: str, password: str) -> User:
    # [NUEVO]
    email_norm = email.strip().lower()
    exists = db.query(User).filter(User.email == email_norm).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email ya registrado")

    user = User(
        nombre=nombre.strip(),
        email=email_norm,
        password_hash=hash_password(password),
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