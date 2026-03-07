from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from models.libro import Libro, LibroEstado
from models.prestamo import Prestamo, PrestamoEstado
from models.user import User
from models.notificacion import Notificacion, NotificacionTipo


def prestar_libro(db: Session, user_id: int, libro_id: int) -> Prestamo:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no existe")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    libro = (
        db.query(Libro)
        .filter(Libro.id == libro_id)
        .with_for_update()
        .first()
    )
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no existe")

    if libro.estado != LibroEstado.DISPONIBLE:
        raise HTTPException(status_code=400, detail="Libro no disponible para préstamo")

    libro.estado = LibroEstado.PRESTADO

    prestamo = Prestamo(
        user_id=user.id,
        libro_id=libro.id,
        estado=PrestamoEstado.ACTIVO,
        prestado_en=datetime.now(timezone.utc),
    )

    db.add(prestamo)
    db.flush()
    db.refresh(prestamo, ["libro"])
    db.commit()
    return prestamo


def prestar_libro_admin(db: Session, user_id: int, libro_id: int) -> Prestamo:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no existe")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    libro = (
        db.query(Libro)
        .filter(Libro.id == libro_id)
        .with_for_update()
        .first()
    )
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no existe")

    if libro.estado != LibroEstado.DISPONIBLE:
        raise HTTPException(status_code=400, detail="Libro no disponible para préstamo")

    libro.estado = LibroEstado.PRESTADO

    prestamo = Prestamo(
        user_id=user.id,
        libro_id=libro.id,
        estado=PrestamoEstado.ACTIVO,
        prestado_en=datetime.now(timezone.utc),
    )

    db.add(prestamo)
    db.flush()
    db.refresh(prestamo, ["libro"])
    db.commit()
    return prestamo


def devolver_prestamo(db: Session, user_id: int, prestamo_id: int, is_admin: bool = False) -> Prestamo:
    prestamo = db.query(Prestamo).filter(Prestamo.id == prestamo_id).first()
    if not prestamo:
        raise HTTPException(status_code=404, detail="Préstamo no existe")

    if not is_admin and prestamo.user_id != user_id:
        raise HTTPException(status_code=403, detail="No autorizado")

    if prestamo.estado != PrestamoEstado.ACTIVO:
        raise HTTPException(status_code=400, detail="El préstamo no está activo")

    libro = (
        db.query(Libro)
        .filter(Libro.id == prestamo.libro_id)
        .with_for_update()
        .first()
    )
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no existe")

    prestamo.estado = PrestamoEstado.DEVUELTO
    prestamo.devuelto_en = datetime.now(timezone.utc)

    libro.estado = LibroEstado.DISPONIBLE

    if is_admin:
        notificacion = Notificacion(
            usuario_id=prestamo.user_id,
            tipo=NotificacionTipo.PRESTAMO_DEVUELTO,
            titulo="Devolución confirmada",
            mensaje=f"La devolución del libro '{libro.titulo}' ha sido confirmada por el administrador.",
            referencia_id=prestamo.id,
            referencia_tipo="prestamo"
        )
        db.add(notificacion)

    db.commit()
    db.refresh(prestamo)
    return prestamo


def listar_mis_prestamos(db: Session, user_id: int) -> list[Prestamo]:
    return (
        db.query(Prestamo)
        .options(joinedload(Prestamo.libro))
        .filter(Prestamo.user_id == user_id)
        .order_by(Prestamo.prestado_en.desc())
        .all()
    )


def listar_prestamos_admin(
    db: Session,
    estado: str | None = None,
    user_id: int | None = None,
    libro_id: int | None = None,
) -> list[dict]:
    """
    Lista global para ADMIN, con info básica de usuario y libro.
    Devuelve lista de dicts para mapear a PrestamoAdminRead.
    """
    q = (
        db.query(Prestamo, User, Libro)
        .join(User, Prestamo.user_id == User.id)
        .join(Libro, Prestamo.libro_id == Libro.id)
    )

    if estado:
        q = q.filter(Prestamo.estado == estado)
    if user_id:
        q = q.filter(Prestamo.user_id == user_id)
    if libro_id:
        q = q.filter(Prestamo.libro_id == libro_id)

    rows = q.order_by(Prestamo.prestado_en.desc()).all()

    result: list[dict] = []
    for prestamo, user, libro in rows:
        result.append(
            {
                "id": prestamo.id,
                "user_id": user.id,
                "user_email": user.email,
                "user_nombre": user.nombre,
                "libro_id": libro.id,
                "libro_titulo": libro.titulo,
                "prestado_en": prestamo.prestado_en,
                "devuelto_en": prestamo.devuelto_en,
                "estado": prestamo.estado,
                "created_at": prestamo.created_at,
            }
        )
    return result