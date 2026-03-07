from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from core.deps import require_admin
from models.user import User
from schemas.user_schemas import UserRead, UserUpdate, UserAdminResetPassword, MessageResponse
from services import user_service

router = APIRouter(prefix="/users", tags=["Users (Admin)"])


@router.get("/", response_model=list[UserRead])
def list_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.list_users(db)


@router.get("/buscar", response_model=list[UserRead])
def buscar_usuarios(
    documento: str | None = Query(default=None, description="Buscar por documento"),
    q: str | None = Query(default=None, description="Buscar por nombre o email"),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Buscar usuarios por documento, nombre o email"""
    query = db.query(User)
    
    if documento:
        query = query.filter(User.documento.ilike(f"%{documento}%"))
    elif q:
        query = query.filter(
            (User.nombre.ilike(f"%{q}%")) | 
            (User.email.ilike(f"%{q}%"))
        )
    
    return query.limit(20).all()


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.get_user_by_id(db, user_id)


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.update_user_admin(
        db,
        user_id=user_id,
        nombre=payload.nombre,
        email=payload.email,
        documento=payload.documento,
        is_active=payload.is_active,
        is_email_verified=payload.is_email_verified,
        rol=payload.rol,
    )


@router.post("/{user_id}/reset-password", response_model=MessageResponse)
def reset_password(
    user_id: int,
    payload: UserAdminResetPassword,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user_service.admin_reset_password(db, user_id, payload.new_password)
    return {"message": "Password reseteada correctamente"}