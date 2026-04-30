"""
API routers
"""
from fastapi import APIRouter
from app.api.endpoints import users, umkm, orders, reviews

api_router = APIRouter()

# Include routers
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(umkm.router, prefix="/umkm", tags=["umkm"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
