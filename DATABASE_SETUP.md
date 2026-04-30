# Database Setup Guide untuk UMKM IPB App

## Cara Setup Database di Supabase

### Option 1: Menggunakan Supabase Dashboard (Recommended)

1. **Buka Supabase Dashboard**
   - Login ke https://app.supabase.com
   - Pilih project Anda
   - Masuk ke tab "SQL Editor"

2. **Jalankan SQL Migrations**
   - Copy seluruh isi file: `supabase/migrations/001_initial_schema.sql`
   - Paste ke SQL Editor
   - Klik "Run" atau tekan Ctrl+Enter

3. **Verifikasi Tables**
   - Pergi ke tab "Database" → "Tables"
   - Verifikasi 7 tables sudah dibuat:
     - users
     - umkm
     - menu_items
     - orders
     - order_items
     - reviews
     - transactions

### Option 2: Menggunakan SQL Migration Files dengan Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login ke Supabase
supabase login

# Link project
supabase link --project-ref your_project_ref

# Run migrations
supabase migration up
```

### Option 3: Menggunakan Node.js Script

```bash
# Install dependencies
npm install @supabase/supabase-js

# Run migrations
node scripts/run-migrations.js
```

## Database Schema Overview

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(50), -- customer, umkm_owner, admin
  phone VARCHAR(20),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### UMKM Table (Toko)
```sql
CREATE TABLE umkm (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  name VARCHAR(255),
  description TEXT,
  location VARCHAR(255),
  image_url VARCHAR(512),
  rating DECIMAL(3,2),
  status VARCHAR(50), -- pending, approved, rejected
  created_at TIMESTAMPTZ
)
```

### Menu Items Table
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  umkm_id UUID REFERENCES umkm(id),
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10,2),
  image_url VARCHAR(512),
  is_available BOOLEAN,
  created_at TIMESTAMPTZ
)
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  customer_id UUID REFERENCES users(id),
  umkm_id UUID REFERENCES umkm(id),
  status VARCHAR(50), -- pending, confirmed, ready, completed, cancelled
  total_price DECIMAL(12,2),
  pickup_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ
)
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  subtotal DECIMAL(12,2),
  created_at TIMESTAMPTZ
)
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES users(id),
  umkm_id UUID REFERENCES umkm(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER, -- 1-5
  comment TEXT,
  created_at TIMESTAMPTZ
)
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(12,2),
  payment_method VARCHAR(50),
  status VARCHAR(50), -- pending, success, failed
  created_at TIMESTAMPTZ
)
```

## Entity Relationship Diagram (ERD)

```
users
  ├── umkm (one-to-many: owner_id)
  ├── orders (one-to-many: customer_id)
  └── reviews (one-to-many: customer_id)

umkm
  ├── menu_items (one-to-many)
  ├── orders (one-to-many)
  └── reviews (one-to-many)

orders
  ├── order_items (one-to-many)
  ├── transactions (one-to-many)
  └── reviews (one-to-many via order reference)

menu_items
  └── order_items (one-to-many)
```

## Testing Database Setup

Setelah membuat tables, test dengan query berikut di SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Insert test data
INSERT INTO users (email, full_name, role, phone) 
VALUES ('test@example.com', 'Test User', 'customer', '08123456789');

-- Query test data
SELECT * FROM users;
```

## Row Level Security (RLS) Setup

Untuk production, setup RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see their own data
CREATE POLICY "Users can only view their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- Example policy: Customers can only view their own orders
CREATE POLICY "Customers can only view their own orders" 
ON orders FOR SELECT 
USING (auth.uid() = customer_id);
```

## Indexes for Performance

Semua indexes sudah dibuat di migration file:
- idx_umkm_owner_id
- idx_umkm_status
- idx_menu_items_umkm_id
- idx_orders_customer_id
- idx_orders_status
- idx_order_items_order_id
- idx_reviews_umkm_id
- idx_transactions_order_id

## Troubleshooting

### Tables tidak muncul setelah run migrations
1. Refresh halaman dashboard
2. Pastikan tidak ada error di SQL Editor (lihat console)
3. Check apakah user role memiliki permission CREATE TABLE

### Foreign key constraint error
- Pastikan parent table dibuat sebelum child table
- Pastikan kolom yang di-reference sudah ada
- Check data type compatibility

### RLS policies blokir semua akses
- Disable RLS untuk development (hanya untuk testing)
- Setup policies yang tepat untuk production

## Next Steps

Setelah database setup selesai:
1. Update environment variables di `.env`
2. Setup authentication dengan Supabase Auth
3. Connect backend API ke database
4. Seed initial data (test UMKM, menu items, etc.)
