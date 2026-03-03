from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from database import Base


class PrestamoEstado(str, enum.Enum):
    ACTIVO = "ACTIVO"
    DEVUELTO = "DEVUELTO"


class Prestamo(Base):
    __tablename__ = "prestamos"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    libro_id = Column(Integer, ForeignKey("libros.id", ondelete="CASCADE"), nullable=False)

    prestado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    devuelto_en = Column(DateTime(timezone=True), nullable=True)

    estado = Column(Enum(PrestamoEstado), nullable=False, default=PrestamoEstado.ACTIVO)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="prestamos")
    libro = relationship("Libro", back_populates="prestamos")