-- ========================================
-- UMKM IPB App - Complete Database Schema
-- ========================================
-- Copy and paste ALL of this into Supabase SQL Editor
-- ========================================

-- Drop existing tables if any (for fresh setup)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS umkm CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- 1. USERS TABLE
-- ========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  -- role: 'customer' (mahasiswa), 'umkm_owner', 'admin'
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- 2. UMKM TABLE (Toko/Bisnis Mahasiswa)
-- ========================================
CREATE TABLE umkm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  image_url VARCHAR(512),
  rating DECIMAL(3,2) DEFAULT 0,
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  -- status: 'pending' (menunggu approval), 'approved', 'rejected'
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_umkm_owner_id ON umkm(owner_id);
CREATE INDEX idx_umkm_status ON umkm(status);

-- ========================================
-- 3. MENU ITEMS TABLE
-- ========================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  umkm_id UUID NOT NULL REFERENCES umkm(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  -- category: 'Makanan', 'Minuman', 'Makanan Ringan'
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(512),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_umkm_id ON menu_items(umkm_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);

-- ========================================
-- 4. ORDERS TABLE
-- ========================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  -- Format: ORDER-YYYYMMDD-XXXXX
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  umkm_id UUID NOT NULL REFERENCES umkm(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  -- status: 'pending', 'confirmed', 'ready', 'completed', 'cancelled'
  total_price DECIMAL(12,2) NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_umkm_id ON orders(umkm_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pickup_time ON orders(pickup_time);

-- ========================================
-- 5. ORDER ITEMS TABLE
-- ========================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  -- Price at time of order
  subtotal DECIMAL(12,2) NOT NULL,
  -- quantity * unit_price
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_id ON order_items(menu_item_id);

-- ========================================
-- 6. REVIEWS TABLE
-- ========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  umkm_id UUID NOT NULL REFERENCES umkm(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_umkm_id ON reviews(umkm_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);

-- ========================================
-- 7. TRANSACTIONS TABLE (Payment)
-- ========================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  -- payment_method: 'cash', 'card', 'e_wallet', 'transfer'
  status VARCHAR(50) DEFAULT 'pending',
  -- status: 'pending', 'success', 'failed'
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ========================================
-- VIEWS untuk kemudahan query
-- ========================================

-- View: Order details lengkap
CREATE OR REPLACE VIEW order_details_view AS
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total_price,
  o.pickup_time,
  u.full_name as customer_name,
  u.phone as customer_phone,
  k.name as umkm_name,
  k.location as umkm_location,
  t.status as payment_status,
  t.payment_method
FROM orders o
JOIN users u ON o.customer_id = u.id
JOIN umkm k ON o.umkm_id = k.id
LEFT JOIN transactions t ON o.id = t.order_id;

-- View: Menu dengan rating UMKM
CREATE OR REPLACE VIEW menu_with_rating_view AS
SELECT 
  m.id,
  m.name,
  m.description,
  m.price,
  m.image_url,
  m.category,
  m.is_available,
  k.name as umkm_name,
  k.location as umkm_location,
  k.rating as umkm_rating,
  k.id as umkm_id
FROM menu_items m
JOIN umkm k ON m.umkm_id = k.id;

-- ========================================
-- FINAL: Verify all tables created
-- ========================================
-- Uncomment to verify (run this query after setup):
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' ORDER BY table_name;
