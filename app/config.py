from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/gamified_learning"

    # JWT
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # App
    APP_NAME: str = "Gamified Learning Tracker"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Email (Gmail SMTP)
    MAIL_USERNAME:  str = ""
    MAIL_PASSWORD:  str = ""
    MAIL_FROM:      str = ""
    MAIL_FROM_NAME: str = "SparkX Team"
    MAIL_PORT:      int = 587
    MAIL_SERVER:    str = "smtp.gmail.com"

    # Frontend URL (used in reset password links)
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()