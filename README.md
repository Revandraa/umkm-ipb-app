# UMKM IPB Food Ecosystem 🎓🍲

Platform ekosistem kuliner terpadu resmi untuk civitas akademika IPB University. Memudahkan mahasiswa, dosen, dan staf untuk menemukan, memesan, dan mendukung UMKM / kantin di seluruh area kampus IPB Dramaga.

## 🌟 Fitur Utama

- **Multi-Role Portal:** Akses khusus untuk Mahasiswa/Customer, Pemilik UMKM/Kantin, dan Admin Verifikator.
- **Manajemen Menu & Stok Real-Time:** Pemilik UMKM dapat mengatur ketersediaan menu dan memantau pesanan masuk secara langsung.
- **Alur Pemesanan Praktis:** Fitur *pre-order* dan *pickup* tanpa antre dengan estimasi waktu pengambilan.
- **Sistem Verifikasi & Keamanan:** Alur persetujuan (*approval workflow*) oleh Admin untuk menjamin legalitas dan kebersihan setiap UMKM yang mendaftar.


## 🏗️ Arsitektur Sistem

Proyek ini dirancang menggunakan arsitektur modern yang siap untuk skala produksi masal:
- **Frontend:** Next.js (App Router), React 19, Tailwind CSS, Framer Motion, Radix UI.
- **Backend & Database Cloud:** Supabase PostgreSQL (terdiri dari 7 tabel utama dengan *cascading delete* dan indeks performa tinggi).
- **Backend Opsional (Python):** FastAPI, SQLAlchemy ORM, Pydantic untuk pengolahan logika bisnis lanjutan.

## 🚀 Panduan Menjalankan Lokal (Development)

1. Pastikan Anda telah menginstal Node.js.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
4. Buka `http://localhost:3000` di peramban Anda.

---
*Dibuat untuk mendukung digitalisasi dan pemberdayaan UMKM di lingkungan IPB University.*
