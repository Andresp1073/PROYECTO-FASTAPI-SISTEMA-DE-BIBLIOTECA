from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from core.deps import get_current_user, require_admin
from models.user import User
from models.libro import LibroEstado
from schemas.libro_schemas import LibroCreate, LibroUpdate, LibroRead, MessageResponse
from services import libro_service

router = APIRouter(prefix="/libros", tags=["Libros"])


@router.post("/", response_model=LibroRead)
def create(
    payload: LibroCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return libro_service.create_libro(db, payload)


@router.get("/", response_model=list[LibroRead])
def list_all(
    q: str | None = Query(default=None, description="Buscar en titulo/autor/isbn"),
    categoria_id: int | None = Query(default=None),
    estado: LibroEstado | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return libro_service.list_libros(db, q=q, categoria_id=categoria_id, estado=estado)


@router.get("/{libro_id}", response_model=LibroRead)
def get_one(
    libro_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return libro_service.get_libro(db, libro_id)


@router.put("/{libro_id}", response_model=LibroRead)
def update(
    libro_id: int,
    payload: LibroUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return libro_service.update_libro(db, libro_id, payload)


@router.delete("/{libro_id}", response_model=MessageResponse)
def delete(
    libro_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    libro_service.delete_libro(db, libro_id)
    return {"message": "Libro eliminado"}