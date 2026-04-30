"""
UMKMService - Menangani semua business logic terkait UMKM
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.database import UMKM, MenuItem
from app.models.schemas import UMKMCreate, UMKMUpdate, UMKMResponse, UMKMStatus, MenuItemCreate
import uuid


class IUMKMService(ABC):
    """Interface untuk UMKM Service"""
    
    @abstractmethod
    def register_umkm(self, owner_id: str, umkm_data: UMKMCreate) -> UMKMResponse:
        pass
    
    @abstractmethod
    def get_umkm(self, umkm_id: str) -> Optional[UMKMResponse]:
        pass
    
    @abstractmethod
    def get_umkms_by_owner(self, owner_id: str) -> List[UMKMResponse]:
        pass
    
    @abstractmethod
    def list_approved_umkms(self, skip: int = 0, limit: int = 10) -> List[UMKMResponse]:
        pass
    
    @abstractmethod
    def list_pending_umkms(self) -> List[UMKMResponse]:
        pass
    
    @abstractmethod
    def update_umkm(self, umkm_id: str, umkm_data: UMKMUpdate) -> UMKMResponse:
        pass
    
    @abstractmethod
    def approve_umkm(self, umkm_id: str) -> UMKMResponse:
        pass
    
    @abstractmethod
    def reject_umkm(self, umkm_id: str, reason: str) -> UMKMResponse:
        pass
    
    @abstractmethod
    def add_menu_item(self, umkm_id: str, menu_data: MenuItemCreate):
        pass
    
    @abstractmethod
    def calculate_rating(self, umkm_id: str) -> float:
        pass


class UMKMService(IUMKMService):
    """Implementasi UMKM Service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def register_umkm(self, owner_id: str, umkm_data: UMKMCreate) -> UMKMResponse:
        """
        Registrasi UMKM baru (status: pending)
        """
        db_umkm = UMKM(
            id=str(uuid.uuid4()),
            owner_id=owner_id,
            name=umkm_data.name,
            description=umkm_data.description,
            location=umkm_data.location,
            phone=umkm_data.phone,
            image_url=umkm_data.image_url,
            status="pending"
        )
        self.db.add(db_umkm)
        self.db.commit()
        self.db.refresh(db_umkm)
        return UMKMResponse.from_orm(db_umkm)
    
    def get_umkm(self, umkm_id: str) -> Optional[UMKMResponse]:
        """
        Mengambil detail UMKM berdasarkan ID
        """
        db_umkm = self.db.query(UMKM).filter(UMKM.id == umkm_id).first()
        if db_umkm:
            return UMKMResponse.from_orm(db_umkm)
        return None
    
    def get_umkms_by_owner(self, owner_id: str) -> List[UMKMResponse]:
        """
        Mengambil semua UMKM milik owner tertentu
        """
        umkms = self.db.query(UMKM).filter(UMKM.owner_id == owner_id).all()
        return [UMKMResponse.from_orm(u) for u in umkms]
    
    def list_approved_umkms(self, skip: int = 0, limit: int = 10) -> List[UMKMResponse]:
        """
        Mengambil daftar UMKM yang sudah disetujui (untuk customers)
        """
        umkms = self.db.query(UMKM).filter(
            UMKM.status == "approved"
        ).offset(skip).limit(limit).all()
        return [UMKMResponse.from_orm(u) for u in umkms]
    
    def list_pending_umkms(self) -> List[UMKMResponse]:
        """
        Mengambil daftar UMKM pending (untuk admin review)
        """
        umkms = self.db.query(UMKM).filter(UMKM.status == "pending").all()
        return [UMKMResponse.from_orm(u) for u in umkms]
    
    def update_umkm(self, umkm_id: str, umkm_data: UMKMUpdate) -> UMKMResponse:
        """
        Update informasi UMKM
        """
        db_umkm = self.db.query(UMKM).filter(UMKM.id == umkm_id).first()
        if not db_umkm:
            raise ValueError(f"UMKM {umkm_id} not found")
        
        update_data = umkm_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_umkm, field, value)
        
        self.db.commit()
        self.db.refresh(db_umkm)
        return UMKMResponse.from_orm(db_umkm)
    
    def approve_umkm(self, umkm_id: str) -> UMKMResponse:
        """
        Approve UMKM registration (admin action)
        """
        db_umkm = self.db.query(UMKM).filter(UMKM.id == umkm_id).first()
        if not db_umkm:
            raise ValueError(f"UMKM {umkm_id} not found")
        
        db_umkm.status = "approved"
        db_umkm.rejection_reason = None
        self.db.commit()
        self.db.refresh(db_umkm)
        return UMKMResponse.from_orm(db_umkm)
    
    def reject_umkm(self, umkm_id: str, reason: str) -> UMKMResponse:
        """
        Reject UMKM registration with reason
        """
        db_umkm = self.db.query(UMKM).filter(UMKM.id == umkm_id).first()
        if not db_umkm:
            raise ValueError(f"UMKM {umkm_id} not found")
        
        db_umkm.status = "rejected"
        db_umkm.rejection_reason = reason
        self.db.commit()
        self.db.refresh(db_umkm)
        return UMKMResponse.from_orm(db_umkm)
    
    def add_menu_item(self, umkm_id: str, menu_data: MenuItemCreate) -> dict:
        """
        Menambahkan menu item untuk UMKM
        """
        umkm = self.db.query(UMKM).filter(UMKM.id == umkm_id).first()
        if not umkm:
            raise ValueError(f"UMKM {umkm_id} not found")
        
        menu_item = MenuItem(
            id=str(uuid.uuid4()),
            umkm_id=umkm_id,
            name=menu_data.name,
            description=menu_data.description,
            category=menu_data.category,
            price=menu_data.price,
            image_url=menu_data.image_url,
            is_available=menu_data.is_available
        )
        self.db.add(menu_item)
        self.db.commit()
        self.db.refresh(menu_item)
        return {"id": menu_item.id, "name": menu_item.name}
    
    def calculate_rating(self, umkm_id: str) -> float:
        """
        Menghitung rating UMKM dari reviews
        """
        from app.models.database import Review
        
        reviews = self.db.query(Review).filter(Review.umkm_id == umkm_id).all()
        if not reviews:
            return 0.0
        
        total_rating = sum(review.rating for review in reviews)
        return round(total_rating / len(reviews), 2)
