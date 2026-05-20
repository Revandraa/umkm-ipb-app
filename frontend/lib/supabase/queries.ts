import { createClient } from './client'
import type {
  UMKM,
  MenuItem,
  Order,
  OrderItem,
  Review,
  Transaction,
  User,
  UMKMInsert,
  UMKMUpdate,
  MenuItemInsert,
  MenuItemUpdate,
  OrderInsert,
  OrderItemInsert,
  ReviewInsert,
  TransactionInsert,
  TransactionUpdate,
} from '@/lib/database.types'

// =============================================
// USER QUERIES
// =============================================

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return data
}

export async function getUserById(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =============================================
// UMKM QUERIES
// =============================================

export async function getApprovedUMKMs() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('umkm')
    .select(`
      *,
      owner:users(id, full_name, email, phone)
    `)
    .eq('is_approved', true)
    .order('rating', { ascending: false })
  
  if (error) throw error
  return data as (UMKM & { owner: User })[]
}

export async function getPendingUMKMs() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('umkm')
    .select(`
      *,
      owner:users(id, full_name, email, phone)
    `)
    .eq('is_pending', true)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data as (UMKM & { owner: User })[]
}

export async function getUMKMById(umkmId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('umkm')
    .select(`
      *,
      owner:users(id, full_name, email, phone),
      menu_items(*)
    `)
    .eq('id', umkmId)
    .single()
  
  if (error) throw error
  return data as UMKM & { owner: User; menu_items: MenuItem[] }
}

export async function getUMKMByOwner(ownerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('umkm')
    .select(`
      *,
      menu_items(*)
    `)
    .eq('owner_id', ownerId)
    .single()
  
  if (error) throw error
  return data as UMKM & { menu_items: MenuItem[] }
}

export async function createUMKM(umkm: UMKMInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('umkm')
    .insert(umkm)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateUMKM(umkmId: string, updates: UMKMUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('umkm')
    .update(updates)
    .eq('id', umkmId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function approveUMKM(umkmId: string) {
  return updateUMKM(umkmId, { is_approved: true, is_pending: false })
}

export async function rejectUMKM(umkmId: string, reason: string) {
  return updateUMKM(umkmId, { is_approved: false, is_pending: false, rejection_reason: reason })
}

// =============================================
// MENU ITEM QUERIES
// =============================================

export async function getMenuItemsByUMKM(umkmId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('umkm_id', umkmId)
    .order('category')
    .order('name')
  
  if (error) throw error
  return data as MenuItem[]
}

export async function createMenuItem(item: MenuItemInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateMenuItem(itemId: string, updates: MenuItemUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteMenuItem(itemId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId)
  
  if (error) throw error
}

// =============================================
// ORDER QUERIES
// =============================================

export async function getOrdersByCustomer(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      umkm:umkm(id, name, location, image_url),
      order_items(
        *,
        menu_item:menu_items(id, name, image_url)
      ),
      transaction:transactions(*),
      review:reviews(*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as (Order & {
    umkm: UMKM
    order_items: (OrderItem & { menu_item: MenuItem })[]
    transaction: Transaction | null
    review: Review | null
  })[]
}

export async function getOrdersByUMKM(umkmId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users(id, full_name, phone),
      order_items(
        *,
        menu_item:menu_items(id, name)
      ),
      transaction:transactions(*)
    `)
    .eq('umkm_id', umkmId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getOrderById(orderId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users(id, full_name, phone, email),
      umkm:umkm(id, name, location),
      order_items(
        *,
        menu_item:menu_items(id, name, image_url)
      ),
      transaction:transactions(*),
      review:reviews(*)
    `)
    .eq('id', orderId)
    .single()
  
  if (error) throw error
  return data
}

export async function createOrder(order: OrderInsert, items: Omit<OrderItemInsert, 'order_id'>[]) {
  const supabase = createClient()
  
  // Insert order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()
  
  if (orderError) throw orderError
  
  // Insert order items
  const orderItems = items.map(item => ({
    ...item,
    order_id: orderData.id
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) throw itemsError
  
  return orderData
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =============================================
// REVIEW QUERIES
// =============================================

export async function getReviewsByUMKM(umkmId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:users(id, full_name, avatar_url)
    `)
    .eq('umkm_id', umkmId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createReview(review: ReviewInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =============================================
// TRANSACTION QUERIES
// =============================================

export async function createTransaction(transaction: TransactionInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTransactionStatus(transactionId: string, updates: TransactionUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =============================================
// STATISTICS QUERIES
// =============================================

export async function getUMKMStatistics(umkmId: string) {
  const supabase = createClient()
  
  // Get order statistics
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_price')
    .eq('umkm_id', umkmId)
  
  const totalOrders = orders?.length || 0
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
  const completedOrders = orders?.filter(o => o.status === 'completed').length || 0
  const totalRevenue = orders?.reduce((sum, o) => sum + o.total_price, 0) || 0
  
  // Get UMKM rating
  const { data: umkm } = await supabase
    .from('umkm')
    .select('rating, total_reviews')
    .eq('id', umkmId)
    .single()
  
  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue,
    rating: umkm?.rating || 0,
    totalReviews: umkm?.total_reviews || 0
  }
}

export async function getAdminStatistics() {
  const supabase = createClient()
  
  const [
    { count: totalUsers },
    { count: totalUMKM },
    { count: pendingUMKM },
    { count: totalOrders }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('umkm').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('umkm').select('*', { count: 'exact', head: true }).eq('is_pending', true),
    supabase.from('orders').select('*', { count: 'exact', head: true })
  ])
  
  return {
    totalUsers: totalUsers || 0,
    totalUMKM: totalUMKM || 0,
    pendingUMKM: pendingUMKM || 0,
    totalOrders: totalOrders || 0
  }
}
