from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi import HTTPException, status

from models.libro import Libro, LibroEstado
from models.categoria import Categoria
from schemas.libro_schemas import LibroCreate, LibroUpdate


def create_libro(db: Session, payload: LibroCreate) -> Libro:
    # [NUEVO]
    isbn = payload.isbn.strip()
    exists = db.query(Libro).filter(Libro.isbn == isbn).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ISBN ya registrado")

    libro = Libro(
        titulo=payload.titulo.strip(),
        autor=payload.autor.strip(),
        isbn=isbn,
        resumen=payload.resumen,
        categoria_id=payload.categoria_id,
        estado=LibroEstado.DISPONIBLE,
    )
    db.add(libro)
    db.commit()
    db.refresh(libro)
    return libro


def get_libro(db: Session, libro_id: int) -> Libro:
    # [NUEVO]
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado")
    return libro


def list_libros(
    db: Session,
    q: str | None = None,
    categoria_id: int | None = None,
    estado: LibroEstado | None = None,
) -> list[Libro]:
    query = db.query(Libro).options(joinedload(Libro.categoria))

    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Libro.titulo.ilike(like),
                Libro.autor.ilike(like),
                Libro.isbn.ilike(like),
            )
        )

    if categoria_id is not None:
        query = query.filter(Libro.categoria_id == categoria_id)

    if estado is not None:
        query = query.filter(Libro.estado == estado)

    return query.order_by(Libro.id.asc()).all()


def update_libro(db: Session, libro_id: int, payload: LibroUpdate) -> Libro:
    # [NUEVO]
    libro = get_libro(db, libro_id)

    if payload.titulo is not None:
        libro.titulo = payload.titulo.strip()

    if payload.autor is not None:
        libro.autor = payload.autor.strip()

    if payload.isbn is not None:
        isbn = payload.isbn.strip()
        other = db.query(Libro).filter(Libro.isbn == isbn, Libro.id != libro_id).first()
        if other:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ISBN ya en uso")
        libro.isbn = isbn

    if payload.resumen is not None:
        libro.resumen = payload.resumen

    if payload.categoria_id is not None:
        libro.categoria_id = payload.categoria_id

    if payload.estado is not None:
        libro.estado = payload.estado

    if payload.cover_url is not None:
        libro.cover_url = payload.cover_url

    db.commit()
    db.refresh(libro)
    return libro


def delete_libro(db: Session, libro_id: int) -> None:
    # [NUEVO]
    libro = get_libro(db, libro_id)
    db.delete(libro)
    db.commit()