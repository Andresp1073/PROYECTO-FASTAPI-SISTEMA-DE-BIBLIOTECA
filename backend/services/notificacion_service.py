from sqlalchemy.orm import Session
from models.notificacion import Notificacion


def get_notificaciones_usuario(db: Session, usuario_id: int):
    return db.query(Notificacion).filter(
        Notificacion.usuario_id == usuario_id
    ).order_by(Notificacion.created_at.desc()).all()


def get_notificaciones_no_leidas(db: Session, usuario_id: int):
    return db.query(Notificacion).filter(
        Notificacion.usuario_id == usuario_id,
        Notificacion.leida == False
    ).all()


def marcar_notificacion_leida(db: Session, notificacion_id: int, usuario_id: int):
    notificacion = db.query(Notificacion).filter(
        Notificacion.id == notificacion_id,
        Notificacion.usuario_id == usuario_id
    ).first()
    
    if notificacion:
        notificacion.leida = True
        db.commit()
    
    return notificacion


def marcar_todas_leidas(db: Session, usuario_id: int):
    db.query(Notificacion).filter(
        Notificacion.usuario_id == usuario_id,
        Notificacion.leida == False
    ).update({"leida": True})
    db.commit()
