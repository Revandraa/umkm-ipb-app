"""
Promos API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.schemas import PromoCreate, PromoUpdate, PromoResponse
from app.models.database import Promo
import uuid

router = APIRouter()


@router.get("", response_model=List[PromoResponse])
def get_active_promos(
    umkm_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Mengambil semua promo yang masih aktif dan belum kadaluarsa.
    Bisa difilter berdasarkan UMKM tertentu (umkm_id).
    """
    now = datetime.utcnow()
    query = db.query(Promo).filter(
        Promo.is_active == True,
        Promo.valid_from <= now,
        Promo.valid_until >= now
    )
    if umkm_id:
        # Filter promo untuk UMKM tertentu ATAU promo global (umkm_id = null)
        query = query.filter(
            (Promo.umkm_id == umkm_id) | (Promo.umkm_id == None)
        )
    promos = query.order_by(Promo.created_at.desc()).all()
    return [PromoResponse.from_orm(p) for p in promos]


@router.get("/all", response_model=List[PromoResponse])
def get_all_promos(db: Session = Depends(get_db)):
    """
    Mengambil semua promo termasuk yang tidak aktif / sudah kadaluarsa (untuk admin).
    """
    promos = db.query(Promo).order_by(Promo.created_at.desc()).all()
    return [PromoResponse.from_orm(p) for p in promos]


@router.get("/{promo_id}", response_model=PromoResponse)
def get_promo(promo_id: str, db: Session = Depends(get_db)):
    """
    Mengambil detail satu promo berdasarkan ID.
    """
    promo = db.query(Promo).filter(Promo.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")
    return PromoResponse.from_orm(promo)


@router.get("/code/{code}", response_model=PromoResponse)
def get_promo_by_code(code: str, db: Session = Depends(get_db)):
    """
    Mengambil promo berdasarkan kode untuk keperluan validasi saat checkout.
    """
    now = datetime.utcnow()
    promo = db.query(Promo).filter(
        Promo.code == code.upper(),
        Promo.is_active == True,
        Promo.valid_from <= now,
        Promo.valid_until >= now
    ).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Kode promo tidak valid atau sudah kadaluarsa")
    return PromoResponse.from_orm(promo)


@router.post("", response_model=PromoResponse, status_code=status.HTTP_201_CREATED)
def create_promo(promo_data: PromoCreate, db: Session = Depends(get_db)):
    """
    Membuat promo baru (untuk admin / UMKM owner).
    """
    # Cek duplikat kode
    existing = db.query(Promo).filter(Promo.code == promo_data.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Kode promo sudah digunakan")

    promo = Promo(
        id=str(uuid.uuid4()),
        title=promo_data.title,
        description=promo_data.description,
        code=promo_data.code.upper(),
        discount_type=promo_data.discount_type,
        discount_value=promo_data.discount_value,
        min_order=promo_data.min_order,
        max_discount=promo_data.max_discount,
        umkm_id=promo_data.umkm_id,
        image_url=promo_data.image_url,
        valid_from=promo_data.valid_from,
        valid_until=promo_data.valid_until,
        is_active=promo_data.is_active
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return PromoResponse.from_orm(promo)


@router.patch("/{promo_id}", response_model=PromoResponse)
def update_promo(promo_id: str, promo_data: PromoUpdate, db: Session = Depends(get_db)):
    """
    Update data promo (untuk admin).
    """
    promo = db.query(Promo).filter(Promo.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")

    update_data = promo_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(promo, field, value)

    db.commit()
    db.refresh(promo)
    return PromoResponse.from_orm(promo)


@router.delete("/{promo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_promo(promo_id: str, db: Session = Depends(get_db)):
    """
    Hapus promo (untuk admin).
    """
    promo = db.query(Promo).filter(Promo.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")
    db.delete(promo)
    db.commit()
