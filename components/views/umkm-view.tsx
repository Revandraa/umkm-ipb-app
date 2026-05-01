"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  DollarSign, 
  Search,
  Store,
  AlertCircle,
  Bell,
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  ChefHat,
  Receipt,
  PlayCircle,
  Check,
  Ban,
  RefreshCw,
  ImageIcon,
  Loader2
} from "lucide-react"
import { formatPrice } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// Types for Supabase data
interface UMKMData {
  id: string
  owner_name: string
  business_name: string
  description: string
  location: string
  contact_phone: string
  contact_email: string
  business_type: string
  image_url: string
  status: string
  rating: number
}

interface MenuItemData {
  id: string
  umkm_id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
  is_available: boolean
}

interface OrderData {
  id: string
  menu_item_id: string
  umkm_id: string
  customer_name: string
  quantity: number
  total_price: number
  pickup_time: string
  status: string
  created_at: string
  menu_items?: MenuItemData
}

interface FormErrors {
  name?: string
  price?: string
  stock?: string
  description?: string
  category?: string
  image_url?: string
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pesanan", icon: ClipboardList },
  { id: "menu", label: "Kelola Menu", icon: UtensilsCrossed },
  { id: "settings", label: "Pengaturan", icon: Settings },
]

const menuCategories = [
  { value: "makanan", label: "Makanan" },
  { value: "minuman", label: "Minuman" },
  { value: "snack", label: "Snack" },
  { value: "dessert", label: "Dessert" },
  { value: "lainnya", label: "Lainnya" },
]

type OrderFilter = "all" | "confirmed" | "ready" | "completed"

interface UMKMViewProps {
  umkmId?: string
}

export function UMKMView({ umkmId }: UMKMViewProps) {
  const supabase = createClient()
  
  // Data states
  const [currentUMKM, setCurrentUMKM] = useState<UMKMData | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // UI states
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState("menu")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all")
  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  
  // Edit Modal State
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    image_url: "",
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<MenuItemData | null>(null)

  // Add Menu State
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addFormData, setAddFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    image_url: "/menu/default-food.jpg",
  })
  const [addFormErrors, setAddFormErrors] = useState<FormErrors>({})

  // Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)

  // Fetch UMKM data
  const fetchUMKMData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Get the first approved UMKM or specific one if umkmId provided
      let query = supabase
        .from("umkm_registrations")
        .select("*")
        .eq("status", "approved")
      
      if (umkmId) {
        query = query.eq("id", umkmId)
      }
      
      const { data: umkmData, error: umkmError } = await query.limit(1).single()
      
      if (umkmError) {
        console.error("[v0] Error fetching UMKM:", umkmError)
        setCurrentUMKM(null)
        setIsLoading(false)
        return
      }
      
      setCurrentUMKM(umkmData)
      
      // Fetch menu items for this UMKM
      const { data: menuData, error: menuError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("umkm_id", umkmData.id)
        .order("created_at", { ascending: false })
      
      if (menuError) {
        console.error("[v0] Error fetching menu items:", menuError)
      } else {
        setMenuItems(menuData || [])
      }
      
      // Fetch orders for this UMKM
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*, menu_items(*)")
        .eq("umkm_id", umkmData.id)
        .order("created_at", { ascending: false })
      
      if (ordersError) {
        console.error("[v0] Error fetching orders:", ordersError)
      } else {
        setOrders(ordersData || [])
      }
    } catch (err) {
      console.error("[v0] Unexpected error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, umkmId])

  useEffect(() => {
    fetchUMKMData()
  }, [fetchUMKMData])

  // Filter menu items
  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Order statistics
  const newOrdersCount = orders.filter(o => o.status === "confirmed").length
  const preparingOrdersCount = orders.filter(o => o.status === "ready").length
  const completedOrdersCount = orders.filter(o => o.status === "completed").length
  const totalRevenue = orders
    .filter(o => o.status === "completed")
    .reduce((sum, order) => sum + order.total_price, 0)

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesFilter = orderFilter === "all" || order.status === orderFilter
    const matchesSearch = order.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(orderSearchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalStock = menuItems.reduce((acc, item) => acc + item.stock, 0)
  const availableItems = menuItems.filter(item => item.is_available).length

  // Toggle menu availability
  const toggleAvailability = async (itemId: string) => {
    const item = menuItems.find(m => m.id === itemId)
    if (!item) return

    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", itemId)

    if (error) {
      toast.error("Gagal mengubah status menu")
      return
    }

    setMenuItems(prev => 
      prev.map(m => m.id === itemId ? { ...m, is_available: !m.is_available } : m)
    )
    toast.success(`Status menu "${item.name}" berhasil diubah`)
  }

  // Open edit dialog
  const openEditDialog = (item: MenuItemData) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      stock: item.stock.toString(),
      description: item.description,
      category: item.category,
      image_url: item.image_url,
    })
    setFormErrors({})
    setEditDialogOpen(true)
  }

  // Validate form
  const validateForm = (data: typeof formData): FormErrors => {
    const errors: FormErrors = {}
    
    if (!data.name.trim()) errors.name = "Nama menu wajib diisi"
    if (!data.price.trim()) {
      errors.price = "Harga wajib diisi"
    } else if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
      errors.price = "Harga harus berupa angka positif"
    }
    if (!data.stock.trim()) {
      errors.stock = "Stok wajib diisi"
    } else if (isNaN(Number(data.stock)) || Number(data.stock) < 0) {
      errors.stock = "Stok harus berupa angka positif atau nol"
    }
    if (!data.description.trim()) errors.description = "Deskripsi wajib diisi"
    if (!data.category) errors.category = "Kategori wajib dipilih"
    
    return errors
  }

  // Handle edit submit
  const handleEditSubmit = async () => {
    const errors = validateForm(formData)
    setFormErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      toast.error("Mohon perbaiki kesalahan pada form")
      return
    }

    if (!editingItem) return

    setIsSubmitting(true)

    const { error } = await supabase
      .from("menu_items")
      .update({
        name: formData.name.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description.trim(),
        category: formData.category,
        image_url: formData.image_url || "/menu/default-food.jpg",
      })
      .eq("id", editingItem.id)

    setIsSubmitting(false)

    if (error) {
      toast.error("Gagal memperbarui menu", { description: error.message })
      return
    }

    setMenuItems(prev => 
      prev.map(item => 
        item.id === editingItem.id 
          ? { 
              ...item, 
              name: formData.name.trim(),
              price: Number(formData.price),
              stock: Number(formData.stock),
              description: formData.description.trim(),
              category: formData.category,
              image_url: formData.image_url || "/menu/default-food.jpg",
            } 
          : item
      )
    )
    
    setEditDialogOpen(false)
    setEditingItem(null)
    toast.success("Menu berhasil diperbarui!", { description: `"${formData.name}" telah disimpan.` })
  }

  // Handle delete
  const openDeleteDialog = (item: MenuItemData) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingItem) return

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", deletingItem.id)

    if (error) {
      toast.error("Gagal menghapus menu", { description: error.message })
      return
    }

    setMenuItems(prev => prev.filter(item => item.id !== deletingItem.id))
    toast.success(`Menu "${deletingItem.name}" berhasil dihapus`)
    setDeleteDialogOpen(false)
    setDeletingItem(null)
  }

  // Handle add menu
  const handleAddMenu = async () => {
    const errors = validateForm(addFormData)
    setAddFormErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      toast.error("Mohon perbaiki kesalahan pada form")
      return
    }

    if (!currentUMKM) return

    setIsSubmitting(true)

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        umkm_id: currentUMKM.id,
        name: addFormData.name.trim(),
        price: Number(addFormData.price),
        stock: Number(addFormData.stock),
        description: addFormData.description.trim(),
        category: addFormData.category,
        image_url: addFormData.image_url || "/menu/default-food.jpg",
        is_available: true,
      })
      .select()
      .single()

    setIsSubmitting(false)

    if (error) {
      toast.error("Gagal menambahkan menu", { description: error.message })
      return
    }

    setMenuItems(prev => [data, ...prev])
    setAddDialogOpen(false)
    setAddFormData({
      name: "",
      price: "",
      stock: "",
      description: "",
      category: "",
      image_url: "/menu/default-food.jpg",
    })
    toast.success("Menu berhasil ditambahkan!", { description: `"${addFormData.name}" telah ditambahkan ke daftar menu.` })
  }

  // Order management
  const handleAcceptOrder = async (order: OrderData) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "ready" })
      .eq("id", order.id)

    if (error) {
      toast.error("Gagal menerima pesanan")
      return
    }

    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "ready" } : o))
    toast.success("Pesanan diterima!", { description: `Pesanan ${order.id.slice(0, 8)} sedang diproses` })
  }

  const handleCompleteOrder = async (order: OrderData) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", order.id)

    if (error) {
      toast.error("Gagal menyelesaikan pesanan")
      return
    }

    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "completed" } : o))
    toast.success("Pesanan selesai!", { description: `Pesanan ${order.id.slice(0, 8)} telah selesai` })
  }

  const handleRejectOrder = async (order: OrderData) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id)

    if (error) {
      toast.error("Gagal menolak pesanan")
      return
    }

    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "cancelled" } : o))
    toast.error("Pesanan ditolak", { description: `Pesanan ${order.id.slice(0, 8)} telah ditolak` })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Pesanan Baru</Badge>
      case "ready":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Sedang Diproses</Badge>
      case "completed":
        return <Badge className="bg-success/20 text-success border-success/30">Selesai</Badge>
      case "cancelled":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Dibatalkan</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center">
        <motion.div 
          className="text-center p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data UMKM...</p>
        </motion.div>
      </div>
    )
  }

  // No UMKM found
  if (!currentUMKM) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center">
        <motion.div 
          className="text-center p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Store className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Tidak ada UMKM</h2>
          <p className="text-muted-foreground mb-4">Belum ada UMKM yang terverifikasi atau Anda belum terdaftar.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Muat Ulang
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/3 to-background flex">
      {/* Glassmorphism Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 fixed left-0 top-0 bottom-0 z-40">
        <div className="flex-1 m-4 rounded-2xl bg-sidebar/80 backdrop-blur-xl border border-sidebar-border/50 shadow-2xl overflow-hidden">
          {/* Logo Area */}
          <div className="p-6 border-b border-sidebar-border/30">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 flex items-center justify-center shadow-lg">
                <Store className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-sidebar-foreground text-lg">UMKM Panel</h2>
                <p className="text-xs text-sidebar-foreground/60">Dashboard</p>
              </div>
            </div>
          </div>

          {/* UMKM Info */}
          <div className="p-4 mx-4 mt-4 rounded-xl bg-sidebar-accent/30 backdrop-blur">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{currentUMKM.business_name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{currentUMKM.location}</p>
            <Badge className="mt-2 bg-success/20 text-success border-success/30 text-xs">
              Terverifikasi
            </Badge>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {item.id === "orders" && newOrdersCount > 0 && (
                    <Badge className="ml-auto bg-destructive text-destructive-foreground text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                      {newOrdersCount}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              )
            })}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto p-4 border-t border-sidebar-border/30">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all">
              <LogOut className="h-5 w-5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border/50 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-sidebar-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 flex items-center justify-center">
                    <Store className="h-5 w-5 text-sidebar-primary-foreground" />
                  </div>
                  <span className="font-bold text-sidebar-foreground">UMKM Panel</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="p-4 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                      {item.id === "orders" && newOrdersCount > 0 && (
                        <Badge className="ml-auto bg-destructive text-destructive-foreground text-xs h-5 min-w-5 p-1 flex items-center justify-center rounded-full">
                          {newOrdersCount}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <LayoutDashboard className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{currentUMKM.business_name}</h1>
                <p className="text-sm text-muted-foreground">{currentUMKM.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {newOrdersCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="cursor-pointer"
                  onClick={() => setActiveSection("orders")}
                >
                  <Badge className="bg-warning text-warning-foreground gap-1.5 py-1.5 px-3 rounded-full shadow-md animate-pulse">
                    <Bell className="h-3.5 w-3.5" />
                    {newOrdersCount} Pesanan Baru
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {/* Dashboard Section */}
          {activeSection === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-warning/15 flex items-center justify-center">
                        <Bell className="h-6 w-6 text-warning" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Pesanan Baru</p>
                        <p className="text-2xl font-bold text-foreground">{newOrdersCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
                        <ChefHat className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Sedang Diproses</p>
                        <p className="text-2xl font-bold text-foreground">{preparingOrdersCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Selesai</p>
                        <p className="text-2xl font-bold text-foreground">{completedOrdersCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Pendapatan</p>
                        <p className="text-lg font-bold text-foreground">{formatPrice(totalRevenue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Menu Overview */}
              <Card className="rounded-2xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Ringkasan Menu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-2xl font-bold text-foreground">{menuItems.length}</p>
                      <p className="text-sm text-muted-foreground">Total Menu</p>
                    </div>
                    <div className="p-4 rounded-xl bg-success/10">
                      <p className="text-2xl font-bold text-success">{availableItems}</p>
                      <p className="text-sm text-muted-foreground">Menu Tersedia</p>
                    </div>
                    <div className="p-4 rounded-xl bg-destructive/10">
                      <p className="text-2xl font-bold text-destructive">{menuItems.length - availableItems}</p>
                      <p className="text-sm text-muted-foreground">Menu Habis</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10">
                      <p className="text-2xl font-bold text-primary">{totalStock}</p>
                      <p className="text-sm text-muted-foreground">Total Stok</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Orders Section */}
          {activeSection === "orders" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-2xl border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Manajemen Pesanan
                      </CardTitle>
                      <CardDescription>Kelola pesanan dari pelanggan</CardDescription>
                    </div>
                    
                    {/* Filter Tabs */}
                    <Tabs value={orderFilter} onValueChange={(v) => setOrderFilter(v as OrderFilter)} className="w-full">
                      <TabsList className="grid grid-cols-4 w-full max-w-lg">
                        <TabsTrigger value="all" className="gap-1.5 text-xs sm:text-sm">
                          Semua
                          <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                            {orders.length}
                          </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="confirmed" className="gap-1.5 text-xs sm:text-sm">
                          Baru
                          {newOrdersCount > 0 && (
                            <Badge className="ml-1 bg-warning text-warning-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                              {newOrdersCount}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="ready" className="gap-1.5 text-xs sm:text-sm">
                          Proses
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="gap-1.5 text-xs sm:text-sm">
                          Selesai
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
                      <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-semibold text-foreground">Belum Ada Pesanan</p>
                      <p className="text-muted-foreground">Pesanan dari pelanggan akan muncul di sini</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">{order.customer_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {order.menu_items?.name || "Menu"} x{order.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <p className="text-sm font-bold text-primary mt-1">{formatPrice(order.total_price)}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(order.created_at)} {formatTime(order.created_at)}
                            </div>
                            <div className="flex gap-2">
                              {order.status === "confirmed" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                                    onClick={() => handleRejectOrder(order)}
                                  >
                                    <Ban className="h-4 w-4 mr-1" />
                                    Tolak
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="rounded-lg bg-success hover:bg-success/90"
                                    onClick={() => handleAcceptOrder(order)}
                                  >
                                    <PlayCircle className="h-4 w-4 mr-1" />
                                    Terima
                                  </Button>
                                </>
                              )}
                              {order.status === "ready" && (
                                <Button
                                  size="sm"
                                  className="rounded-lg"
                                  onClick={() => handleCompleteOrder(order)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Selesai
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Menu Management Section */}
          {activeSection === "menu" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-2xl border-0 shadow-xl" id="kelola">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold">Kelola Menu</CardTitle>
                      <CardDescription>Atur menu makanan dan minuman Anda</CardDescription>
                    </div>
                    <Button onClick={() => setAddDialogOpen(true)} className="gap-2 rounded-xl">
                      <Plus className="h-4 w-4" />
                      Tambah Menu
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search */}
                  <div className="relative max-w-md mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Cari menu..."
                      className="pl-12 h-12 rounded-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Menu Cards Grid */}
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                      <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-semibold text-foreground mb-2">Belum Ada Menu</p>
                      <p className="text-muted-foreground mb-4">Klik tombol &quot;Tambah Menu&quot; untuk menambahkan menu pertama Anda</p>
                      <Button onClick={() => setAddDialogOpen(true)} className="gap-2 rounded-xl">
                        <Plus className="h-4 w-4" />
                        Tambah Menu Pertama
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="group"
                        >
                          <Card className="overflow-hidden rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all">
                            <div className="aspect-video relative overflow-hidden bg-muted">
                              {item.image_url ? (
                                <Image
                                  src={item.image_url}
                                  alt={item.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                                </div>
                              )}
                              {item.stock === 0 && (
                                <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center">
                                  <Badge variant="destructive" className="rounded-full">Habis</Badge>
                                </div>
                              )}
                              {item.stock > 0 && item.stock <= 5 && (
                                <div className="absolute top-3 right-3">
                                  <Badge className="bg-warning text-warning-foreground rounded-full">
                                    Sisa {item.stock}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0 rounded-full text-xs">
                                  {item.category}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                <div>
                                  <p className="text-lg font-bold text-primary">{formatPrice(item.price)}</p>
                                  <p className="text-xs text-muted-foreground">Stok: {item.stock}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={item.is_available}
                                    onCheckedChange={() => toggleAvailability(item.id)}
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl"
                                    onClick={() => openEditDialog(item)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => openDeleteDialog(item)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-2xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Pengaturan
                  </CardTitle>
                  <CardDescription>Kelola pengaturan UMKM Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h4 className="font-semibold mb-2">Informasi UMKM</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Nama Bisnis:</span> {currentUMKM.business_name}</p>
                        <p><span className="text-muted-foreground">Pemilik:</span> {currentUMKM.owner_name}</p>
                        <p><span className="text-muted-foreground">Lokasi:</span> {currentUMKM.location}</p>
                        <p><span className="text-muted-foreground">Email:</span> {currentUMKM.contact_email}</p>
                        <p><span className="text-muted-foreground">Telepon:</span> {currentUMKM.contact_phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Floating Action Button */}
        {activeSection === "menu" && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 lg:hidden"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
          >
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-2xl hover:shadow-primary/40 hover:scale-110 transition-all"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </main>

      {/* Edit Menu Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Edit2 className="h-5 w-5 text-primary" />
              </div>
              Edit Menu
            </DialogTitle>
            <DialogDescription>
              Ubah informasi menu di bawah ini
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={!!formErrors.name}>
              <FieldLabel htmlFor="edit-name">Nama Menu</FieldLabel>
              <Input
                id="edit-name"
                placeholder="Masukkan nama menu"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }))
                }}
                className={`rounded-xl h-11 ${formErrors.name ? "border-destructive" : ""}`}
              />
              {formErrors.name && (
                <FieldError>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.name}
                  </span>
                </FieldError>
              )}
            </Field>

            <Field data-invalid={!!formErrors.category}>
              <FieldLabel htmlFor="edit-category">Kategori</FieldLabel>
              <Select 
                value={formData.category} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, category: value }))
                  if (formErrors.category) setFormErrors(prev => ({ ...prev, category: undefined }))
                }}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {menuCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.category && (
                <FieldError>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.category}
                  </span>
                </FieldError>
              )}
            </Field>

            <Field data-invalid={!!formErrors.price}>
              <FieldLabel htmlFor="edit-price">Harga (Rp)</FieldLabel>
              <Input
                id="edit-price"
                type="number"
                placeholder="Masukkan harga"
                value={formData.price}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, price: e.target.value }))
                  if (formErrors.price) setFormErrors(prev => ({ ...prev, price: undefined }))
                }}
                className={`rounded-xl h-11 ${formErrors.price ? "border-destructive" : ""}`}
              />
              {formErrors.price && (
                <FieldError>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.price}
                  </span>
                </FieldError>
              )}
            </Field>

            <Field data-invalid={!!formErrors.stock}>
              <FieldLabel htmlFor="edit-stock">Stok</FieldLabel>
              <Input
                id="edit-stock"
                type="number"
                placeholder="Masukkan jumlah stok"
                value={formData.stock}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, stock: e.target.value }))
                  if (formErrors.stock) setFormErrors(prev => ({ ...prev, stock: undefined }))
                }}
                className={`rounded-xl h-11 ${formErrors.stock ? "border-destructive" : ""}`}
              />
              {formErrors.stock && (
                <FieldError>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.stock}
                  </span>
                </FieldError>
              )}
            </Field>

            <Field data-invalid={!!formErrors.description}>
              <FieldLabel htmlFor="edit-description">Deskripsi</FieldLabel>
              <Textarea
                id="edit-description"
                placeholder="Masukkan deskripsi menu"
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                  if (formErrors.description) setFormErrors(prev => ({ ...prev, description: undefined }))
                }}
                className={`rounded-xl ${formErrors.description ? "border-destructive" : ""}`}
                rows={3}
              />
              {formErrors.description && (
                <FieldError>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.description}
                  </span>
                </FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-image">URL Gambar (Opsional)</FieldLabel>
              <Input
                id="edit-image"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="rounded-xl h-11"
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-xl">
              Batal
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting} className="rounded-xl">
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              Hapus Menu
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus menu &quot;{deletingItem?.name}&quot;? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">
              Hapus Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Menu Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              Tambah Menu Baru
            </DialogTitle>
            <DialogDescription>
              Tambahkan menu baru ke daftar produk Anda
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={!!addFormErrors.name}>
              <FieldLabel htmlFor="add-name">Nama Menu</FieldLabel>
              <Input
                id="add-name"
                placeholder="Contoh: Nasi Goreng Spesial"
                value={addFormData.name}
                onChange={(e) => {
                  setAddFormData(prev => ({ ...prev, name: e.target.value }))
                  if (addFormErrors.name) setAddFormErrors(prev => ({ ...prev, name: undefined }))
                }}
                className={`rounded-xl h-11 ${addFormErrors.name ? "border-destructive" : ""}`}
              />
              {addFormErrors.name && (
                <FieldError>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {addFormErrors.name}
                  </span>
                </FieldError>
              )}
            </Field>

            <Field data-invalid={!!addFormErrors.category}>
              <FieldLabel htmlFor="add-category">Kategori</FieldLabel>
              <Select 
                value={addFormData.category} 
                onValueChange={(value) => {
                  setAddFormData(prev => ({ ...prev, category: value }))
                  if (addFormErrors.category) setAddFormErrors(prev => ({ ...prev, category: undefined }))
                }}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {menuCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {addFormErrors.category && (
                <FieldError>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {addFormErrors.category}
                  </span>
                </FieldError>
              )}
            </Field>

            <Field data-invalid={!!addFormErrors.price}>
              <FieldLabel htmlFor="add-price">Harga (Rp)</FieldLabel>
              <Input
                id="add-price"
                type="number"
                placeholder="Contoh: 15000"
                value={addFormData.price}
                onChange={(e) => {
                  setAddFormData(prev => ({ ...prev, price: e.target.value }))
                  if (addFormErrors.price) setAddFormErrors(prev => ({ ...prev, price: undefined }))
                }}
                className={`rounded-xl h-11 ${addFormErrors.price ? "border-destructive" : ""}`}
              />
              {addFormErrors.price && (
                <FieldError>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {addFormErrors.price}
                  </span>
                </FieldError>
              )}
            </Field>

            <Field data-invalid={!!addFormErrors.stock}>
              <FieldLabel htmlFor="add-stock">Stok</FieldLabel>
              <Input
                id="add-stock"
                type="number"
                placeholder="Contoh: 50"
                value={addFormData.stock}
                onChange={(e) => {
                  setAddFormData(prev => ({ ...prev, stock: e.target.value }))
                  if (addFormErrors.stock) setAddFormErrors(prev => ({ ...prev, stock: undefined }))
                }}
                className={`rounded-xl h-11 ${addFormErrors.stock ? "border-destructive" : ""}`}
              />
              {addFormErrors.stock && (
                <FieldError>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {addFormErrors.stock}
                  </span>
                </FieldError>
              )}
            </Field>

            <Field data-invalid={!!addFormErrors.description}>
              <FieldLabel htmlFor="add-description">Deskripsi</FieldLabel>
              <Textarea
                id="add-description"
                placeholder="Jelaskan menu Anda..."
                value={addFormData.description}
                onChange={(e) => {
                  setAddFormData(prev => ({ ...prev, description: e.target.value }))
                  if (addFormErrors.description) setAddFormErrors(prev => ({ ...prev, description: undefined }))
                }}
                className={`rounded-xl ${addFormErrors.description ? "border-destructive" : ""}`}
                rows={3}
              />
              {addFormErrors.description && (
                <FieldError>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {addFormErrors.description}
                  </span>
                </FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="add-image">URL Gambar (Opsional)</FieldLabel>
              <Input
                id="add-image"
                placeholder="https://example.com/image.jpg"
                value={addFormData.image_url}
                onChange={(e) => setAddFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="rounded-xl h-11"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Biarkan kosong untuk menggunakan gambar default
              </p>
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="rounded-xl">
              Batal
            </Button>
            <Button onClick={handleAddMenu} disabled={isSubmitting} className="rounded-xl">
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Menambahkan...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Menu
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
