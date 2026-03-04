from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from core.deps import get_current_user, require_admin
from models.user import User
from schemas.prestamo_schemas import PrestamoCreate, PrestamoDevolver, PrestamoRead, MessageResponse
from services import prestamo_service
from core.email import send_email

router = APIRouter(prefix="/prestamos", tags=["Prestamos"])


@router.post("/", response_model=PrestamoRead)
async def prestar(
    payload: PrestamoCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prestamo = prestamo_service.prestar_libro(db, user, payload.libro_id)

    # Email básico (no falla si no hay SMTP)
    await send_email(
        user.email,
        "Préstamo registrado",
        f"<p>Has prestado el libro ID={payload.libro_id}. Préstamo ID={prestamo.id}</p>",
    )
    return prestamo


@router.post("/devolver", response_model=PrestamoRead)
async def devolver(
    payload: PrestamoDevolver,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prestamo = prestamo_service.devolver_libro(db, user, payload.prestamo_id)

    await send_email(
        user.email,
        "Devolución registrada",
        f"<p>Has devuelto el préstamo ID={prestamo.id}.</p>",
    )
    return prestamo


@router.get("/mios", response_model=list[PrestamoRead])
def listar_mios(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return prestamo_service.mis_prestamos(db, user)


@router.get("/", response_model=list[PrestamoRead])
def listar_todos(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return prestamo_service.listar_todos(db)