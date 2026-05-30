# BACKEND SUMMARY — UMKM IPB Food Ordering Platform
> Mata Kuliah: Analisis & Desain Sistem (ADS)  
> Versi: 2.0 (Updated)  
> Status: Production-ready — deployed di Render.com, database Supabase (PostgreSQL)

---

## 1. Overview Sistem

Backend aplikasi ini adalah REST API yang dibangun menggunakan FastAPI (Python), berfungsi sebagai pusat pemrosesan data untuk platform pemesanan makanan kampus IPB. Seluruh data persisten disimpan di Supabase (PostgreSQL) yang diakses melalui SQLAlchemy ORM.

```
Client (Next.js) ──► FastAPI (Render.com) ──► SQLAlchemy ORM ──► Supabase (PostgreSQL)
```

---

## 2. Arsitektur & Design Pattern

### 2.1 Layered Architecture (3-Tier)

Backend menerapkan arsitektur berlapis yang memisahkan tanggung jawab secara tegas:

```
┌─────────────────────────────────────────────────┐
│             API Layer (Endpoints)                │  ← HTTP request/response, routing
├─────────────────────────────────────────────────┤
│             Service Layer (Business Logic)       │  ← Aturan bisnis, validasi domain
├─────────────────────────────────────────────────┤
│             Data Layer (SQLAlchemy ORM)          │  ← Akses database, mapping tabel
├─────────────────────────────────────────────────┤
│             Database (Supabase / PostgreSQL)     │  ← Penyimpanan permanen
└─────────────────────────────────────────────────┘
```

### 2.2 Object-Oriented Programming (OOP) — Prinsip Utama

#### Interface + Abstract Class (Abstraction & Polymorphism)
Setiap service mendefinisikan interface abstrak menggunakan `ABC` (Abstract Base Class) Python, lalu diimplementasikan oleh kelas konkret. Ini memenuhi prinsip Dependency Inversion (SOLID):

```python
# Contoh pada user_service.py
class IUserService(ABC):
    """Interface untuk User Service"""
    @abstractmethod
    def create_user(self, user_data: UserCreate) -> UserResponse: pass
    
    @abstractmethod
    def get_user(self, user_id: str) -> Optional[UserResponse]: pass
    # ... abstrak lainnya

class UserService(IUserService):
    """Implementasi konkret dari IUserService"""
    def __init__(self, db: Session):
        self.db = db  # Dependency Injection

    def create_user(self, user_data: UserCreate) -> UserResponse:
        # Implementasi nyata...
```

Pola ini diulang konsisten pada:
| Interface        | Implementasi Konkret | Jumlah Abstract Method |
|------------------|----------------------|------------------------|
| `IUserService`   | `UserService`        | 7                      |
| `IUMKMService`   | `UMKMService`        | 11                     |
| `IOrderService`  | `OrderService`       | 8                      |

#### Dependency Injection
FastAPI menggunakan mekanisme `Depends()` untuk menyuntikkan session database ke setiap endpoint tanpa coupling langsung:

```python
@router.post("/signup")
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)   # Injeksi dependency
    return service.create_user(user_data)
```

#### Encapsulation
Logika bisnis dikapsulasi penuh di dalam service class. Endpoint hanya memanggil method service; mereka tidak mengetahui detail implementasi (query SQL, hashing, dll).

### 2.3 ORM Entities & Relasi (ERD via SQLAlchemy)

Setiap entitas direpresentasikan sebagai kelas Python yang mewarisi `Base` dari SQLAlchemy, menggambarkan konsep OOP entity/model:

```
User ─────────────┬──► UMKM ─────┬──► MenuItem ──► OrderItem ─┐
                  │               └──► Order ◄──────────────────┘
                  ├──► Order ◄──── Transaction
                  └──► Review ──► UMKM
                                   └──► Promo
```

Relationship yang diimplementasikan:
- `User.umkms` → one-to-many ke `UMKM`
- `User.orders` → one-to-many ke `Order`
- `UMKM.menu_items` → one-to-many ke `MenuItem` (cascade delete)
- `Order.items` → one-to-many ke `OrderItem` (cascade delete)
- `Order.transactions` → one-to-many ke `Transaction`

---

## 3. Struktur Direktori Backend

```
backend/
├── app/
│   ├── main.py              # Entry point FastAPI, CORS, static files
│   ├── config.py            # Settings via pydantic-settings (.env)
│   ├── database.py          # Engine, SessionLocal, get_db(), init_db()
│   ├── api/
│   │   ├── __init__.py      # Router aggregator (api_router)
│   │   └── endpoints/
│   │       ├── auth.py      # POST /auth/login, POST /auth/signup
│   │       ├── users.py     # CRUD users + GET /users/count
│   │       ├── umkm.py      # CRUD UMKM + admin approval workflow
│   │       ├── orders.py    # Order lifecycle + file upload
│   │       ├── reviews.py   # Rating & komentar UMKM
│   │       └── promos.py    # Manajemen kode promo diskon
│   ├── models/
│   │   ├── database.py      # SQLAlchemy ORM models (7 entitas)
│   │   └── schemas.py       # Pydantic schemas (request/response DTOs)
│   ├── services/
│   │   ├── user_service.py  # IUserService + UserService
│   │   ├── umkm_service.py  # IUMKMService + UMKMService
│   │   └── order_service.py # IOrderService + OrderService
│   └── static/
│       └── payment_proofs/  # Upload bukti pembayaran
├── requirements.txt
├── render.yaml              # Deployment blueprint Render.com
└── .env                     # Variabel lingkungan (DATABASE_URL, SECRET_KEY)
```

---

## 4. API Endpoints Lengkap

Base URL Production: `https://<nama-service>.onrender.com/api/v1`  
Dokumentasi Interaktif: `/docs` (Swagger UI otomatis dari FastAPI)

### Auth
| Method | Endpoint         | Deskripsi                             |
|--------|------------------|---------------------------------------|
| POST   | `/auth/login`    | Login, return JWT access token        |
| POST   | `/auth/signup`   | Registrasi user baru                  |

### Users
| Method | Endpoint                  | Deskripsi                        |
|--------|---------------------------|----------------------------------|
| GET    | `/users`                  | List semua user (admin)          |
| GET    | `/users/count`            | Jumlah total user terdaftar      |
| GET    | `/users/{id}`             | Detail satu user                 |
| GET    | `/users/email/{email}`    | Cari user berdasarkan email      |
| PATCH  | `/users/{id}`             | Update profil user               |
| DELETE | `/users/{id}`             | Hapus user                       |

### UMKM
| Method | Endpoint                    | Deskripsi                              |
|--------|-----------------------------|----------------------------------------|
| GET    | `/umkm`                     | List UMKM approved (untuk mahasiswa)   |
| POST   | `/umkm/register`            | Daftar UMKM baru (status: pending)     |
| GET    | `/umkm/{id}`                | Detail UMKM tertentu                   |
| GET    | `/umkm/owner/{owner_id}`    | UMKM milik seorang owner               |
| POST   | `/umkm/{id}/menu`           | Tambah menu item ke UMKM              |
| GET    | `/umkm/admin/pending`       | [Admin] Daftar UMKM pending            |
| GET    | `/umkm/admin/suspended`     | [Admin] Daftar UMKM ditangguhkan       |
| POST   | `/umkm/{id}/approve`        | [Admin] Setujui UMKM                   |
| POST   | `/umkm/{id}/reject`         | [Admin] Tolak UMKM + alasan            |
| POST   | `/umkm/{id}/suspend`        | [Admin] Tangguhkan UMKM                |
| POST   | `/umkm/{id}/reactivate`     | [Admin] Aktifkan kembali UMKM          |

### Orders
| Method | Endpoint                             | Deskripsi                                      |
|--------|--------------------------------------|------------------------------------------------|
| GET    | `/orders/all`                        | Semua order (global state)                     |
| POST   | `/orders`                            | Buat order baru (dengan validasi promo)        |
| GET    | `/orders/{id}`                       | Detail satu order                              |
| GET    | `/orders/customer/{customer_id}`     | Order by customer                              |
| GET    | `/orders/umkm/{umkm_id}`            | Order masuk untuk UMKM                         |
| PATCH  | `/orders/{id}/status`               | Update status order (state machine)            |
| POST   | `/orders/{id}/cancel`               | Batalkan order                                 |
| POST   | `/orders/{id}/payment-proof`        | Upload bukti pembayaran (multipart/form-data)  |

### Promos
| Method | Endpoint                | Deskripsi                             |
|--------|-------------------------|---------------------------------------|
| GET    | `/promos`               | Promo aktif (bisa filter per umkm_id) |
| GET    | `/promos/all`           | Semua promo termasuk expired (admin)  |
| GET    | `/promos/{id}`          | Detail promo                          |
| GET    | `/promos/code/{code}`   | Validasi kode promo saat checkout     |
| POST   | `/promos`               | Buat promo baru                       |
| PATCH  | `/promos/{id}`          | Update promo                          |
| DELETE | `/promos/{id}`          | Hapus promo                           |

---

## 5. Business Logic Penting

### 5.1 Order State Machine
Order mengikuti state machine dengan transisi yang divalidasi secara ketat:

```
           ┌──────────────────────────────────────────┐
           ▼                                          │
[pending] ──► [confirmed] ──► [ready] ──► [completed] │
    │               │                                  │
    └──────────────►└──────────────────► [cancelled] ──┘
```

Implementasi di `OrderService.update_order_status()`:
```python
valid_transitions = {
    "pending":   ["confirmed", "cancelled"],
    "confirmed": ["ready", "cancelled"],
    "ready":     ["completed"],
    "completed": [],
    "cancelled": []
}
```

### 5.2 Promo Validation Logic & Coercion
Saat `create_order()` dipanggil, jika ada `promo_code`:
1. Cek kode valid dan aktif di database
2. Cek masa berlaku (`valid_from` ≤ `now` ≤ `valid_until`)
3. Cek minimum order terpenuhi
4. Cek scope UMKM (promo global vs. promo khusus UMKM)
5. Hitung potongan: `percent` (dengan `max_discount`) atau `fixed`
6. Tulis catatan promo ke `notes` pesanan

*Catatan Tipe Data (Supabase)*: Supabase menyimpan ID sebagai objek UUID di PostgreSQL. Agar skema Pydantic (`PromoResponse`) kompatibel dengan data yang dikembalikan SQLAlchemy tanpa memicu `ValidationError` (Internal Server Error 500), ditambahkan `@field_validator('id', 'umkm_id', mode='before')` di `schemas.py` untuk mengonversi UUID ke string secara otomatis sebelum divalidasi.

### 5.3 Payment Proof Upload
- File di-upload sebagai `multipart/form-data`
- Disimpan ke `backend/static/payment_proofs/{order_id}.jpg`
- Diakses via URL statis: `/static/payment_proofs/{filename}`
- Status order otomatis berubah ke `"confirmed"` setelah upload

### 5.4 Autentikasi JWT
- Login menggunakan email + password yang di-hash dengan bcrypt
- Return JWT token (HS256) dengan payload `sub: email`, `role`, `exp`
- Token expiry: 30 menit (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)

---

## 6. Database — Supabase (PostgreSQL)

### 6.1 Entitas & Tabel

| Tabel           | Kelas ORM      | Kunci Relasi                    |
|-----------------|----------------|---------------------------------|
| `users`         | `User`         | PK: `id` (UUID)                 |
| `umkm`          | `UMKM`         | FK: `owner_id → users.id`       |
| `menu_items`    | `MenuItem`     | FK: `umkm_id → umkm.id`         |
| `orders`        | `Order`        | FK: `customer_id`, `umkm_id`    |
| `order_items`   | `OrderItem`    | FK: `order_id`, `menu_item_id`  |
| `reviews`       | `Review`       | FK: `customer_id`, `umkm_id`    |
| `transactions`  | `Transaction`  | FK: `order_id → orders.id`      |
| `promos`        | `Promo`        | FK optional: `umkm_id`          |

### 6.2 Koneksi Database
Koneksi dikonfigurasi melalui environment variable `DATABASE_URL` di file `.env`:
```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```
SQLAlchemy membuat koneksi dengan connection pool (`pool_size=10`, `max_overflow=20`) dan `pool_pre_ping=True` untuk menjaga koneksi tetap hidup.

---

## 7. Konfigurasi & Environment Variables

| Variable                      | Default                        | Keterangan                        |
|-------------------------------|--------------------------------|-----------------------------------|
| `DATABASE_URL`                | `sqlite:///./umkm_ipb.db`      | Wajib diisi PostgreSQL di prod    |
| `SECRET_KEY`                  | `your-secret-key...`           | Wajib diubah di production        |
| `ALGORITHM`                   | `HS256`                        | Algoritma JWT                     |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30`                           | Masa berlaku token                |
| `ALLOWED_ORIGINS`             | `["http://localhost:3000", ...]`| CORS whitelist                    |
| `SUPABASE_URL`                | `None`                         | Opsional (jika langsung Supabase) |
| `SUPABASE_KEY`                | `None`                         | Opsional                          |

---

## 8. Teknologi & Dependencies

| Library              | Versi    | Fungsi                                          |
|----------------------|----------|-------------------------------------------------|
| `fastapi`            | 0.104.1  | Web framework REST API                          |
| `uvicorn`            | 0.24.0   | ASGI server                                     |
| `sqlalchemy`         | 2.0.23   | ORM untuk PostgreSQL/SQLite                     |
| `psycopg2-binary`    | 2.9.9    | Driver koneksi PostgreSQL                       |
| `pydantic`           | 2.5.0    | Validasi data & serialisasi (schema)            |
| `pydantic-settings`  | 2.1.0    | Manajemen konfigurasi dari `.env`               |
| `python-jose`        | 3.3.0    | Enkoding/dekoding JWT                           |
| `passlib` + `bcrypt` | 1.7.4    | Hashing password aman                           |
| `supabase`           | 2.3.5    | Supabase Python client (opsional)               |
| `python-multipart`   | 0.0.29   | Upload file (bukti pembayaran)                  |

---

## 9. Deployment

Platform: Render.com (Free Tier)  
File konfigurasi: `render.yaml` di root project

```yaml
services:
  - type: web
    name: ads-umkm-ipb-backend
    env: python
    rootDirectory: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL    # Diisi manual di dashboard Render
      - key: SECRET_KEY      # Di-generate otomatis oleh Render
      - key: ALLOWED_ORIGINS
        value: '[""]'
```

Database: Supabase (PostgreSQL cloud)  
Tabel dibuat otomatis oleh `init_db()` → `Base.metadata.create_all()` saat server pertama kali start.
