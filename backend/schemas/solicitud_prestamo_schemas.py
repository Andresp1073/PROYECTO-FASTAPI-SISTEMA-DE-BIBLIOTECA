from datetime import datetime
from pydantic import BaseModel
from models.solicitud_prestamo import SolicitudEstado


class SolicitudPrestamoCreate(BaseModel):
    libro_id: int


class SolicitudPrestamoRead(BaseModel):
    id: int
    usuario_id: int
    libro_id: int
    estado: SolicitudEstado
    nota_rechazo: str | None
    created_at: datetime
    procesado_at: datetime | None

    class Config:
        from_attributes = True


class SolicitudPrestamoAdminRead(BaseModel):
    id: int
    usuario_id: int
    usuario_nombre: str
    usuario_email: str
    usuario_documento: str | None
    libro_id: int
    libro_titulo: str
    estado: SolicitudEstado
    nota_rechazo: str | None
    created_at: datetime
    procesado_at: datetime | None

    class Config:
        from_attributes = True


class SolicitudProcesar(BaseModel):
    accion: str  # "aprobar" o "rechazar"
    nota_rechazo: str | None = None
