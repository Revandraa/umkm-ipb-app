"""
Configuration untuk aplikasi
"""
# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./umkm_ipb.db"
    SQLALCHEMY_ECHO: bool = False
    
    # Supabase
    SUPABASE_URL: str | None = None
    SUPABASE_KEY: str | None = None
    SUPABASE_JWT_SECRET: str | None = None
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "UMKM IPB Food Ordering"
    PROJECT_VERSION: str = "1.0.0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://yourdomain.com"
    ]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()

# If running on Vercel and using default SQLite, redirect to /tmp to avoid read-only filesystem crash
import os
if os.environ.get("VERCEL") and settings.DATABASE_URL.startswith("sqlite:///"):
    settings.DATABASE_URL = "sqlite:////tmp/umkm_ipb.db"

