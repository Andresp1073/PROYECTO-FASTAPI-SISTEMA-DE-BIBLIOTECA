import logging
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.logging_conf import setup_logging
from database import get_db
from core.settings import settings

from api.auth import router as auth_router
from api.users import router as users_router
from api.categorias import router as categorias_router
from api.uploads import router as uploads_router
from api.libros import router as libros_router
from api.prestamos import router as prestamos_router
from api.bulk import router as bulk_router

setup_logging()
logger = logging.getLogger("biblioteca")

app = FastAPI(
    title="Biblioteca API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(categorias_router)
app.include_router(uploads_router)
app.include_router(libros_router)
app.include_router(prestamos_router)
app.include_router(bulk_router)

@app.get("/")
def root():
    logger.info("Healthcheck OK")
    return {"message": "Biblioteca API OK"}

@app.get("/db/ping")
def db_ping(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"db": "ok"}