"""
FastAPI main application
"""
import os
from pathlib import Path
from fastapi import FastAPI  # pyrefly: ignore[missing-import]
from fastapi.middleware.cors import CORSMiddleware  # pyrefly: ignore[missing-import]
from fastapi.staticfiles import StaticFiles  # pyrefly: ignore[missing-import]
from app.config import settings
from app.database import init_db
from app.api import api_router

# Root backend directory (absolute, regardless of cwd)
BACKEND_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BACKEND_DIR / "static"
PAYMENT_PROOF_DIR = STATIC_DIR / "payment_proofs"

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="API untuk UMKM IPB Food Ordering Platform"
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    try:
        init_db()
    except Exception as e:
        print(f"Error initializing database: {e}")

# Add CORS middleware
# Using allow_origin_regex=".*" to dynamically allow all origins (localhost, Vercel, etc.)
# without throwing the wildcard error when allow_credentials=True.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static folder exists (using absolute path)
try:
    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    PAYMENT_PROOF_DIR.mkdir(parents=True, exist_ok=True)
except Exception as e:
    print(f"Could not create static directories (read-only filesystem?): {e}")

# Mount static folder (absolute path)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "UMKM IPB Food Ordering API",
        "version": settings.PROJECT_VERSION,
        "docs": "/docs",
        "api_prefix": settings.API_V1_STR
    }


@app.get("/health")
async def health_check():
    """Health check untuk monitoring"""
    db_type = "unknown"
    if settings.DATABASE_URL:
        if "postgresql" in settings.DATABASE_URL:
            db_type = "postgresql (Supabase)"
        elif "sqlite" in settings.DATABASE_URL:
            db_type = "sqlite (local/ephemeral)"
    return {
        "status": "healthy",
        "database_type": db_type
    }


if __name__ == "__main__":
    import uvicorn  # pyrefly: ignore[missing-import]
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
