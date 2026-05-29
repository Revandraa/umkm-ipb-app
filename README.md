# UMKM IPB — Platform Pemesanan Kuliner Kampus

> Proyek Mata Kuliah Analisis & Desain Sistem (ADS)  
> Institut Pertanian Bogor (IPB University)

Platform web terintegrasi untuk pemesanan makanan dari UMKM di lingkungan kampus IPB. Menghubungkan mahasiswa, pemilik UMKM, dan admin dalam satu ekosistem digital dengan database terpusat berbasis cloud.

---

## Deskripsi Singkat

UMKM IPB adalah aplikasi full-stack yang memungkinkan:
- Mahasiswa menelusuri UMKM, memesan makanan, dan membayar secara digital
- Pemilik UMKM mengelola menu, menerima pesanan, dan memantau statistik usaha
- Admin mengawasi seluruh platform: approval UMKM, manajemen promo, dan monitoring

---

## Fitur Utama

| Fitur                          | Mahasiswa | UMKM | Admin |
|--------------------------------|:---------:|:----:|:-----:|
| Browse & cari UMKM             | ✅        |      |       |
| Pesan makanan + pilih jam ambil | ✅       |      |       |
| Gunakan kode promo diskon       | ✅       |      |       |
| Upload bukti pembayaran         | ✅       |      |       |
| Kelola menu (tambah/edit/hapus) |          | ✅   |       |
| Terima & update status pesanan  |          | ✅   |       |
| Approve / reject UMKM baru      |          |      | ✅    |
| Suspend / reaktivasi UMKM       |          |      | ✅    |
| Kelola kode promo               |          |      | ✅    |
| Dashboard statistik platform    |          |      | ✅    |

---

## Arsitektur Sistem

```
┌──────────────────┐        REST API        ┌──────────────────┐
│                  │ ──── fetch() JSON ────► │                  │
│  Frontend        │                        │  Backend         │
│  Next.js 16      │ ◄───────────────────── │  FastAPI (Python)│
│  React 19 + TS   │                        │                  │
│  Vercel          │                        │  Render.com      │
└──────────────────┘                        └────────┬─────────┘
                                                     │
                                              SQLAlchemy ORM
                                                     │
                                            ┌────────▼─────────┐
                                            │  Supabase        │
                                            │  (PostgreSQL)    │
                                            └──────────────────┘
```

### Design Pattern & Prinsip OOP

Backend (Python / FastAPI):
- Layered Architecture — API Layer → Service Layer → Data Layer
- Interface + Abstract Class — Setiap service memiliki interface abstrak (`IUserService`, `IUMKMService`, `IOrderService`) yang diimplementasikan oleh kelas konkret → memenuhi Dependency Inversion Principle (SOLID)
- Dependency Injection — FastAPI `Depends()` menyuntikkan database session ke endpoint
- ORM Entity Mapping — 8 entitas Python (User, UMKM, MenuItem, Order, OrderItem, Review, Transaction, Promo) dipetakan ke tabel PostgreSQL via SQLAlchemy
- State Machine — Order mengikuti state machine ketat: `pending → confirmed → ready → completed` atau `cancelled`

Frontend (TypeScript / Next.js):
- Component-Based Architecture — UI dibagi menjadi komponen mandiri dan dapat digunakan ulang
- Context API (Observer Pattern) — `DataContext` dan `RoleContext` sebagai global state
- Optimistic UI — Order langsung tampil di UI sebelum konfirmasi server
- Role-Based Conditional Rendering — Satu aplikasi menampilkan view berbeda berdasarkan peran

---

## Tech Stack

| Layer     | Teknologi                          |
|-----------|------------------------------------|
| Frontend  | Next.js 16, React 19, TypeScript   |
| Styling   | Tailwind CSS v4, Framer Motion     |
| UI        | Shadcn/UI, Radix UI, Lucide Icons  |
| Backend   | FastAPI, Uvicorn, Python           |
| ORM       | SQLAlchemy 2.0                     |
| Database  | Supabase (PostgreSQL)              |
| Auth      | JWT (python-jose), bcrypt          |
| Deploy FE | Vercel                             |
| Deploy BE | Render.com                         |

---

## Model Data (ERD Ringkas)

```
User ──► UMKM ──► MenuItem
          │            └──► OrderItem ─┐
          └──► Order ◄─────────────────┘
                   └──► Transaction
User ──► Review ──► UMKM
UMKM ──► Promo (opsional, bisa global)
```

8 entitas utama: `users`, `umkm`, `menu_items`, `orders`, `order_items`, `reviews`, `transactions`, `promos`

---

## API Endpoints (Ringkasan)

| Domain   | Contoh Endpoint                        | Deskripsi                      |
|----------|----------------------------------------|--------------------------------|
| Auth     | `POST /api/v1/auth/login`              | Login, return JWT              |
| Auth     | `POST /api/v1/auth/signup`             | Registrasi user                |
| UMKM     | `GET /api/v1/umkm`                     | List UMKM approved             |
| UMKM     | `POST /api/v1/umkm/{id}/approve`       | [Admin] Setujui UMKM           |
| Orders   | `POST /api/v1/orders`                  | Buat pesanan baru              |
| Orders   | `PATCH /api/v1/orders/{id}/status`     | Update status pesanan          |
| Orders   | `POST /api/v1/orders/{id}/payment-proof` | Upload bukti bayar           |
| Promos   | `GET /api/v1/promos/code/{code}`       | Validasi kode promo            |

Dokumentasi lengkap tersedia di: `https://<backend-url>/docs` (Swagger UI)

---

## Struktur Proyek

```
umkm-ipb-app-1/
├── frontend/          # Next.js App (deploy: Vercel)
│   ├── app/           # Pages & layouts
│   ├── components/    # UI components & views
│   └── lib/           # Context, utils, mock data
├── backend/           # FastAPI App (deploy: Render.com)
│   ├── app/
│   │   ├── api/       # Endpoints (auth, umkm, orders, promos, ...)
│   │   ├── models/    # ORM models + Pydantic schemas
│   │   └── services/  # Business logic (dengan interface abstrak)
│   └── requirements.txt
├── render.yaml        # Render.com deployment config
├── BACKEND_SUMMARY.md
└── FRONTEND_SUMMARY.md
```

---

## Cara Menjalankan Lokal

Backend:
```bash
cd backend
pip install -r requirements.txt
# Buat file .env dengan DATABASE_URL
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
npm install
# Buat file .env.local dengan NEXT_PUBLIC_API_URL
npm run dev
```

---

## Deployment

- Frontend: Push ke GitHub → otomatis deploy di Vercel
- Backend: Terhubung ke GitHub → otomatis deploy di Render.com
- Database: Supabase (PostgreSQL cloud) — tabel dibuat otomatis saat backend pertama kali start

> Lihat `BACKEND_SUMMARY.md` dan `FRONTEND_SUMMARY.md` untuk dokumentasi teknis lengkap.
