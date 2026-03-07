from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

from models.user import UserRol


class MessageResponse(BaseModel):
    message: str


class UserCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    documento: str | None = Field(default=None, max_length=50)
    rol: UserRol = UserRol.USUARIO


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    documento: str | None = Field(default=None, max_length=50)
    is_active: bool | None = None
    is_email_verified: bool | None = None
    rol: UserRol | None = None


class UserRead(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    documento: str | None = None
    rol: UserRol
    is_active: bool
    is_email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserAdminResetPassword(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=128)