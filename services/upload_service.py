import os
import uuid
from fastapi import UploadFile, HTTPException, status

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def _safe_ext(filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        # si viene raro, forzamos png por seguridad
        return ".png"
    return ext


async def save_cover(file: UploadFile, base_dir: str = "static/covers") -> str:
    # [NUEVO]
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de archivo no permitido. Usa JPG, PNG o WEBP.",
        )

    _ensure_dir(base_dir)

    # leer contenido para validar tamaño
    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Archivo demasiado grande (máx 5MB).")

    ext = _safe_ext(file.filename or "")
    new_name = f"{uuid.uuid4().hex}{ext}"
    out_path = os.path.join(base_dir, new_name)

    with open(out_path, "wb") as f:
        f.write(content)

    # URL pública servida por StaticFiles
    return f"/static/covers/{new_name}"