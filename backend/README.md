# UMKM IPB Food Ordering Platform - Backend API

Backend API untuk platform online ordering makanan UMKM IPB dengan fitur UMKM registration, menu management, order processing, dan rating system.

## 🏗️ Architecture

Aplikasi ini menggunakan **Clean Architecture** dengan pemisahan yang jelas antara:
- **Database Layer** (SQLAlchemy ORM Models)
- **Service Layer** (Business Logic dengan OOP Interfaces)
- **API Layer** (FastAPI Endpoints)

Lihat [ARCHITECTURE.md](./ARCHITECTURE.md) untuk class diagram dan entity relationships lengkap.

## 📋 Tech Stack

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Server**: Uvicorn
- **Documentation**: Automatic Swagger UI

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- PostgreSQL database (Supabase)
- pip atau conda

### Installation

1. **Clone repository**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup environment variables**
```bash
cp .env.example .env
```
Edit `.env` dengan konfigurasi database Supabase Anda:
```
DATABASE_URL=postgresql://user:password@host:5432/umkm_ipb
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

5. **Initialize database**
```bash
python -m app.database
```

6. **Run server**
```bash
python app/main.py
```

Server akan berjalan di `http://localhost:8000`

## 📚 API Documentation

### Automatic Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Base URL
```
http://localhost:8000/api/v1
```

## 🔌 API Endpoints

### User Management
```
POST   /users                      - Create user
GET    /users/{user_id}           - Get user profile
PUT    /users/{user_id}           - Update profile
```

### UMKM Management
```
POST   /umkm/register             - Register UMKM (pending approval)
GET    /umkm/{umkm_id}            - Get UMKM details
GET    /umkm                       - List approved UMKM
GET    /umkm/owner/{owner_id}     - Get owner's UMKM
POST   /umkm/{umkm_id}/menu       - Add menu item

[ADMIN]
GET    /umkm/admin/pending        - List pending UMKM
POST   /umkm/{umkm_id}/approve    - Approve UMKM
POST   /umkm/{umkm_id}/reject     - Reject UMKM
```

### Orders
```
POST   /orders                     - Create order
GET    /orders/{order_id}         - Get order details
GET    /orders/customer/{id}      - Get customer orders
GET    /orders/umkm/{id}          - Get UMKM orders
PATCH  /orders/{order_id}/status  - Update order status
POST   /orders/{order_id}/cancel  - Cancel order
```

### Reviews
```
POST   /reviews                    - Create review
GET    /reviews/umkm/{umkm_id}    - Get UMKM reviews
```

## 📊 Database Schema

Lihat [ARCHITECTURE.md](./ARCHITECTURE.md) untuk diagram entity relationships dan schema details.

### Main Tables
- **users** - User accounts (customer, umkm_owner, admin)
- **umkm** - Small business (toko makanan)
- **menu_items** - Menu untuk setiap UMKM
- **orders** - Order transactions
- **order_items** - Line items dalam order
- **reviews** - Rating dan comments dari customers
- **transactions** - Payment records

## 🎯 Business Logic

### UMKM Registration Flow
```
1. Owner daftar sebagai user
2. Owner registrasi UMKM → status = "pending"
3. Admin review pendaftaran
4. Admin approve/reject
5. Jika approved → UMKM bisa add menu dan menerima orders
```

### Order Processing Flow
```
pending → confirmed → ready → completed
   ↓
cancelled (bisa dari pending atau confirmed)

Customer side:
1. Browse approved UMKM dan menu
2. Create order dengan menu items dan pickup time
3. Wait untuk UMKM confirmation
4. Pickup ketika ready
5. Leave review setelah selesai

UMKM side:
1. Receive order notification
2. Confirm order (pending → confirmed)
3. Prepare order
4. Mark as ready (confirmed → ready)
5. Customer pickup
```

## 🔐 Authentication (Future Implementation)

Endpoints akan dilindungi dengan JWT authentication:
```python
# Example (akan diimplementasikan)
@app.post("/auth/login")
def login(credentials: LoginSchema):
    # Return JWT token
    
@app.get("/orders", dependencies=[Depends(verify_token)])
def get_orders():
    # Protected endpoint
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── database.py             # Database connection
│   ├── models/
│   │   ├── schemas.py          # Pydantic models (validation)
│   │   └── database.py         # SQLAlchemy models (ORM)
│   ├── services/
│   │   ├── user_service.py     # User business logic
│   │   ├── umkm_service.py     # UMKM business logic
│   │   └── order_service.py    # Order business logic
│   └── api/
│       ├── __init__.py
│       └── endpoints/
│           ├── users.py        # User endpoints
│           ├── umkm.py         # UMKM endpoints
│           ├── orders.py       # Order endpoints
│           └── reviews.py      # Review endpoints
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database migrations
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
├── ARCHITECTURE.md             # Architecture documentation
└── README.md                   # This file
```

## 🛠️ OOP Design Patterns

### 1. Service Layer Pattern
Setiap service adalah interface + implementation:
```python
# Interface
class IUserService(ABC):
    @abstractmethod
    def create_user(self, user_data: UserCreate) -> UserResponse:
        pass

# Implementation
class UserService(IUserService):
    def create_user(self, user_data: UserCreate) -> UserResponse:
        # Business logic
```

### 2. Repository Pattern
Services mengelola data melalui SQLAlchemy models:
```python
service = UserService(db)
user = service.create_user(user_data)
```

### 3. Dependency Injection
FastAPI menggunakan Depends untuk inject database session:
```python
@app.get("/endpoint")
def endpoint(db: Session = Depends(get_db)):
    service = UserService(db)
```

## 💾 Database Migrations

SQL migrations tersimpan di `supabase/migrations/`:

```bash
# Apply migrations (manual di Supabase dashboard atau programmatic)
python -c "from app.database import init_db; init_db()"
```

## 🧪 Testing (Future)

```bash
# Run tests
pytest

# With coverage
pytest --cov=app
```

## 📝 Example API Usage

### Create Order
```bash
curl -X POST "http://localhost:8000/api/v1/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "uuid-123",
    "umkm_id": "uuid-456",
    "pickup_time": "2024-05-01T14:30:00",
    "items": [
      {
        "menu_item_id": "uuid-789",
        "quantity": 2
      }
    ]
  }'
```

### Update Order Status
```bash
curl -X PATCH "http://localhost:8000/api/v1/orders/order-uuid/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

## 🐛 Troubleshooting

### Database Connection Error
```
Error: could not connect to server
```
Check DATABASE_URL di .env dan pastikan PostgreSQL running

### Import Error
```
ModuleNotFoundError: No module named 'app'
```
Pastikan virtual environment aktif dan dependencies terinstall

## 📚 Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design dan class diagrams
- [Supabase Docs](https://supabase.com/docs) - Database documentation
- [FastAPI Docs](https://fastapi.tiangolo.com/) - Framework documentation
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/) - ORM documentation

## 📞 Support

Untuk issues atau pertanyaan, buat issue di repository.

## 📄 License

Private project for UMKM IPB
