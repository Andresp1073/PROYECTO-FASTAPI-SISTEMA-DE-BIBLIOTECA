import logging
import os
from alembic import command
from alembic.config import Config

from database import SessionLocal
from services.seed_service import seed_admin
from core.logging_conf import setup_logging

setup_logging()
logger = logging.getLogger("biblioteca")


def run_migrations() -> None:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    alembic_ini_path = os.path.join(base_dir, "alembic.ini")

    if not os.path.exists(alembic_ini_path):
        raise FileNotFoundError(f"No se encontró alembic.ini en: {alembic_ini_path}")

    alembic_cfg = Config(alembic_ini_path)
    command.upgrade(alembic_cfg, "head")
    logger.info("Migraciones Alembic aplicadas (head).")


def run_seed() -> None:
    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()


if __name__ == "__main__":
    run_migrations()

    try:
        run_seed()
    except Exception as e:
        # Importante: no frenar el proceso si ya migró OK
        logger.error("Seed ADMIN falló: %s", str(e))

    logger.info("migrate.py finalizado OK.")