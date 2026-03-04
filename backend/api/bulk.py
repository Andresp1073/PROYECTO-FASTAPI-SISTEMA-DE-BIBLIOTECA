from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
from core.deps import require_admin
from models.user import User
from services.bulk_service import bulk_import_libros

router = APIRouter(prefix="/bulk", tags=["Bulk Import"])


@router.post("/libros")
async def bulk_libros(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Importar libros desde CSV.
    """

    content = await file.read()

    text = content.decode("utf-8")

    result = bulk_import_libros(db, text)

    return {
        "message": "Importación completada",
        **result
    }