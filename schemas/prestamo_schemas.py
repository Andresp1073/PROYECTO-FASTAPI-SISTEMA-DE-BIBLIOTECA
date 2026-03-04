from datetime import datetime
from pydantic import BaseModel

from models.prestamo import PrestamoEstado


class MessageResponse(BaseModel):
    message: str


class PrestamoCreate(BaseModel):
    libro_id: int


class PrestamoDevolver(BaseModel):
    prestamo_id: int


class PrestamoRead(BaseModel):
    id: int
    user_id: int
    libro_id: int
    prestado_en: datetime
    devuelto_en: datetime | None
    estado: PrestamoEstado
    created_at: datetime

    class Config:
        from_attributes = True