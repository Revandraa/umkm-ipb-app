"""
OrderService - Menangani semua business logic terkait orders
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.database import Order, OrderItem, MenuItem, Transaction
from app.models.schemas import OrderCreate, OrderUpdate, OrderResponse, OrderStatus
import uuid
import random
import string


class IOrderService(ABC):
    """Interface untuk Order Service"""
    
    @abstractmethod
    def create_order(self, customer_id: str, order_data: OrderCreate) -> OrderResponse:
        pass
    
    @abstractmethod
    def get_order(self, order_id: str) -> Optional[OrderResponse]:
        pass
    
    @abstractmethod
    def get_customer_orders(self, customer_id: str) -> List[OrderResponse]:
        pass
    
    @abstractmethod
    def get_umkm_orders(self, umkm_id: str) -> List[OrderResponse]:
        pass
    
    @abstractmethod
    def update_order_status(self, order_id: str, status: OrderStatus) -> OrderResponse:
        pass
    
    @abstractmethod
    def cancel_order(self, order_id: str) -> OrderResponse:
        pass


class OrderService(IOrderService):
    """Implementasi Order Service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _generate_order_number(self) -> str:
        """
        Generate unique order number
        Format: ORD-YYYYMMDD-XXXXX
        """
        date_str = datetime.utcnow().strftime("%Y%m%d")
        random_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
        return f"ORD-{date_str}-{random_str}"
    
    def _calculate_total_price(self, items_data: list, db: Session) -> Decimal:
        """
        Menghitung total harga order dari items
        """
        total = Decimal("0.00")
        
        for item in items_data:
            menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
            if not menu_item:
                raise ValueError(f"Menu item {item.menu_item_id} not found")
            
            total += menu_item.price * item.quantity
        
        return total
    
    def create_order(self, customer_id: str, order_data: OrderCreate) -> OrderResponse:
        """
        Membuat order baru dengan validation
        - Cek menu items tersedia
        - Hitung total harga
        - Buat order dengan items
        """
        # Validasi UMKM
        from app.models.database import UMKM
        umkm = self.db.query(UMKM).filter(UMKM.id == order_data.umkm_id).first()
        if not umkm:
            raise ValueError(f"UMKM {order_data.umkm_id} not found")
        
        # Hitung total harga
        total_price = self._calculate_total_price(order_data.items, self.db)
        
        # Buat order
        order = Order(
            id=str(uuid.uuid4()),
            order_number=self._generate_order_number(),
            customer_id=customer_id,
            umkm_id=order_data.umkm_id,
            status="pending",
            total_price=total_price,
            pickup_time=order_data.pickup_time,
            notes=order_data.notes
        )
        self.db.add(order)
        self.db.flush()
        
        # Tambahkan order items
        for item_data in order_data.items:
            menu_item = self.db.query(MenuItem).filter(
                MenuItem.id == item_data.menu_item_id
            ).first()
            
            order_item = OrderItem(
                id=str(uuid.uuid4()),
                order_id=order.id,
                menu_item_id=item_data.menu_item_id,
                quantity=item_data.quantity,
                unit_price=menu_item.price,
                subtotal=menu_item.price * item_data.quantity
            )
            self.db.add(order_item)
        
        self.db.commit()
        self.db.refresh(order)
        return OrderResponse.from_orm(order)
    
    def get_order(self, order_id: str) -> Optional[OrderResponse]:
        """
        Mengambil detail order berdasarkan ID
        """
        db_order = self.db.query(Order).filter(Order.id == order_id).first()
        if db_order:
            return OrderResponse.from_orm(db_order)
        return None
    
    def get_customer_orders(self, customer_id: str) -> List[OrderResponse]:
        """
        Mengambil semua order yang dibuat oleh customer
        """
        orders = self.db.query(Order).filter(
            Order.customer_id == customer_id
        ).order_by(Order.created_at.desc()).all()
        return [OrderResponse.from_orm(o) for o in orders]
    
    def get_umkm_orders(self, umkm_id: str) -> List[OrderResponse]:
        """
        Mengambil semua order yang diterima UMKM
        """
        orders = self.db.query(Order).filter(
            Order.umkm_id == umkm_id
        ).order_by(Order.created_at.desc()).all()
        return [OrderResponse.from_orm(o) for o in orders]
    
    def update_order_status(self, order_id: str, status: OrderStatus) -> OrderResponse:
        """
        Update status order (untuk UMKM dan admin)
        Flow: pending -> confirmed -> ready -> completed
        """
        db_order = self.db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            raise ValueError(f"Order {order_id} not found")
        
        # Validasi status transition
        valid_transitions = {
            "pending": ["confirmed", "cancelled"],
            "confirmed": ["ready", "cancelled"],
            "ready": ["completed"],
            "completed": [],
            "cancelled": []
        }
        
        if status not in valid_transitions.get(db_order.status, []):
            raise ValueError(
                f"Cannot transition from {db_order.status} to {status}"
            )
        
        db_order.status = status
        self.db.commit()
        self.db.refresh(db_order)
        return OrderResponse.from_orm(db_order)
    
    def cancel_order(self, order_id: str) -> OrderResponse:
        """
        Cancel order (hanya bisa dari status pending atau confirmed)
        """
        db_order = self.db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            raise ValueError(f"Order {order_id} not found")
        
        if db_order.status not in ["pending", "confirmed"]:
            raise ValueError(f"Cannot cancel order in {db_order.status} status")
        
        db_order.status = "cancelled"
        self.db.commit()
        self.db.refresh(db_order)
        return OrderResponse.from_orm(db_order)
