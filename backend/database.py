from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.settings import settings

DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Importar modelos para que SQLAlchemy los registre (útil para Alembic)
# [NUEVO]
from models.user import User  # noqa: E402,F401
from models.auth_token import AuthToken  # noqa: E402,F401
from models.email_token import EmailToken  # noqa: E402,F401
from models.categoria import Categoria  # noqa: E402,F401
from models.libro import Libro  # noqa: E402,F401
from models.prestamo import Prestamo  # noqa: E402,F401
from models.solicitud_prestamo import SolicitudPrestamo  # noqa: E402,F401
from models.notificacion import Notificacion  # noqa: E402,F401

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()