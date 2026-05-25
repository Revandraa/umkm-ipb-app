"""
Orders API endpoints
"""
import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile  # pyrefly: ignore[missing-import]
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.schemas import OrderCreate, OrderResponse, OrderStatus
from app.services.order_service import OrderService

# Absolute path to payment_proofs dir (sibling to app/)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PAYMENT_PROOF_DIR = BACKEND_DIR / "static" / "payment_proofs"

router = APIRouter()


@router.get("/all", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    """
    Mengambil semua order (untuk keperluan mock global state frontend)
    """
    service = OrderService(db)
    return service.get_all_orders()


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    customer_id: str,
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):
    """
    Membuat order baru
    
    Request body:
    {
        "umkm_id": "string",
        "pickup_time": "2024-05-01T14:30:00",
        "notes": "optional notes",
        "items": [
            {
                "menu_item_id": "string",
                "quantity": 2
            }
        ]
    }
    
    Flow:
    1. Validate menu items tersedia
    2. Hitung total harga
    3. Generate order number
    4. Simpan order dengan items
    """
    try:
        service = OrderService(db)
        return service.create_order(customer_id, order_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    """
    Mengambil detail order
    """
    service = OrderService(db)
    order = service.get_order(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order


@router.get("/customer/{customer_id}", response_model=List[OrderResponse])
def get_customer_orders(
    customer_id: str,
    db: Session = Depends(get_db)
):
    """
    Mengambil semua order dari customer
    """
    service = OrderService(db)
    return service.get_customer_orders(customer_id)


@router.get("/umkm/{umkm_id}", response_model=List[OrderResponse])
def get_umkm_orders(
    umkm_id: str,
    db: Session = Depends(get_db)
):
    """
    Mengambil semua order yang diterima UMKM
    """
    service = OrderService(db)
    return service.get_umkm_orders(umkm_id)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    status: OrderStatus,
    db: Session = Depends(get_db)
):
    """
    Update order status (untuk UMKM)
    
    Valid transitions:
    - pending → confirmed, cancelled
    - confirmed → ready, cancelled
    - ready → completed
    
    Status flow:
    pending → confirmed → ready → completed
    """
    try:
        service = OrderService(db)
        return service.update_order_status(order_id, status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: str,
    db: Session = Depends(get_db)
):
    """
    Cancel order
    - Hanya bisa cancel dari status pending atau confirmed
    """
    try:
        service = OrderService(db)
        return service.cancel_order(order_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{order_id}/payment-proof", response_model=OrderResponse)
def upload_payment_proof(
    order_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload bukti pembayaran untuk order
    """
    try:
        # Buat folder payment_proofs jika belum ada (absolute path)
        PAYMENT_PROOF_DIR.mkdir(parents=True, exist_ok=True)
        
        # Simpan file ke disk
        file_ext = os.path.splitext(file.filename or "proof.jpg")[1] or ".jpg"
        filename = f"{order_id}{file_ext}"
        file_path = PAYMENT_PROOF_DIR / filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # URL yang bisa diakses: /static/payment_proofs/{filename}
        relative_url = f"/static/payment_proofs/{filename}"
        
        service = OrderService(db)
        return service.upload_payment_proof(order_id, relative_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
