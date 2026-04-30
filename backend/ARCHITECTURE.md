# UMKM IPB App - Backend Architecture

## System Overview

Platform online ordering makanan untuk UMKM IPB dengan fitur:
- Registrasi UMKM (pending approval)
- Browse toko dan menu
- Order makanan dengan pickup
- Payment processing
- Rating dan review
- Order tracking

---

## Class Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────────────┤

User
├── id: UUID (PK)
├── email: VARCHAR (UNIQUE)
├── full_name: VARCHAR
├── role: ENUM (customer, umkm_owner, admin)
├── phone: VARCHAR
├── created_at: DATETIME
├── updated_at: DATETIME
└── relationships:
    ├── umkms: List[UMKM] (1-to-many)
    ├── orders: List[Order] (1-to-many)
    └── reviews: List[Review] (1-to-many)


UMKM
├── id: UUID (PK)
├── owner_id: UUID (FK → User)
├── name: VARCHAR
├── description: TEXT
├── location: VARCHAR
├── image_url: VARCHAR
├── rating: FLOAT
├── phone: VARCHAR
├── status: ENUM (pending, approved, rejected)
├── rejection_reason: TEXT
├── created_at: DATETIME
├── updated_at: DATETIME
└── relationships:
    ├── owner: User (Many-to-1)
    ├── menu_items: List[MenuItem] (1-to-many)
    ├── orders: List[Order] (1-to-many)
    └── reviews: List[Review] (1-to-many)


MenuItem
├── id: UUID (PK)
├── umkm_id: UUID (FK → UMKM)
├── name: VARCHAR
├── description: TEXT
├── category: VARCHAR (Makanan, Minuman, Makanan Ringan)
├── price: DECIMAL(10,2)
├── image_url: VARCHAR
├── is_available: BOOLEAN
├── created_at: DATETIME
├── updated_at: DATETIME
└── relationships:
    ├── umkm: UMKM (Many-to-1)
    └── order_items: List[OrderItem] (1-to-many)


Order
├── id: UUID (PK)
├── order_number: VARCHAR (UNIQUE)
├── customer_id: UUID (FK → User)
├── umkm_id: UUID (FK → UMKM)
├── status: ENUM (pending, confirmed, ready, completed, cancelled)
├── total_price: DECIMAL(12,2)
├── pickup_time: DATETIME
├── notes: TEXT
├── created_at: DATETIME
├── updated_at: DATETIME
└── relationships:
    ├── customer: User (Many-to-1)
    ├── umkm: UMKM (Many-to-1)
    ├── items: List[OrderItem] (1-to-many)
    └── transactions: List[Transaction] (1-to-many)


OrderItem
├── id: UUID (PK)
├── order_id: UUID (FK → Order)
├── menu_item_id: UUID (FK → MenuItem)
├── quantity: INTEGER
├── unit_price: DECIMAL(10,2)
├── subtotal: DECIMAL(12,2)
├── created_at: DATETIME
└── relationships:
    ├── order: Order (Many-to-1)
    └── menu_item: MenuItem (Many-to-1)


Review
├── id: UUID (PK)
├── customer_id: UUID (FK → User)
├── umkm_id: UUID (FK → UMKM)
├── order_id: UUID (FK → Order, nullable)
├── rating: INTEGER (1-5)
├── comment: TEXT
├── created_at: DATETIME
├── updated_at: DATETIME
└── relationships:
    ├── customer: User (Many-to-1)
    └── umkm: UMKM (Many-to-1)


Transaction
├── id: UUID (PK)
├── order_id: UUID (FK → Order)
├── amount: DECIMAL(12,2)
├── payment_method: ENUM (cash, card, e_wallet)
├── status: VARCHAR (pending, success, failed)
├── transaction_date: DATETIME
├── created_at: DATETIME
└── relationships:
    └── order: Order (Many-to-1)

```

---

## Service Layer (OOP Architecture)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER (Business Logic)                 │
├─────────────────────────────────────────────────────────────────────┤

IUserService (Interface)
├── create_user(user_data: UserCreate) → UserResponse
├── get_user(user_id: str) → Optional[UserResponse]
├── get_user_by_email(email: str) → Optional[UserResponse]
├── list_users(skip, limit) → List[UserResponse]
├── update_user(user_id, user_data) → UserResponse
└── delete_user(user_id) → bool

UserService (Implementation)
├── __init__(db: Session)
└── [Implements all IUserService methods]


IUMKMService (Interface)
├── register_umkm(owner_id, umkm_data) → UMKMResponse
├── get_umkm(umkm_id) → Optional[UMKMResponse]
├── get_umkms_by_owner(owner_id) → List[UMKMResponse]
├── list_approved_umkms(skip, limit) → List[UMKMResponse]
├── list_pending_umkms() → List[UMKMResponse]
├── update_umkm(umkm_id, umkm_data) → UMKMResponse
├── approve_umkm(umkm_id) → UMKMResponse
├── reject_umkm(umkm_id, reason) → UMKMResponse
├── add_menu_item(umkm_id, menu_data) → dict
└── calculate_rating(umkm_id) → float

UMKMService (Implementation)
├── __init__(db: Session)
└── [Implements all IUMKMService methods]


IOrderService (Interface)
├── create_order(customer_id, order_data) → OrderResponse
├── get_order(order_id) → Optional[OrderResponse]
├── get_customer_orders(customer_id) → List[OrderResponse]
├── get_umkm_orders(umkm_id) → List[OrderResponse]
├── update_order_status(order_id, status) → OrderResponse
└── cancel_order(order_id) → OrderResponse

OrderService (Implementation)
├── __init__(db: Session)
├── _generate_order_number() → str
├── _calculate_total_price(items_data) → Decimal
└── [Implements all IOrderService methods]

```

---

## API Endpoints Design

### Authentication Endpoints
```
POST   /api/auth/register          - Register user
POST   /api/auth/login             - Login
POST   /api/auth/logout            - Logout
GET    /api/auth/me                - Get current user
```

### User Endpoints
```
GET    /api/users/{user_id}        - Get user profile
PUT    /api/users/{user_id}        - Update profile
```

### UMKM Endpoints
```
POST   /api/umkm/register          - Register UMKM (requires auth)
GET    /api/umkm/{umkm_id}         - Get UMKM details
GET    /api/umkm/approved          - List approved UMKM (customers)
GET    /api/umkm/my-umkm           - Get owned UMKM (UMKM owners)

# Admin only
GET    /api/admin/umkm/pending     - List pending UMKM
POST   /api/admin/umkm/{id}/approve - Approve UMKM
POST   /api/admin/umkm/{id}/reject  - Reject UMKM
```

### Menu Endpoints
```
GET    /api/umkm/{umkm_id}/menu    - List menu items
POST   /api/menu                    - Create menu item (UMKM owner)
PUT    /api/menu/{menu_id}         - Update menu item
DELETE /api/menu/{menu_id}         - Delete menu item
```

### Order Endpoints
```
POST   /api/orders                  - Create order
GET    /api/orders/{order_id}      - Get order details
GET    /api/orders/my-orders       - List customer orders
GET    /api/umkm/{umkm_id}/orders  - List UMKM orders

# Status update
PATCH  /api/orders/{order_id}/status - Update order status
POST   /api/orders/{order_id}/cancel  - Cancel order
```

### Review Endpoints
```
POST   /api/reviews                 - Create review
GET    /api/umkm/{umkm_id}/reviews - Get UMKM reviews
```

---

## Order Status Flow Diagram

```
┌────────┐
│Pending │◄─── Created order
└────┬───┘
     │
     ├─► CANCELLED (customer cancel)
     │
     ▼
┌──────────┐
│Confirmed │◄─── UMKM confirms order
└────┬─────┘
     │
     ├─► CANCELLED (before ready)
     │
     ▼
┌──────┐
│Ready │◄─── UMKM marks as ready
└────┬─┘
     │
     ▼
┌───────────┐
│Completed  │◄─── Customer picks up
└───────────┘
```

---

## Entity Relationships

```
User (1) ─────────► (Many) UMKM
  │
  ├─► (Many) Order
  │
  └─► (Many) Review

UMKM (1) ───────────► (Many) MenuItem
  │
  ├─► (Many) Order
  │
  └─► (Many) Review

Order (1) ──────────► (Many) OrderItem
  │
  └─► (Many) Transaction

MenuItem (1) ────────► (Many) OrderItem
```

---

## Database Indexes (Performance)

```sql
-- User-related
CREATE INDEX idx_umkm_owner_id ON umkm(owner_id);
CREATE INDEX idx_umkm_status ON umkm(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- UMKM-related
CREATE INDEX idx_menu_items_umkm_id ON menu_items(umkm_id);
CREATE INDEX idx_umkm_id ON orders(umkm_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Order-related
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Review & Transaction
CREATE INDEX idx_reviews_umkm_id ON reviews(umkm_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
```

---

## Business Logic Rules

### UMKM Registration
- Status: pending (menunggu approval admin)
- Admin dapat approve atau reject dengan reason
- Setelah approved, UMKM bisa add menu items dan terlihat di customer

### Order Processing
1. **Customer membuat order:**
   - Pilih UMKM
   - Pilih menu items dengan quantity
   - Set pickup time
   - Total harga otomatis calculated

2. **UMKM menerima order:**
   - Status: pending
   - UMKM confirm: pending → confirmed
   - UMKM ready: confirmed → ready
   - Customer pickup: ready → completed

3. **Payment:**
   - Record transaction untuk setiap order
   - Support multiple payment methods

### Review & Rating
- Customer dapat review UMKM setelah order completed
- Rating 1-5 stars
- UMKM rating adalah average dari semua reviews

---

## Development Stack

```
Backend: FastAPI (Python)
Database: PostgreSQL (via Supabase)
ORM: SQLAlchemy
API Documentation: FastAPI Swagger UI
```
