"""
Reviews API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.schemas import ReviewCreate, ReviewResponse
from app.models.database import Review

router = APIRouter()


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    customer_id: str,
    review_data: ReviewCreate,
    db: Session = Depends(get_db)
):
    """
    Create review untuk UMKM
    - Customer dapat review setelah order completed
    - Rating: 1-5
    """
    import uuid
    from datetime import datetime
    
    review = Review(
        id=str(uuid.uuid4()),
        customer_id=customer_id,
        umkm_id=review_data.umkm_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewResponse.from_orm(review)


@router.get("/umkm/{umkm_id}", response_model=List[ReviewResponse])
def get_umkm_reviews(
    umkm_id: str,
    db: Session = Depends(get_db)
):
    """Get all reviews untuk UMKM"""
    reviews = db.query(Review).filter(Review.umkm_id == umkm_id).all()
    return [ReviewResponse.from_orm(r) for r in reviews]
