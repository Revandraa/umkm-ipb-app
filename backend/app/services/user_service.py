"""
UserService - Menangani semua business logic terkait users
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.database import User
from app.models.schemas import UserCreate, UserUpdate, UserResponse
import uuid


class IUserService(ABC):
    """Interface untuk User Service"""
    
    @abstractmethod
    def create_user(self, user_data: UserCreate) -> UserResponse:
        pass
    
    @abstractmethod
    def get_user(self, user_id: str) -> Optional[UserResponse]:
        pass
    
    @abstractmethod
    def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        pass
    
    @abstractmethod
    def list_users(self, skip: int = 0, limit: int = 10) -> List[UserResponse]:
        pass
    
    @abstractmethod
    def update_user(self, user_id: str, user_data: UserUpdate) -> UserResponse:
        pass
    
    @abstractmethod
    def delete_user(self, user_id: str) -> bool:
        pass


class UserService(IUserService):
    """Implementasi User Service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> UserResponse:
        """
        Membuat user baru
        """
        db_user = User(
            id=str(uuid.uuid4()),
            email=user_data.email,
            full_name=user_data.full_name,
            role=user_data.role,
            phone=user_data.phone
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return UserResponse.from_orm(db_user)
    
    def get_user(self, user_id: str) -> Optional[UserResponse]:
        """
        Mengambil user berdasarkan ID
        """
        db_user = self.db.query(User).filter(User.id == user_id).first()
        if db_user:
            return UserResponse.from_orm(db_user)
        return None
    
    def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        """
        Mengambil user berdasarkan email
        """
        db_user = self.db.query(User).filter(User.email == email).first()
        if db_user:
            return UserResponse.from_orm(db_user)
        return None
    
    def list_users(self, skip: int = 0, limit: int = 10) -> List[UserResponse]:
        """
        Mengambil daftar users dengan pagination
        """
        users = self.db.query(User).offset(skip).limit(limit).all()
        return [UserResponse.from_orm(u) for u in users]
    
    def update_user(self, user_id: str, user_data: UserUpdate) -> UserResponse:
        """
        Update informasi user
        """
        db_user = self.db.query(User).filter(User.id == user_id).first()
        if not db_user:
            raise ValueError(f"User {user_id} not found")
        
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        self.db.commit()
        self.db.refresh(db_user)
        return UserResponse.from_orm(db_user)
    
    def delete_user(self, user_id: str) -> bool:
        """
        Menghapus user
        """
        db_user = self.db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False
        
        self.db.delete(db_user)
        self.db.commit()
        return True
