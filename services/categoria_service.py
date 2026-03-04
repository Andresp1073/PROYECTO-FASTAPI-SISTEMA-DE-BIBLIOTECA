from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.categoria import Categoria
from schemas.categoria_schemas import CategoriaCreate, CategoriaUpdate


def create_categoria(db: Session, payload: CategoriaCreate) -> Categoria:
    # [NUEVO]
    nombre = payload.nombre.strip()
    exists = db.query(Categoria).filter(Categoria.nombre == nombre).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Categoría ya existe")

    cat = Categoria(nombre=nombre, descripcion=payload.descripcion)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def list_categorias(db: Session) -> list[Categoria]:
    # [NUEVO]
    return db.query(Categoria).order_by(Categoria.id.asc()).all()


def get_categoria(db: Session, categoria_id: int) -> Categoria:
    # [NUEVO]
    cat = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return cat


def update_categoria(db: Session, categoria_id: int, payload: CategoriaUpdate) -> Categoria:
    # [NUEVO]
    cat = get_categoria(db, categoria_id)

    if payload.nombre is not None:
        nombre = payload.nombre.strip()
        other = db.query(Categoria).filter(Categoria.nombre == nombre, Categoria.id != categoria_id).first()
        if other:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nombre ya en uso")
        cat.nombre = nombre

    if payload.descripcion is not None:
        cat.descripcion = payload.descripcion

    db.commit()
    db.refresh(cat)
    return cat


def delete_categoria(db: Session, categoria_id: int) -> None:
    # [NUEVO]
    cat = get_categoria(db, categoria_id)
    db.delete(cat)
    db.commit()