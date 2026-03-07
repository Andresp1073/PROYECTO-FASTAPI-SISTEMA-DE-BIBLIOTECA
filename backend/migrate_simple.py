import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlalchemy import text

def run_migrations():
    with engine.connect() as conn:
        # 1. Add documento column to users
        try:
            conn.execute(text('ALTER TABLE users ADD COLUMN documento VARCHAR(50)'))
            conn.commit()
            print('Added documento column to users')
        except Exception as e:
            if 'Duplicate' in str(e):
                print('documento column already exists')
            else:
                print(f'documento column: {e}')
        
        # 2. Create solicitudes_prestamo table
        try:
            conn.execute(text('''
                CREATE TABLE IF NOT EXISTS solicitudes_prestamo (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id INT NOT NULL,
                    libro_id INT NOT NULL,
                    procesado_por_id INT NULL,
                    estado ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
                    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    procesado_at DATETIME(6) NULL,
                    nota_rechazo TEXT NULL,
                    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
                    FOREIGN KEY (procesado_por_id) REFERENCES users(id) ON DELETE SET NULL
                )
            '''))
            conn.commit()
            print('Created solicitudes_prestamo table')
        except Exception as e:
            if 'already exists' in str(e).lower():
                print('solicitudes_prestamo table already exists')
            else:
                print(f'solicitudes_prestamo: {e}')
        
        # 3. Create notificaciones table
        try:
            conn.execute(text('''
                CREATE TABLE IF NOT EXISTS notificaciones (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id INT NOT NULL,
                    tipo ENUM('SOLICITUD_PRESTAMO', 'SOLICITUD_APROBADA', 'SOLICITUD_RECHAZADA', 'PRESTAMO_VENCIDO') NOT NULL,
                    titulo VARCHAR(255) NOT NULL,
                    mensaje TEXT NOT NULL,
                    referencia_id INT NULL,
                    referencia_tipo VARCHAR(50) NULL,
                    leida BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
                )
            '''))
            conn.commit()
            print('Created notificaciones table')
        except Exception as e:
            if 'already exists' in str(e).lower():
                print('notificaciones table already exists')
            else:
                print(f'notificaciones: {e}')
        
        # 4. Create index on users.documento
        try:
            conn.execute(text('CREATE INDEX ix_users_documento ON users(documento)'))
            conn.commit()
            print('Created index on users.documento')
        except Exception as e:
            if 'Duplicate' in str(e) or 'already exists' in str(e).lower():
                print('Index already exists')
            else:
                print(f'index: {e}')
        
        # 5. Create indexes on new tables
        try:
            conn.execute(text('CREATE INDEX ix_solicitudes_usuario ON solicitudes_prestamo(usuario_id)'))
            conn.commit()
        except:
            pass
        
        try:
            conn.execute(text('CREATE INDEX ix_solicitudes_estado ON solicitudes_prestamo(estado)'))
            conn.commit()
        except:
            pass
        
        try:
            conn.execute(text('CREATE INDEX ix_notificaciones_usuario ON notificaciones(usuario_id)'))
            conn.commit()
        except:
            pass
        
        try:
            conn.execute(text('CREATE INDEX ix_notificaciones_leida ON notificaciones(leida)'))
            conn.commit()
        except:
            pass
        
        print('Migration completed!')

if __name__ == '__main__':
    run_migrations()
