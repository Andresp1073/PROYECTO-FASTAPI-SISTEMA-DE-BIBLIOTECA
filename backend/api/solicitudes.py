from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from core.deps import get_current_user, require_admin
from models.user import User

from schemas.solicitud_prestamo_schemas import (
    SolicitudPrestamoCreate,
    SolicitudPrestamoRead,
    SolicitudPrestamoAdminRead,
    SolicitudProcesar,
)
from schemas.notificacion_schemas import NotificacionRead

from services import solicitud_prestamo_service, notificacion_service

router = APIRouter(prefix="/solicitudes", tags=["Solicitudes"])


@router.post("/prestar", response_model=SolicitudPrestamoRead)
def solicitar_prestamo(
    payload: SolicitudPrestamoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return solicitud_prestamo_service.crear_solicitud(
        db, current_user.id, payload.libro_id
    )


@router.get("/mis-solicitudes", response_model=list[SolicitudPrestamoRead])
def mis_solicitudes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return solicitud_prestamo_service.mis_solicitudes(db, current_user.id)


# Endpoints de ADMIN

@router.get("/admin", response_model=list[SolicitudPrestamoAdminRead])
def listar_solicitudes(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    solicitudes = solicitud_prestamo_service.listar_solicitudes_pendientes(db)
    
    result = []
    for s in solicitudes:
        result.append({
            "id": s.id,
            "usuario_id": s.usuario_id,
            "usuario_nombre": s.usuario.nombre,
            "usuario_email": s.usuario.email,
            "usuario_documento": s.usuario.documento,
            "libro_id": s.libro_id,
            "libro_titulo": s.libro.titulo if s.libro else "",
            "estado": s.estado,
            "nota_rechazo": s.nota_rechazo,
            "created_at": s.created_at,
            "procesado_at": s.procesado_at,
        })
    
    return result


@router.post("/admin/{solicitud_id}/procesar", response_model=SolicitudPrestamoRead)
def procesar_solicitud(
    solicitud_id: int,
    payload: SolicitudProcesar,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if payload.accion == "aprobar":
        return solicitud_prestamo_service.aprobar_solicitud(
            db, solicitud_id, current_user.id
        )
    elif payload.accion == "rechazar":
        return solicitud_prestamo_service.rechazar_solicitud(
            db, solicitud_id, current_user.id, payload.nota_rechazo
        )
    else:
        raise HTTPException(status_code=400, detail="Acción inválida")


# Notificaciones

@router.get("/notificaciones", response_model=list[NotificacionRead])
def mis_notificaciones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notificacion_service.get_notificaciones_usuario(db, current_user.id)


@router.get("/notificaciones/no-leidas")
def notificaciones_no_leidas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notificaciones = notificacion_service.get_notificaciones_no_leidas(db, current_user.id)
    return {"count": len(notificaciones)}


@router.post("/notificaciones/{notificacion_id}/leer")
def marcar_leida(
    notificacion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notificacion_service.marcar_notificacion_leida(
        db, notificacion_id, current_user.id
    )


@router.post("/notificaciones/leer-todas")
def marcar_todas_leidas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notificacion_service.marcar_todas_leidas(db, current_user.id)
    return {"message": "Notificaciones marcadas como leídas"}
