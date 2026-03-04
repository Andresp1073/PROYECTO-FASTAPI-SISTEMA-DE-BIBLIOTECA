from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # DB
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int = 3306
    DB_NAME: str = "biblioteca_book"

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # SMTP
    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAIL_FROM: str | None = None
    EMAIL_FROM_NAME: str | None = None
    FRONTEND_URL: str = "http://localhost:5173"

    # Admin seed
    ADMIN_EMAIL: str = "andresmauriciope1073@gmail.com"
    ADMIN_PASSWORD: str = "Admin123*"

    # 🔴 AGREGA ESTA VARIABLE
    ENV: str = "DEV"

    # CORS
    CORS_ORIGINS: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()