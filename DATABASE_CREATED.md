# Database Tables Successfully Created in Supabase ✓

## Status: COMPLETE

All 7 tables have been successfully created and configured in Supabase with proper indexes and relationships.

---

## Database Schema Overview

### 1. **users** Table
- Stores user profiles (mahasiswa, UMKM owner, admin)
- Columns:
  - `id` (UUID) - Primary key
  - `email` (VARCHAR) - Unique email
  - `full_name` (VARCHAR)
  - `role` (VARCHAR) - customer/umkm/admin
  - `phone` (VARCHAR)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
- **Indexes**: `idx_users_email`, `idx_users_role`

### 2. **umkm** Table
- Stores UMKM/Toko information
- Columns:
  - `id` (UUID) - Primary key
  - `owner_id` (UUID) - Foreign key to users
  - `name` (VARCHAR) - Toko name
  - `description` (TEXT)
  - `location` (VARCHAR)
  - `image_url` (VARCHAR)
  - `rating` (DECIMAL)
  - `phone` (VARCHAR)
  - `status` (VARCHAR) - pending/approved/rejected
  - `rejection_reason` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMPTZ)
- **Indexes**: `idx_umkm_owner_id`, `idx_umkm_status`
- **Relationships**: Cascade delete from users

### 3. **menu_items** Table
- Stores menu items for each UMKM
- Columns:
  - `id` (UUID) - Primary key
  - `umkm_id` (UUID) - Foreign key to umkm
  - `name` (VARCHAR)
  - `description` (TEXT)
  - `category` (VARCHAR)
  - `price` (DECIMAL)
  - `image_url` (VARCHAR)
  - `is_available` (BOOLEAN)
  - `created_at`, `updated_at` (TIMESTAMPTZ)
- **Indexes**: `idx_menu_items_umkm_id`, `idx_menu_items_available`
- **Relationships**: Cascade delete from umkm

### 4. **orders** Table
- Stores customer orders
- Columns:
  - `id` (UUID) - Primary key
  - `order_number` (VARCHAR) - Unique order number
  - `customer_id` (UUID) - Foreign key to users
  - `umkm_id` (UUID) - Foreign key to umkm
  - `status` (VARCHAR) - pending/confirmed/ready/completed
  - `total_price` (DECIMAL)
  - `pickup_time` (TIMESTAMPTZ)
  - `notes` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMPTZ)
- **Indexes**: `idx_orders_customer_id`, `idx_orders_umkm_id`, `idx_orders_status`, `idx_orders_pickup_time`
- **Relationships**: Cascade delete from users and umkm

### 5. **order_items** Table
- Stores individual items in each order
- Columns:
  - `id` (UUID) - Primary key
  - `order_id` (UUID) - Foreign key to orders
  - `menu_item_id` (UUID) - Foreign key to menu_items
  - `quantity` (INTEGER)
  - `unit_price` (DECIMAL)
  - `subtotal` (DECIMAL)
  - `created_at` (TIMESTAMPTZ)
- **Indexes**: `idx_order_items_order_id`, `idx_order_items_menu_id`
- **Relationships**: Cascade delete from orders and menu_items

### 6. **reviews** Table
- Stores customer reviews and ratings
- Columns:
  - `id` (UUID) - Primary key
  - `customer_id` (UUID) - Foreign key to users
  - `umkm_id` (UUID) - Foreign key to umkm
  - `order_id` (UUID) - Foreign key to orders (nullable)
  - `rating` (INTEGER) - 1-5 rating with CHECK constraint
  - `comment` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMPTZ)
- **Indexes**: `idx_reviews_umkm_id`, `idx_reviews_customer_id`, `idx_reviews_order_id`
- **Relationships**: Cascade delete from users/umkm, SET NULL from orders

### 7. **transactions** Table
- Stores payment/transaction records
- Columns:
  - `id` (UUID) - Primary key
  - `order_id` (UUID) - Foreign key to orders
  - `amount` (DECIMAL)
  - `payment_method` (VARCHAR)
  - `status` (VARCHAR) - pending/completed/failed
  - `transaction_date` (TIMESTAMPTZ)
  - `created_at` (TIMESTAMPTZ)
- **Indexes**: `idx_transactions_order_id`, `idx_transactions_status`
- **Relationships**: Cascade delete from orders

---

## Entity Relationship Diagram

```
┌─────────────┐
│    users    │
├─────────────┤
│ id (PK)     │───┐
│ email       │   │
│ role        │   │
│ phone       │   │
│ created_at  │   │
└─────────────┘   │
        ▲          │
        │          │ (1:Many)
        │          │
┌───────┴──────────▼──────────┐
│         umkm                │
├──────────────────────────────┤
│ id (PK)                      │───┐
│ owner_id (FK → users)        │   │
│ name                         │   │
│ status (pending/approved)    │   │
│ rating                       │   │
│ created_at                   │   │
└──────────────────────────────┘   │
        │                           │
        │ (1:Many)                  │
        │                           │ (1:Many)
        │                           │
        ▼                           ▼
┌──────────────────┐    ┌──────────────────┐
│   menu_items     │    │     orders       │
├──────────────────┤    ├──────────────────┤
│ id (PK)          │    │ id (PK)          │
│ umkm_id (FK)     │    │ customer_id (FK) │
│ name             │    │ umkm_id (FK)     │
│ price            │    │ status           │
│ is_available     │    │ total_price      │
└──────────────────┘    │ pickup_time      │
        ▲               └──────────────────┘
        │                       │
        │ (1:Many)              │ (1:Many)
        │                       │
        └───────────────┬───────┘
                        │
                        ▼
            ┌──────────────────────┐
            │   order_items        │
            ├──────────────────────┤
            │ id (PK)              │
            │ order_id (FK)        │
            │ menu_item_id (FK)    │
            │ quantity             │
            │ subtotal             │
            └──────────────────────┘

Additional Tables:
- reviews: (customer_id FK → users), (umkm_id FK → umkm), (order_id FK → orders)
- transactions: (order_id FK → orders)
```

---

## Key Features Implemented

✓ **Cascading Relationships**: Data integrity dengan CASCADE DELETE
✓ **Proper Indexes**: Optimized queries untuk filtering dan sorting
✓ **Status Tracking**: UMKM approval workflow (pending/approved/rejected)
✓ **Order Status Flow**: pending → confirmed → ready → completed
✓ **Rating System**: 1-5 star reviews dengan CHECK constraint
✓ **Transaction Tracking**: Payment status management
✓ **Timestamps**: created_at dan updated_at untuk audit trail

---

## Ready for Backend Integration

Backend FastAPI dapat langsung menjalankan queries ke database ini dengan:

1. **User Management**: Create, read, update users
2. **UMKM Registration**: Accept/reject UMKM dengan status workflow
3. **Menu Management**: Create/update menu items dengan availability
4. **Order Creation**: Automatic calculation dari order_items
5. **Order Status Updates**: State machine (pending → confirmed → ready → completed)
6. **Review System**: Add ratings dan comments
7. **Payment Tracking**: Record transactions

Database siap untuk production dengan proper constraints, indexes, dan relationships!
