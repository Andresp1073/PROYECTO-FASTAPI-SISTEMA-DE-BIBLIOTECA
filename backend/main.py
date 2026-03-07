import logging
from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
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
from api.solicitudes import router as solicitudes_router

setup_logging()
logger = logging.getLogger("biblioteca")

app = FastAPI(
    title="Biblioteca API",
    version="1.0.0",
)

# Exception handler global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s %s", request.method, request.url)
    return JSONResponse(status_code=500, content={"detail": "Error interno del servidor"})


# CORS
origins = []
if settings.CORS_ORIGINS.strip():
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
else:
    origins = [settings.FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(categorias_router)
app.include_router(uploads_router)
app.include_router(libros_router)
app.include_router(prestamos_router)
app.include_router(bulk_router)
app.include_router(solicitudes_router)

@app.get("/")
def root():
    return {"message": "Biblioteca API OK"}

@app.get("/db/ping")
def db_ping(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"db": "ok"}