from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from database import Base


class LibroEstado(str, enum.Enum):
    DISPONIBLE = "DISPONIBLE"
    PRESTADO = "PRESTADO"


class Libro(Base):
    __tablename__ = "libros"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False, index=True)
    autor = Column(String(255), nullable=False, index=True)
    isbn = Column(String(32), unique=True, index=True, nullable=False)

    resumen = Column(Text, nullable=True)
    cover_url = Column(String(500), nullable=True)

    categoria_id = Column(Integer, ForeignKey("categorias.id", ondelete="SET NULL"), nullable=True)

    estado = Column(Enum(LibroEstado), nullable=False, default=LibroEstado.DISPONIBLE)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    categoria = relationship("Categoria", back_populates="libros")
    prestamos = relationship("Prestamo", back_populates="libro")