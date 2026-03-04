from datetime import datetime
from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    message: str


class CategoriaCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=120)
    descripcion: str | None = None


class CategoriaUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    descripcion: str | None = None


class CategoriaRead(BaseModel):
    id: int
    nombre: str
    descripcion: str | None
    created_at: datetime

    class Config:
        from_attributes = True