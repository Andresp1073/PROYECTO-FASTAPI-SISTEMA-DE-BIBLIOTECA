from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from core.deps import get_current_user, require_admin
from models.user import User
from schemas.categoria_schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead, MessageResponse
from services import categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.post("/", response_model=CategoriaRead)
def create(
    payload: CategoriaCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return categoria_service.create_categoria(db, payload)


@router.get("/", response_model=list[CategoriaRead])
def list_all(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return categoria_service.list_categorias(db)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def get_one(
    categoria_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return categoria_service.get_categoria(db, categoria_id)


@router.put("/{categoria_id}", response_model=CategoriaRead)
def update(
    categoria_id: int,
    payload: CategoriaUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return categoria_service.update_categoria(db, categoria_id, payload)


@router.delete("/{categoria_id}", response_model=MessageResponse)
def delete(
    categoria_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    categoria_service.delete_categoria(db, categoria_id)
    return {"message": "Categoría eliminada"}