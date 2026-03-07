import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlalchemy import text

def add_enum_value():
    with engine.connect() as conn:
        try:
            conn.execute(text(
                "ALTER TABLE notificaciones MODIFY COLUMN tipo ENUM('SOLICITUD_PRESTAMO', 'SOLICITUD_APROBADA', 'SOLICITUD_RECHAZADA', 'PRESTAMO_VENCIDO', 'PRESTAMO_DEVUELTO') NOT NULL"
            ))
            conn.commit()
            print('Added PRESTAMO_DEVUELTO to enum')
        except Exception as e:
            print(f'Error: {e}')

if __name__ == '__main__':
    add_enum_value()
