import logging
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from core.logging_conf import setup_logging
from database import get_db

setup_logging()
logger = logging.getLogger("biblioteca")

app = FastAPI(
    title="Biblioteca API",
    version="1.0.0",
)

@app.get("/")
def root():
    logger.info("Healthcheck OK")
    return {"message": "Biblioteca API OK"}

@app.get("/db/ping")
def db_ping(db: Session = Depends(get_db)):
    # Ping simple a la BD
    db.execute(text("SELECT 1"))
    return {"db": "ok"}