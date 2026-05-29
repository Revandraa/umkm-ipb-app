// =============================================
// UMKM IPB DATABASE TYPES
// Auto-generated from Supabase schema
// =============================================

export type Role = 'mahasiswa' | 'umkm' | 'admin'

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export type PaymentMethod = 'cash' | 'qris' | 'transfer'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// =============================================
// TABLE INTERFACES
// =============================================

export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: Role
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UMKM {
  id: string
  owner_id: string
  name: string
  description: string | null
  location: string
  image_url: string | null
  rating: number
  total_reviews: number
  is_approved: boolean
  is_pending: boolean
  rejection_reason: string | null
  created_at: string
  updated_at: string
  // Relations
  owner?: User
  menu_items?: MenuItem[]
}

export interface MenuItem {
  id: string
  umkm_id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
  // Relations
  umkm?: UMKM
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  umkm_id: string
  customer_name: string
  pickup_time: string
  total_price: number
  status: OrderStatus
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  customer?: User
  umkm?: UMKM
  order_items?: OrderItem[]
  transaction?: Transaction
  review?: Review
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  price_at_time: number
  subtotal: number
  created_at: string
  // Relations
  order?: Order
  menu_item?: MenuItem
}

export interface Review {
  id: string
  order_id: string
  customer_id: string
  umkm_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  // Relations
  order?: Order
  customer?: User
  umkm?: UMKM
}

export interface Transaction {
  id: string
  order_id: string
  amount: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  paid_at: string | null
  created_at: string
  updated_at: string
  // Relations
  order?: Order
}

// =============================================
// INSERT/UPDATE TYPES
// =============================================

export type UserInsert = Omit<User, 'created_at' | 'updated_at'>
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>

export type UMKMInsert = Omit<UMKM, 'id' | 'rating' | 'total_reviews' | 'created_at' | 'updated_at' | 'owner' | 'menu_items'>
export type UMKMUpdate = Partial<Omit<UMKM, 'id' | 'owner_id' | 'created_at' | 'updated_at' | 'owner' | 'menu_items'>>

export type MenuItemInsert = Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'umkm'>
export type MenuItemUpdate = Partial<Omit<MenuItem, 'id' | 'umkm_id' | 'created_at' | 'updated_at' | 'umkm'>>

export type OrderInsert = Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'customer' | 'umkm' | 'order_items' | 'transaction' | 'review'>
export type OrderUpdate = Partial<Pick<Order, 'status' | 'notes'>>

export type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at' | 'order' | 'menu_item'>

export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at' | 'order' | 'customer' | 'umkm'>
export type ReviewUpdate = Partial<Pick<Review, 'rating' | 'comment'>>

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'order'>
export type TransactionUpdate = Partial<Pick<Transaction, 'payment_status' | 'paid_at'>>

// =============================================
// DATABASE SCHEMA TYPE
// =============================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      umkm: {
        Row: UMKM
        Insert: UMKMInsert
        Update: UMKMUpdate
      }
      menu_items: {
        Row: MenuItem
        Insert: MenuItemInsert
        Update: MenuItemUpdate
      }
      orders: {
        Row: Order
        Insert: OrderInsert
        Update: OrderUpdate
      }
      order_items: {
        Row: OrderItem
        Insert: OrderItemInsert
        Update: never
      }
      reviews: {
        Row: Review
        Insert: ReviewInsert
        Update: ReviewUpdate
      }
      transactions: {
        Row: Transaction
        Insert: TransactionInsert
        Update: TransactionUpdate
      }
    }
  }
}
