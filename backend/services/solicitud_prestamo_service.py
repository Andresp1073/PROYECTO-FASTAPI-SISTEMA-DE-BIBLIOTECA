from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.solicitud_prestamo import SolicitudPrestamo, SolicitudEstado
from models.notificacion import Notificacion, NotificacionTipo
from models.prestamo import Prestamo, PrestamoEstado
from models.libro import Libro, LibroEstado
from models.user import User


def crear_solicitud(db: Session, usuario_id: int, libro_id: int) -> SolicitudPrestamo:
    # Verificar que el libro existe y está disponible
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    
    if libro.estado != LibroEstado.DISPONIBLE:
        raise HTTPException(status_code=400, detail="El libro no está disponible")
    
    # Verificar que no hay una solicitud pendiente para este libro del mismo usuario
    solicitud_existente = db.query(SolicitudPrestamo).filter(
        SolicitudPrestamo.usuario_id == usuario_id,
        SolicitudPrestamo.libro_id == libro_id,
        SolicitudPrestamo.estado == SolicitudEstado.PENDIENTE
    ).first()
    
    if solicitud_existente:
        raise HTTPException(status_code=400, detail="Ya tienes una solicitud pendiente para este libro")
    
    # Crear la solicitud
    solicitud = SolicitudPrestamo(
        usuario_id=usuario_id,
        libro_id=libro_id,
        estado=SolicitudEstado.PENDIENTE
    )
    db.add(solicitud)
    db.commit()
    db.refresh(solicitud)
    
    # Notificar al admin (todos los admins)
    admins = db.query(User).filter(User.rol == "ADMIN").all()
    for admin in admins:
        notificacion = Notificacion(
            usuario_id=admin.id,
            tipo=NotificacionTipo.SOLICITUD_PRESTAMO,
            titulo="Nueva solicitud de préstamo",
            mensaje=f"El usuario ha solicitado el libro: {libro.titulo}",
            referencia_id=solicitud.id,
            referencia_tipo="solicitud"
        )
        db.add(notificacion)
    
    db.commit()
    
    return solicitud


def listar_solicitudes_pendientes(db: Session):
    return db.query(SolicitudPrestamo).filter(
        SolicitudPrestamo.estado == SolicitudEstado.PENDIENTE
    ).order_by(SolicitudPrestamo.created_at.desc()).all()


def aprobar_solicitud(db: Session, solicitud_id: int, admin_id: int) -> SolicitudPrestamo:
    solicitud = db.query(SolicitudPrestamo).filter(SolicitudPrestamo.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if solicitud.estado != SolicitudEstado.PENDIENTE:
        raise HTTPException(status_code=400, detail="La solicitud ya fue procesada")
    
    # Obtener el libro
    libro = db.query(Libro).filter(Libro.id == solicitud.libro_id).first()
    if not libro or libro.estado != LibroEstado.DISPONIBLE:
        raise HTTPException(status_code=400, detail="El libro ya no está disponible")
    
    # Crear el préstamo
    prestamo = Prestamo(
        user_id=solicitud.usuario_id,
        libro_id=solicitud.libro_id,
        estado=PrestamoEstado.ACTIVO
    )
    db.add(prestamo)
    
    # Marcar libro como prestado
    libro.estado = LibroEstado.PRESTADO
    
    # Actualizar la solicitud
    solicitud.estado = SolicitudEstado.APROBADO
    solicitud.procesado_por_id = admin_id
    solicitud.procesado_at = datetime.now(timezone.utc)
    
    # Notificar al usuario
    notificacion = Notificacion(
        usuario_id=solicitud.usuario_id,
        tipo=NotificacionTipo.SOLICITUD_APROBADA,
        titulo="Solicitud aprobada",
        mensaje=f"Tu solicitud de préstamo del libro '{libro.titulo}' ha sido aprobada. Puedes pasar a buscarlo a la biblioteca.",
        referencia_id=solicitud.id,
        referencia_tipo="solicitud"
    )
    db.add(notificacion)
    
    db.commit()
    db.refresh(solicitud)
    
    return solicitud


def rechazar_solicitud(db: Session, solicitud_id: int, admin_id: int, nota_rechazo: str | None = None) -> SolicitudPrestamo:
    solicitud = db.query(SolicitudPrestamo).filter(SolicitudPrestamo.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if solicitud.estado != SolicitudEstado.PENDIENTE:
        raise HTTPException(status_code=400, detail="La solicitud ya fue procesada")
    
    # Obtener el libro para el mensaje
    libro = db.query(Libro).filter(Libro.id == solicitud.libro_id).first()
    
    # Actualizar la solicitud
    solicitud.estado = SolicitudEstado.RECHAZADO
    solicitud.procesado_por_id = admin_id
    solicitud.procesado_at = datetime.now(timezone.utc)
    solicitud.nota_rechazo = nota_rechazo
    
    # Notificar al usuario
    mensaje = f"Tu solicitud de préstamo del libro '{libro.titulo}' ha sido rechazada."
    if nota_rechazo:
        mensaje += f" Motivo: {nota_rechazo}"
    
    notificacion = Notificacion(
        usuario_id=solicitud.usuario_id,
        tipo=NotificacionTipo.SOLICITUD_RECHAZADA,
        titulo="Solicitud rechazada",
        mensaje=mensaje,
        referencia_id=solicitud.id,
        referencia_tipo="solicitud"
    )
    db.add(notificacion)
    
    db.commit()
    db.refresh(solicitud)
    
    return solicitud


def mis_solicitudes(db: Session, usuario_id: int):
    return db.query(SolicitudPrestamo).filter(
        SolicitudPrestamo.usuario_id == usuario_id
    ).order_by(SolicitudPrestamo.created_at.desc()).all()
