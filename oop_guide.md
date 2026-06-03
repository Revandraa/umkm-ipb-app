# Panduan Lengkap Object-Oriented Programming (OOP)
## Implementasi Dasar, Inheritance, dan Composition Berdasarkan Codebase Project
---

## 1. Implementasi OOP (Object-Oriented Programming)

Dalam pemrograman berorientasi objek (OOP), data (atribut) dan perilaku (method) dikelompokkan ke dalam satu kesatuan called **Class**, yang kemudian diinstansiasi menjadi **Object**.

### A. Implementasi pada Model Database (Python)
Pada file [database.py](file:///c:/Users/Revandra%20Athaya/Downloads/ADS%20UMKM%20IPB/umkm-ipb-app-1/backend/app/models/database.py), Anda mendefinisikan cetakan data menggunakan model SQLAlchemy. 

Berikut adalah implementasi class `Order` yang memiliki atribut kolom database dan perilaku (*method*) berupa property untuk mengambil nama pelanggan secara terenkapsulasi:

```python
from sqlalchemy import Column, String, DateTime, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from app.models.database import Base
from typing import Optional
import uuid

class Order(Base):
    __tablename__ = "orders"
    
    # Atribut / Properties (State)
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(50), unique=True, nullable=False)
    customer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    umkm_id = Column(String(36), ForeignKey("umkm.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending")
    total_price = Column(DECIMAL(12, 2), nullable=False)
    pickup_time = Column(DateTime, nullable=False)
    
    # Relationships
    customer = relationship("User", back_populates="orders")
    
    # Perilaku / Behavior (Encapsulation via @property)
    # Method ini membungkus logika pengecekan internal agar lebih aman dibaca
    @property
    def customer_name(self) -> Optional[str]:
        return self.customer.full_name if self.customer else None
```

### B. Representasi Data di Frontend (TypeScript)
Di sisi frontend, pada file [mock-data.ts](file:///c:/Users/Revandra%20Athaya/Downloads/ADS%20UMKM%20IPB/umkm-ipb-app-1/frontend/lib/mock-data.ts), kita mendefinisikan struktur objek menggunakan `interface` agar tipe datanya aman (*Type Safety*):

```typescript
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export interface UMKM {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  menu: MenuItem[]; // Relasi data
}
```

---

## 2. Inheritance (Pewarisan)

**Inheritance** adalah mekanisme di mana suatu class/tipe mewarisi atribut atau perilaku dari class induk (*Parent Class*). Ini mewakili hubungan **"is-a"** (adalah sebuah).

### A. Pewarisan pada Skema Validasi Pydantic (Python)
Dalam file [schemas.py](file:///c:/Users/Revandra%20Athaya/Downloads/ADS%20UMKM%20IPB/umkm-ipb-app-1/backend/app/models/schemas.py), Anda menerapkan pewarisan untuk menghindari menulis ulang properti email, nama, peran, dan telepon pada skema User yang berbeda.

```python
from pydantic import BaseModel, EmailStr
from typing import Optional

# Parent Class (Skema Dasar)
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "customer"
    phone: Optional[str] = None

# Child Class 1: Mewarisi UserBase + Menambah kolom password untuk register
class UserCreate(UserBase):
    password: str

# Child Class 2: Mewarisi UserBase + Menambah kolom metadata untuk respons API
class UserResponse(UserBase):
    id: str
    
    class Config:
        from_attributes = True
```
*Dengan cara ini, `UserCreate` dan `UserResponse` secara otomatis memiliki email, full_name, role, dan phone.*

### B. Pewarisan pada Layanan Bisnis / Service Layer (Python)
Pada file [order_service.py](file:///c:/Users/Revandra%20Athaya/Downloads/ADS%20UMKM%20IPB/umkm-ipb-app-1/backend/app/services/order_service.py), Anda membuat Abstraksi Interface `IOrderService` yang kemudian diwarisi oleh class implementasi `OrderService`:

```python
from abc import ABC, abstractmethod
from app.models.schemas import OrderCreate, OrderResponse

# Parent Class (Abstract Base Class - Interface)
class IOrderService(ABC):
    @abstractmethod
    def create_order(self, customer_id: str, order_data: OrderCreate) -> OrderResponse:
        pass

# Child Class (Concrete Implementation)
class OrderService(IOrderService):
    def create_order(self, customer_id: str, order_data: OrderCreate) -> OrderResponse:
        # Implementasi logika pembuatan pesanan yang sesungguhnya di sini
        pass
```

---

## 3. Composition (Komposisi)

**Composition** adalah teknik mendesain class dengan menggabungkan objek-objek lain sebagai bagian dari atributnya. Konsep ini mewakili hubungan **"has-a"** (memiliki) dan sangat disukai karena membuat ikatan antar class menjadi longgar (*loose coupling*).

### A. Komposisi pada Database Relationship (Python)
Dalam file [database.py](file:///c:/Users/Revandra%20Athaya/Downloads/ADS%20UMKM%20IPB/umkm-ipb-app-1/backend/app/models/database.py), class `UMKM` tersusun dari kumpulan menu makanan (`MenuItem`). `UMKM` tidak mewarisi `MenuItem`, tetapi **memiliki** (`has-many`) `MenuItem`.

```python
class UMKM(Base):
    __tablename__ = "umkm"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    
    # Komposisi: Relasi satu-ke-banyak (UMKM memiliki banyak MenuItem)
    menu_items = relationship("MenuItem", back_populates="umkm", cascade="all, delete-orphan")
```

### B. Komposisi melalui Dependency Injection di Service Layer (Python)
Di file [order_service.py](file:///c:/Users/Revandra%20Athaya/Downloads/ADS%20UMKM%20IPB/umkm-ipb-app-1/backend/app/services/order_service.py), class `OrderService` membutuhkan objek database session (`Session`) untuk melakukan query. 
Alih-alih meng-inherit class database, `OrderService` menyimpan objek `db` sebagai atribut di dalam constructor-nya:

```python
from sqlalchemy.orm import Session

class OrderService(IOrderService):
    # Dependency Injection (Constructor Composition)
    # OrderService MEMILIKI (has-a) objek db
    def __init__(self, db: Session):
        self.db = db
        
    def get_order(self, order_id: str):
        # Mendelegasikan operasi pencarian data ke objek db yang dimilikinya
        return self.db.query(Order).filter(Order.id == order_id).first()
```

### C. Komposisi Tipe Data di Frontend (TypeScript)
Di file [mock-data.ts](file:///c:/Users/Revandra%20Athaya/Downloads/ADS%20UMKM%20IPB/umkm-ipb-app-1/frontend/lib/mock-data.ts), tipe data `UMKM` dibentuk melalui komposisi dari array `MenuItem`:

```typescript
export interface UMKM {
  id: string;
  name: string;
  location: string;
  
  // Komposisi: Objek UMKM tersusun dari kumpulan objek MenuItem
  menu: MenuItem[]; 
}
```

---

## Ringkasan Perbedaan di Codebase Anda

| Konsep | Penjelasan | Contoh Nyata di Project Anda |
| :--- | :--- | :--- |
| **OOP Dasar** | Mengelompokkan data & fungsi ke dalam Class. | Class `Order` ([database.py](file:///c:/Users/Revandra%20Athaya/Downloads/ADS%20UMKM%20IPB/umkm-ipb-app-1/backend/app/models/database.py)) yang menyimpan data order dan memiliki properti `customer_name`. |
| **Inheritance** | Kelas anak mewarisi properti kelas induk. | `UserCreate` mewarisi properti dari `UserBase` ([schemas.py](file:///c:/Users/Revandra%20Athaya/Downloads/ADS%20UMKM%20IPB/umkm-ipb-app-1/backend/app/models/schemas.py)). |
| **Composition** | Kelas tersusun dari objek kelas lain. | `OrderService` memiliki instance `Session` database (`self.db`) untuk melakukan query ([order_service.py](file:///c:/Users/Revandra%20Athaya/Downloads/ADS%20UMKM%20IPB/umkm-ipb-app-1/backend/app/services/order_service.py)). |
