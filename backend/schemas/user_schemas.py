from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

from models.user import UserRol


class MessageResponse(BaseModel):
    message: str


class UserCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    rol: UserRol = UserRol.USUARIO


class UserUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    is_active: bool | None = None
    rol: UserRol | None = None


class UserRead(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: UserRol
    is_active: bool
    is_email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserAdminResetPassword(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=128)