from pydantic import BaseModel, Field


class BulkLibroRow(BaseModel):
    titulo: str = Field(..., min_length=2, max_length=255)
    autor: str = Field(..., min_length=2, max_length=255)
    isbn: str = Field(..., min_length=5, max_length=32)
    resumen: str | None = None
    categoria_nombre: str | None = None