from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from database import Base


class SolicitudEstado(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    APROBADO = "APROBADO"
    RECHAZADO = "RECHAZADO"
    CANCELADO = "CANCELADO"


class SolicitudPrestamo(Base):
    __tablename__ = "solicitudes_prestamo"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    libro_id = Column(Integer, ForeignKey("libros.id", ondelete="CASCADE"), nullable=False)
    
    # Admin que procesó la solicitud
    procesado_por_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Estado de la solicitud
    estado = Column(Enum(SolicitudEstado), nullable=False, default=SolicitudEstado.PENDIENTE)

    # Fechas
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    procesado_at = Column(DateTime(timezone=True), nullable=True)

    # Notas del admin
    nota_rechazo = Column(Text, nullable=True)

    # Relaciones
    usuario = relationship("User", foreign_keys=[usuario_id])
    libro = relationship("Libro")
    procesado_por = relationship("User", foreign_keys=[procesado_por_id])
