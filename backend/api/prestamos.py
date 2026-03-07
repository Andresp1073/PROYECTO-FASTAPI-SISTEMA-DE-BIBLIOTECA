from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from core.deps import get_current_user

from schemas.prestamo_schemas import (
    PrestamoCreate,
    PrestamoCreateAdmin,
    PrestamoRead,
    PrestamoAdminRead,
)

from services.prestamo_service import (
    prestar_libro,
    prestar_libro_admin,
    devolver_prestamo,
    listar_mis_prestamos,
    listar_prestamos_admin,
)

router = APIRouter(prefix="/prestamos", tags=["Prestamos"])


@router.post("", response_model=PrestamoRead)
def crear_prestamo(
    payload: PrestamoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    prestamo = prestar_libro(db, current_user.id, payload.libro_id)
    return prestamo


@router.post("/admin", response_model=PrestamoRead)
def crear_prestamo_admin(
    payload: PrestamoCreateAdmin,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="Solo ADMIN")

    prestamo = prestar_libro_admin(db, payload.user_id, payload.libro_id)
    return prestamo


@router.get("", response_model=list[PrestamoAdminRead])
def listar_todos_admin(
    estado: str | None = Query(default=None),
    user_id: int | None = Query(default=None),
    libro_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="Solo ADMIN")

    rows = listar_prestamos_admin(db, estado=estado, user_id=user_id, libro_id=libro_id)
    return rows


@router.put("/{prestamo_id}/devolver", response_model=PrestamoRead)
def devolver(
    prestamo_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    is_admin = current_user.rol == "ADMIN"
    prestamo = devolver_prestamo(db, current_user.id, prestamo_id, is_admin=is_admin)
    return prestamo


@router.get("/mis-prestamos", response_model=list[PrestamoRead])
def mis_prestamos(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return listar_mis_prestamos(db, current_user.id)