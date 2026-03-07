from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from database import Base


class NotificacionTipo(str, enum.Enum):
    SOLICITUD_PRESTAMO = "SOLICITUD_PRESTAMO"  # Nueva solicitud de préstamo
    SOLICITUD_APROBADA = "SOLICITUD_APROBADA"  # Solicitud aprobada
    SOLICITUD_RECHAZADA = "SOLICITUD_RECHAZADA"  # Solicitud rechazada
    PRESTAMO_VENCIDO = "PRESTAMO_VENCIDO"  # Préstamo vencido
    PRESTAMO_DEVUELTO = "PRESTAMO_DEVUELTO"  # Préstamo/devolución confirmada


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Tipo de notificación
    tipo = Column(Enum(NotificacionTipo), nullable=False)
    
    # Título y mensaje
    titulo = Column(String(255), nullable=False)
    mensaje = Column(Text, nullable=False)
    
    # Referencia opcional (ej: ID de la solicitud)
    referencia_id = Column(Integer, nullable=True)
    referencia_tipo = Column(String(50), nullable=True)  # ej: "solicitud", "prestamo"
    
    # Estado
    leida = Column(Boolean, nullable=False, default=False)
    
    # Fechas
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relaciones
    usuario = relationship("User", back_populates="notificaciones")
