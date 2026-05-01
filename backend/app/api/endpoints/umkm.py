"""
UMKM API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.schemas import UMKMCreate, UMKMResponse, MenuItemCreate
from app.services.umkm_service import UMKMService

router = APIRouter()


@router.post("/register", response_model=UMKMResponse, status_code=status.HTTP_201_CREATED)
def register_umkm(
    owner_id: str,
    umkm_data: UMKMCreate,
    db: Session = Depends(get_db)
):
    """
    Registrasi UMKM baru
    - Status awal: pending (menunggu approval admin)
    - Owner harus sudah registered sebagai user
    """
    try:
        service = UMKMService(db)
        return service.register_umkm(owner_id, umkm_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{umkm_id}", response_model=UMKMResponse)
def get_umkm(umkm_id: str, db: Session = Depends(get_db)):
    """
    Mengambil detail UMKM
    """
    service = UMKMService(db)
    umkm = service.get_umkm(umkm_id)
    if not umkm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="UMKM not found"
        )
    return umkm


@router.get("", response_model=List[UMKMResponse])
def list_approved_umkms(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    List UMKM yang sudah disetujui (untuk customers)
    """
    service = UMKMService(db)
    return service.list_approved_umkms(skip, limit)


@router.get("/owner/{owner_id}", response_model=List[UMKMResponse])
def get_umkms_by_owner(
    owner_id: str,
    db: Session = Depends(get_db)
):
    """
    Mengambil semua UMKM milik owner tertentu
    """
    service = UMKMService(db)
    return service.get_umkms_by_owner(owner_id)


@router.post("/{umkm_id}/menu", status_code=status.HTTP_201_CREATED)
def add_menu_item(
    umkm_id: str,
    menu_data: MenuItemCreate,
    db: Session = Depends(get_db)
):
    """
    Menambahkan menu item untuk UMKM
    """
    try:
        service = UMKMService(db)
        return service.add_menu_item(umkm_id, menu_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ========== ADMIN ENDPOINTS ==========

@router.get("/admin/pending", response_model=List[UMKMResponse])
def list_pending_umkms(db: Session = Depends(get_db)):
    """
    [ADMIN] List UMKM yang pending review
    """
    service = UMKMService(db)
    return service.list_pending_umkms()


@router.post("/{umkm_id}/approve", response_model=UMKMResponse)
def approve_umkm(
    umkm_id: str,
    db: Session = Depends(get_db)
):
    """
    [ADMIN] Approve UMKM registration
    """
    try:
        service = UMKMService(db)
        return service.approve_umkm(umkm_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{umkm_id}/reject")
def reject_umkm(
    umkm_id: str,
    reason: str,
    db: Session = Depends(get_db)
):
    """
    [ADMIN] Reject UMKM registration with reason
    """
    try:
        service = UMKMService(db)
        return service.reject_umkm(umkm_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
