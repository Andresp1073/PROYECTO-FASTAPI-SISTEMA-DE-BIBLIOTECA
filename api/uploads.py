from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from core.deps import require_admin
from models.user import User
from services.upload_service import save_cover

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.post("/covers")
async def upload_cover(
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
):
    """
    Sube una portada de libro y retorna la URL pública.
    ADMIN solamente.
    """
    url = await save_cover(file)
    return {"cover_url": url}