"""
Pydantic schemas untuk data validation dan API responses
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum


# Enums untuk tipe-tipe status
class UserRole(str, Enum):
    CUSTOMER = "customer"
    UMKM_OWNER = "umkm_owner"
    ADMIN = "admin"


class UMKMStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    E_WALLET = "e_wallet"


# ==================== USER SCHEMAS ====================
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CUSTOMER
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== UMKM SCHEMAS ====================
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: Decimal = Field(..., decimal_places=2, gt=0)
    image_url: Optional[str] = None
    is_available: bool = True


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[Decimal] = Field(None, decimal_places=2, gt=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None


class MenuItemResponse(MenuItemBase):
    id: str
    umkm_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UMKMBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: str
    phone: str
    image_url: Optional[str] = None


class UMKMCreate(UMKMBase):
    pass


class UMKMUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    image_url: Optional[str] = None


class UMKMResponse(UMKMBase):
    id: str
    owner_id: str
    rating: Decimal
    status: UMKMStatus
    rejection_reason: Optional[str] = None
    menu_items: List[MenuItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== ORDER SCHEMAS ====================
class OrderItemBase(BaseModel):
    menu_item_id: str
    quantity: int = Field(..., gt=0)


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: str
    order_id: str
    unit_price: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    umkm_id: str
    pickup_time: datetime
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = Field(..., min_items=1)


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    pickup_time: Optional[datetime] = None
    notes: Optional[str] = None


class OrderResponse(OrderBase):
    id: str
    order_number: str
    customer_id: str
    status: OrderStatus
    total_price: Decimal
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== REVIEW SCHEMAS ====================
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    umkm_id: str


class ReviewResponse(ReviewBase):
    id: str
    customer_id: str
    umkm_id: str
    order_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== TRANSACTION SCHEMAS ====================
class TransactionCreate(BaseModel):
    order_id: str
    amount: Decimal = Field(..., decimal_places=2, gt=0)
    payment_method: PaymentMethod


class TransactionResponse(TransactionCreate):
    id: str
    status: str
    transaction_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
