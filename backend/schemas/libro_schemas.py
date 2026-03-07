from datetime import datetime
from pydantic import BaseModel, Field

from models.libro import LibroEstado


class MessageResponse(BaseModel):
    message: str


class LibroCreate(BaseModel):
    titulo: str = Field(..., min_length=2, max_length=255)
    autor: str = Field(..., min_length=2, max_length=255)
    isbn: str = Field(..., min_length=5, max_length=32)
    resumen: str | None = None
    categoria_id: int | None = None


class LibroUpdate(BaseModel):
    titulo: str | None = Field(default=None, min_length=2, max_length=255)
    autor: str | None = Field(default=None, min_length=2, max_length=255)
    isbn: str | None = Field(default=None, min_length=5, max_length=32)
    resumen: str | None = None
    categoria_id: int | None = None
    estado: LibroEstado | None = None
    cover_url: str | None = Field(default=None, max_length=500)


class CategoriaSimple(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class LibroRead(BaseModel):
    id: int
    titulo: str
    autor: str
    isbn: str
    resumen: str | None
    cover_url: str | None
    categoria_id: int | None
    estado: LibroEstado
    created_at: datetime
    categoria: CategoriaSimple | None = None

    class Config:
        from_attributes = True