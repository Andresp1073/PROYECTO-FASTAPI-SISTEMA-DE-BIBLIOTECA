import logging
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

from core.logging_conf import setup_logging
from database import get_db
from core.settings import settings
from core.security import create_access_token

setup_logging()
logger = logging.getLogger("biblioteca")

app = FastAPI(
    title="Biblioteca API",
    version="1.0.0",
)

# CORS (para cookies HttpOnly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    logger.info("Healthcheck OK")
    return {"message": "Biblioteca API OK"}

@app.get("/db/ping")
def db_ping(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"db": "ok"}

@app.get("/token/test")
def token_test():
    """
    Endpoint temporal para verificar que JWT funciona.
    En fases siguientes se reemplaza por login real.
    """
    token = create_access_token(subject="1")
    return {"access_token": token, "token_type": "bearer"}