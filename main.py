from fastapi import FastAPI
import logging
from core.logging_conf import setup_logging

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