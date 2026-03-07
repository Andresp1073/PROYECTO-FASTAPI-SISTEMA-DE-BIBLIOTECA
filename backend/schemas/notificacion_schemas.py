from datetime import datetime
from pydantic import BaseModel
from models.notificacion import NotificacionTipo


class NotificacionRead(BaseModel):
    id: int
    usuario_id: int
    tipo: NotificacionTipo
    titulo: str
    mensaje: str
    referencia_id: int | None
    referencia_tipo: str | None
    leida: bool
    created_at: datetime

    class Config:
        from_attributes = True
