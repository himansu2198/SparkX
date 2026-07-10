from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = ""  # Must be set via .env (DATABASE_URL=postgresql://...)

    # JWT
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    # App
    APP_NAME: str = "Gamified Learning Tracker"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Email
    MAIL_USERNAME:  str = ""
    MAIL_PASSWORD:  str = ""
    MAIL_FROM:      str = ""
    MAIL_FROM_NAME: str = "SparkX Team"
    MAIL_PORT:      int = 587
    MAIL_SERVER:    str = "smtp.gmail.com"

    FRONTEND_URL: str = "https://spark-x-ih6d-snowy.vercel.app"

    # ── AI Keys ───────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""        # ← ADD THIS

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()