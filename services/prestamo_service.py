import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from models.libro import Libro, LibroEstado
from models.prestamo import Prestamo, PrestamoEstado
from models.user import User

logger = logging.getLogger("biblioteca")


def prestar_libro(db: Session, user: User, libro_id: int) -> Prestamo:
    # [MODIFICADO]

    stmt = select(Libro).where(Libro.id == libro_id).with_for_update()
    libro = db.execute(stmt).scalars().first()

    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")

    if libro.estado != LibroEstado.DISPONIBLE:
        raise HTTPException(status_code=400, detail="Libro no disponible")

    prestamo = Prestamo(
        user_id=user.id,
        libro_id=libro.id,
        estado=PrestamoEstado.ACTIVO,
    )

    db.add(prestamo)

    libro.estado = LibroEstado.PRESTADO

    db.commit()
    db.refresh(prestamo)

    return prestamo


def devolver_libro(db: Session, user: User, prestamo_id: int) -> Prestamo:
    # [MODIFICADO]

    prestamo = db.query(Prestamo).filter(Prestamo.id == prestamo_id).first()

    if not prestamo:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")

    if prestamo.user_id != user.id and user.rol.value != "ADMIN":
        raise HTTPException(status_code=403, detail="No autorizado")

    if prestamo.estado != PrestamoEstado.ACTIVO:
        raise HTTPException(status_code=400, detail="Préstamo ya devuelto")

    stmt = select(Libro).where(Libro.id == prestamo.libro_id).with_for_update()
    libro = db.execute(stmt).scalars().first()

    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")

    prestamo.estado = PrestamoEstado.DEVUELTO
    prestamo.devuelto_en = datetime.now(timezone.utc)

    libro.estado = LibroEstado.DISPONIBLE

    db.commit()
    db.refresh(prestamo)

    return prestamo


def mis_prestamos(db: Session, user: User) -> list[Prestamo]:
    # [NUEVO]
    return (
        db.query(Prestamo)
        .filter(Prestamo.user_id == user.id)
        .order_by(Prestamo.id.desc())
        .all()
    )


def listar_todos(db: Session) -> list[Prestamo]:
    # [NUEVO]
    return db.query(Prestamo).order_by(Prestamo.id.desc()).all()