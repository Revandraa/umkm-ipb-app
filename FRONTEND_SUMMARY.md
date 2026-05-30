# FRONTEND SUMMARY — UMKM IPB Food Ordering Platform

> Mata Kuliah: Analisis & Desain Sistem (ADS)  
> Versi: 1.0  
> Status: Production-ready — deployed di Vercel, terintegrasi penuh dengan Backend FastAPI

---

## 1. Overview Sistem

Frontend adalah Single Page Application (SPA) berbasis Next.js 16 + React 19 + TypeScript, berjalan di browser pengguna dan berkomunikasi dengan backend FastAPI melalui REST API. Antarmuka mendukung tiga peran pengguna berbeda dalam satu aplikasi.

```
Browser ──► Next.js (Vercel) ──► fetch() ──► FastAPI (Render.com) ──► Supabase
```

---

## 2. Arsitektur & Design Pattern

### 2.1 Component-Based Architecture

Frontend dibangun menggunakan Component-Based Architecture, di mana setiap bagian UI adalah komponen React yang mandiri, dapat digunakan ulang, dan memiliki tanggung jawab tunggal (Single Responsibility Principle).

```
Page (app/page.tsx)
  └── DataProvider          ← Global state context (data dari API)
        └── RoleProvider    ← Global state context (peran pengguna)
              └── MainContent
                    ├── AuthView          ← Halaman login/signup
                    ├── Header            ← Navigasi atas
                    ├── MahasiswaView     ← View untuk mahasiswa
                    ├── UMKMView          ← View untuk pemilik UMKM
                    ├── AdminView         ← View untuk admin
                    ├── UMKMRegistrationView  ← Form daftar UMKM
                    └── Footer
```

### 2.2 Context API — State Management Pattern

Frontend menggunakan React Context API sebagai solusi state management global, menghindari prop drilling yang berlebihan. Ini merupakan implementasi Observer Pattern secara fungsional:

#### DataContext (`lib/data-context.tsx`)

Context utama yang menyimpan semua data dan menjadi single source of truth untuk seluruh aplikasi.

State yang dikelola:
| State | Tipe | Sumber Data |
|--------------------|---------------|------------------------------------|
| `approvedUMKMs` | `UMKM[]` | `GET /api/v1/umkm` |
| `pendingUMKMs` | `UMKM[]` | `GET /api/v1/umkm/admin/pending` |
| `suspendedUMKMs` | `UMKM[]` | `GET /api/v1/umkm/admin/suspended` |
| `orders` | `Order[]` | `GET /api/v1/orders/all` |
| `promos`           | `Promo[]`     | `GET /api/v1/promos/all` (fallback ke `/promos`) |
| `customerId`       | `string`      | `localStorage` (user login)        |
| `activeUsersCount` | `number`      | `GET /api/v1/users/count`          |

Actions/Methods yang diekspos:
| Method | HTTP Call | Deskripsi |
|---------------------|----------------------------------------|-----------------------------------|
| `addOrder()` | `POST /orders?customer_id=...` | Buat pesanan baru |
| `uploadPaymentProof()` | `POST /orders/{id}/payment-proof` | Upload bukti bayar |
| `updateOrderStatus()` | `PATCH /orders/{id}/status` | Update status (UMKM/Admin) |
| `approveUMKM()` | (local state only) | Pindahkan UMKM ke approved |
| `rejectUMKM()` | (local state only) | Hapus UMKM dari pending |
| `suspendUMKM()` | (local state only) | Pindahkan ke suspended |
| `reactivateUMKM()` | (local state only) | Aktifkan kembali dari suspended |
| `addMenuItem()` | (local state only) | Tambah menu item (optimistic) |
| `updateMenuItem()` | (local state only) | Edit menu item |
| `deleteMenuItem()` | (local state only) | Hapus menu item |
| `addPromo()` | `POST /api/v1/promos` | Membuat promo baru (Admin) |
| `updatePromo()` | `PATCH /api/v1/promos/{id}` | Mengedit detail promo (Admin) |
| `deletePromo()` | `DELETE /api/v1/promos/{id}` | Menghapus promo (Admin) |

#### RoleContext (`lib/role-context.tsx`)

Menyimpan dan mendistribusikan peran aktif pengguna (`mahasiswa | umkm | admin | umkm-register`) ke seluruh komponen.

### 2.3 Optimistic UI Pattern

Untuk pengalaman pengguna yang responsif, `addOrder()` menerapkan Optimistic UI:

1. Order ditambahkan ke state lokal segera dengan ID sementara
2. Request POST dikirim ke backend secara asynchronous
3. Jika berhasil → ID sementara diganti dengan ID dari server
4. Jika gagal → state lokal tetap (offline fallback)

```typescript
// Optimistic update di DataContext
const tempId = `ORD-TEMP-${Date.now()}`;
setOrders(prev => [newOrder, ...prev])  // Langsung tampil di UI

const res = await fetch(`${backendUrl}/orders?customer_id=${customerId}`, {...});
if (res.ok) {
  // Replace temp order dengan data asli dari server
  setOrders(prev => prev.map(o => o.id === tempId ? serverOrder : o));
}
```

### 2.4 Role-Based Rendering (Conditional Rendering)

Sistem menampilkan view berbeda berdasarkan peran yang tersimpan di RoleContext, menerapkan Strategy Pattern dalam pemilihan komponen:

```typescript
// page.tsx — pemilihan view berdasarkan role
{role === "mahasiswa"   && <MahasiswaView />}
{role === "umkm"        && <UMKMView />}
{role === "umkm-register" && <UMKMRegistrationView />}
{role === "admin"       && <AdminView />}
```

---

## 3. Struktur Direktori Frontend

```
frontend/
├── app/
│   ├── page.tsx              # Root page — auth check, provider wrapping
│   ├── layout.tsx            # Global layout, metadata, font, Vercel Analytics
│   ├── globals.css           # Global styles (Tailwind v4 config)
│   ├── api/v1/               # Next.js Route Handlers (proxy API)
│   └── database/             # Halaman debug/tampilan database
│       └── page.tsx
├── components/
│   ├── auth-view.tsx         # Form login & signup (koneksi ke /auth API)
│   ├── header.tsx            # Navbar dengan avatar dan logout
│   ├── footer.tsx            # Footer global
│   ├── order-form.tsx        # Form pemesanan lengkap (38KB — komponen terbesar)
│   ├── umkm-card.tsx         # Kartu UMKM untuk mahasiswa
│   ├── umkm-detail-modal.tsx # Modal detail UMKM + menu
│   ├── umkm-registration-form.tsx # Form pendaftaran UMKM baru
│   ├── admin-umkm-detail-modal.tsx # Modal detail untuk admin
│   ├── mahasiswa-bottom-nav.tsx    # Navigasi bawah mobile
│   ├── logo.tsx              # Komponen logo aplikasi
│   ├── role-switcher.tsx     # Dev tool: ganti peran
│   ├── theme-provider.tsx    # Dark/light mode provider
│   ├── ui/                   # Shadcn/ui components (Radix UI)
│   └── views/
│       ├── mahasiswa-view.tsx       # Dashboard mahasiswa (browse, pesan)
│       ├── mahasiswa-account-view.tsx  # Profil & riwayat order mahasiswa
│       ├── mahasiswa-promo-view.tsx    # Halaman promo & kode diskon
│       ├── umkm-view.tsx            # Dashboard UMKM (menu, order masuk)
│       ├── umkm-registration-view.tsx  # Wrapper view pendaftaran UMKM
│       └── admin-view.tsx           # Dashboard admin (approve, statistik)
├── lib/
│   ├── data-context.tsx      # Global data state + API integration
│   ├── role-context.tsx      # Global role state
│   ├── mock-data.ts          # Data awal/fallback (dipakai saat backend offline)
│   ├── utils.ts              # cn() utility untuk class merging
│   └── supabase/
│       ├── client.ts         # Supabase client-side initialization
│       └── queries.ts        # Supabase query helpers (opsional)
├── supabase/
│   └── migrations/           # SQL migration scripts
├── public/                   # Static assets (gambar, ikon)
├── package.json
└── next.config.ts
```

---

## 4. Fitur per Role

### 4.1 Mahasiswa (Role: `customer`)

| Fitur                    | Komponen                                   |
| ------------------------ | ------------------------------------------ |
| Browse UMKM approved     | `MahasiswaView` → `UMKMCard`               |
| Lihat detail & menu UMKM | `UMKMDetailModal`                          |
| Pesan makanan            | `OrderForm` (form lengkap, validasi promo) |
| Upload bukti pembayaran  | `OrderForm` (file upload section)          |
| Lihat riwayat pesanan    | `MahasiswaView` (tab pesanan)              |
| Kelola profil akun       | `MahasiswaAccountView`                     |
| Lihat & gunakan promo    | `MahasiswaPromoView`                       |

### 4.2 Pemilik UMKM (Role: `umkm_owner`)

| Fitur                  | Komponen                   |
| ---------------------- | -------------------------- |
| Dashboard order masuk  | `UMKMView` (tab pesanan)   |
| Terima / tolak pesanan | `UMKMView` (status update) |
| Kelola menu (CRUD)     | `UMKMView` (tab menu)      |
| Lihat statistik UMKM   | `UMKMView` (tab ringkasan) |
| Daftar UMKM baru       | `UMKMRegistrationView`     |

### 4.3 Admin (Role: `admin`)

| Fitur                      | Komponen                             |
| -------------------------- | ------------------------------------ |
| Approve / reject UMKM baru | `AdminView` (tab UMKM pending)       |
| Suspend / reactivate UMKM  | `AdminView` + `AdminUMKMDetailModal` |
| Monitor semua order        | `AdminView` (tab orders)             |
| Manajemen promo (CRUD)     | `AdminView` (tab promo)              |
| Lihat statistik platform   | `AdminView` (tab dashboard)          |
| Manajemen users            | `AdminView` (tab users)              |

---

## 5. Alur Autentikasi Frontend

```
User buka app
    │
    ▼
Cek localStorage (token + user)
    ├── Ada token? ──► setIsAuthenticated(true), set role dari user.role
    └── Tidak ada? ──► Tampilkan AuthView (Login/Signup)
            │
            ▼
        User isi form Login → POST /api/v1/auth/login
            ├── Berhasil → simpan token & user di localStorage → masuk app
            └── Gagal → tampilkan error toast
```

Penyimpanan session: `localStorage`

- `token` → JWT access token (string)
- `user` → JSON object `{id, email, full_name, role, phone, created_at}`

Role mapping: Backend role → Frontend role

```
customer    → mahasiswa
umkm_owner  → umkm
admin       → admin
```

---

## 6. Integrasi Backend (Data Fetching)

### 6.1 Environment Variable

```env
NEXT_PUBLIC_API_URL=https://<nama-backend>.onrender.com/api/v1
```

### 6.2 Pola Pemanggilan API

Semua fetch dilakukan di `DataContext` saat komponen mount (`useEffect`), menggunakan `AbortController` untuk mencegah memory leak:

```typescript
const controller = new AbortController();
const res = await fetch(`${backendUrl}/umkm?limit=50`, {
  signal: controller.signal,
});
// Cleanup saat komponen unmount:
return () => controller.abort();
```

### 6.3 Offline Fallback

Jika backend tidak dapat dijangkau, aplikasi otomatis menggunakan data dari `lib/mock-data.ts` sebagai fallback, sehingga aplikasi tetap dapat didemonstrasikan tanpa koneksi ke server.

---

## 7. UI/UX Design System

### 7.1 Component Library

- Shadcn/UI — dibangun di atas Radix UI (accessible primitives)
- Komponen yang digunakan: Dialog, Sheet, Tabs, Badge, Button, Input, Select, Form, Toast (Sonner), Avatar, Card, Table, Chart (Recharts)

### 7.2 Styling

- Tailwind CSS v4 — utility-first CSS framework
- Framer Motion — animasi komponen (transisi halaman, modal)
- CSS Variabel — tema (light/dark mode via `next-themes`)

### 7.3 Typography & Font

- Geist + Geist Mono — font Google dari Vercel, dimuat via `next/font/google`

### 7.4 Responsivitas

- Mobile-first design
- Navigasi bawah (`MahasiswaBottomNav`) untuk tampilan mobile mahasiswa
- Sidebar kiri tetap (`lg:ml-72`) untuk UMKM view di desktop

---

## 8. Teknologi & Dependencies Utama

| Library                 | Versi   | Fungsi                                  |
| ----------------------- | ------- | --------------------------------------- |
| `next`                  | 16.1.6  | React framework (SSR + SPA)             |
| `react`                 | 19.2.4  | UI library utama                        |
| `typescript`            | 5.7.3   | Type safety                             |
| `tailwindcss`           | 4.2.0   | Styling utility-first                   |
| `@radix-ui/`            | latest  | Accessible UI primitives (20+ komponen) |
| `framer-motion`         | 12.35.2 | Animasi dan transisi                    |
| `recharts`              | 2.15.0  | Grafik statistik (admin dashboard)      |
| `react-hook-form`       | 7.54.1  | Manajemen form dengan validasi          |
| `zod`                   | 3.24.1  | Schema validasi TypeScript-first        |
| `sonner`                | 1.7.1   | Toast notification                      |
| `@supabase/supabase-js` | 2.105.1 | Client Supabase (opsional)              |
| `@vercel/analytics`     | 1.6.1   | Analitik web (Vercel)                   |
| `lucide-react`          | 0.564.0 | Icon library                            |
| `date-fns`              | 4.1.0   | Manipulasi dan format tanggal           |

---

## 9. Deployment

Platform: Vercel  
Build Command: `next build`  
Output: Static + Edge Functions

Environment Variables di Vercel Dashboard:

```
NEXT_PUBLIC_API_URL = https://<nama-backend>.onrender.com/api/v1
NEXT_PUBLIC_SUPABASE_URL = https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
```

Monitoring: Vercel Analytics (sudah terpasang via `<Analytics />` di `layout.tsx`)
