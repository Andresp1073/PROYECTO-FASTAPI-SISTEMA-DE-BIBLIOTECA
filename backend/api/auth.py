from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.orm import Session
from core.deps import get_current_user
from database import get_db
from schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshResponse,
    MessageResponse,
    VerifyEmailRequest,
    RequestResetPasswordRequest,
    ResetPasswordRequest,
)
from services import auth_service
from core.email import send_email

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=MessageResponse)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    user, html, to_email = auth_service.register(
        db, payload.nombre, payload.email, payload.password, payload.documento
    )
    await send_email(to_email, "Verifica tu email", html)
    return {"message": "Registro exitoso. Revisa tu email para verificar tu cuenta."}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    access = auth_service.issue_tokens(db, response, user)
    return {"access_token": access, "token_type": "bearer"}

# [NUEVO]
@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "nombre": current_user.nombre,
        "email": current_user.email,
        "rol": current_user.rol,
        "is_active": current_user.is_active,
        "is_email_verified": current_user.is_email_verified,
    }


@router.post("/refresh", response_model=RefreshResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    access = auth_service.refresh_access_token(db, request, response)
    return {"access_token": access, "token_type": "bearer"}


@router.post("/logout", response_model=MessageResponse)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    auth_service.logout(db, request, response)
    return {"message": "Logout OK"}


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    auth_service.verify_email(db, payload.token)
    return {"message": "Email verificado correctamente"}


@router.post("/request-reset-password", response_model=MessageResponse)
async def request_reset_password(payload: RequestResetPasswordRequest, db: Session = Depends(get_db)):
    await auth_service.request_reset_password(db, payload.email)
    return {"message": "Si el email existe, se envió un link de recuperación"}


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_service.reset_password(db, payload.token, payload.new_password)
    return {"message": "Contraseña actualizada correctamente"}