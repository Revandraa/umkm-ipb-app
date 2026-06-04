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

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="API untuk UMKM IPB Food Ordering Platform"
)

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
STATIC_DIR.mkdir(parents=True, exist_ok=True)
PAYMENT_PROOF_DIR.mkdir(parents=True, exist_ok=True)

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
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn  # pyrefly: ignore[missing-import]
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
