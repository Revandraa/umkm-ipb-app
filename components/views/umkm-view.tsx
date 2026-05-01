"use client"

import { useState, useMemo } from "react"
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
import { Spinner } from "@/components/ui/spinner"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag,
  Search,
  Store,
  AlertCircle,
  WifiOff,
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
  Timer,
  Receipt,
  Eye,
  Phone,
  MapPin,
  Utensils,
  PlayCircle,
  Check,
  Ban
} from "lucide-react"
import { formatPrice } from "@/lib/mock-data"
import type { MenuItem } from "@/lib/mock-data"
import { useData, type Order } from "@/lib/data-context"
import { toast } from "sonner"

interface FormErrors {
  name?: string
  price?: string
  stock?: string
  description?: string
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pesanan", icon: ClipboardList },
  { id: "menu", label: "Kelola Menu", icon: UtensilsCrossed },
  { id: "settings", label: "Pengaturan", icon: Settings },
]

type OrderFilter = "all" | "confirmed" | "ready" | "completed"

export function UMKMView() {
  const { approvedUMKMs, orders, updateMenuItem, deleteMenuItem, updateOrderStatus } = useData()
  
  // Simulate logged in UMKM - using first approved UMKM
  const currentUMKM = approvedUMKMs[0]
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState("orders")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all")
  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  
  // Edit Modal State
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [simulateNetworkError, setSimulateNetworkError] = useState(false)

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null)

  // Add Menu State
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)

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
          <p className="text-muted-foreground">Belum ada UMKM yang terverifikasi</p>
        </motion.div>
      </div>
    )
  }

  const menuItems = currentUMKM.menu
  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get orders for this UMKM
  const umkmOrders = orders.filter(order => order.menuItem.vendorId === currentUMKM.id)
  const newOrdersCount = umkmOrders.filter(o => o.status === "confirmed").length
  const preparingOrdersCount = umkmOrders.filter(o => o.status === "ready").length
  const completedOrdersCount = umkmOrders.filter(o => o.status === "completed").length
  
  // Calculate total revenue
  const totalRevenue = umkmOrders
    .filter(o => o.status === "completed")
    .reduce((sum, order) => sum + order.totalPrice, 0)

  // Filter orders
  const filteredOrders = umkmOrders.filter(order => {
    const matchesFilter = orderFilter === "all" || order.status === orderFilter
    const matchesSearch = order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.menuItem.name.toLowerCase().includes(orderSearchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  }).sort((a, b) => {
    // Sort by status priority: confirmed > ready > completed > pending
    const statusPriority: Record<string, number> = { confirmed: 0, ready: 1, pending: 2, completed: 3 }
    const priorityDiff = statusPriority[a.status] - statusPriority[b.status]
    if (priorityDiff !== 0) return priorityDiff
    // Then by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const toggleAvailability = (itemId: string) => {
    const item = menuItems.find(m => m.id === itemId)
    if (item) {
      updateMenuItem(currentUMKM.id, itemId, { isAvailable: !item.isAvailable })
      toast.success(`Status menu "${item.name}" berhasil diubah`)
    }
  }

  const totalStock = menuItems.reduce((acc, item) => acc + item.stock, 0)
  const availableItems = menuItems.filter(item => item.isAvailable).length

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      stock: item.stock.toString(),
      description: item.description,
    })
    setFormErrors({})
    setEditDialogOpen(true)
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    if (!formData.name.trim()) {
      errors.name = "Nama menu wajib diisi"
    }
    
    if (!formData.price.trim()) {
      errors.price = "Harga wajib diisi"
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Harga harus berupa angka positif"
    }
    
    if (!formData.stock.trim()) {
      errors.stock = "Stok wajib diisi"
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      errors.stock = "Stok harus berupa angka positif atau nol"
    }

    if (!formData.description.trim()) {
      errors.description = "Deskripsi wajib diisi"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Mohon perbaiki kesalahan pada form")
      return
    }

    setIsSubmitting(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate network error
    if (simulateNetworkError) {
      setIsSubmitting(false)
      toast.error("Koneksi internet tidak stabil", {
        description: "Silakan coba lagi atau periksa koneksi internet Anda.",
        icon: <WifiOff className="h-4 w-4" />,
      })
      return
    }

    // Update the menu item
    if (editingItem) {
      updateMenuItem(currentUMKM.id, editingItem.id, {
        name: formData.name.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description.trim(),
      })
    }

    setIsSubmitting(false)
    setEditDialogOpen(false)
    setEditingItem(null)
    toast.success("Menu berhasil diperbarui!", {
      description: `"${formData.name}" telah disimpan.`,
    })
  }

  const openDeleteDialog = (item: MenuItem) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (deletingItem) {
      deleteMenuItem(currentUMKM.id, deletingItem.id)
      toast.success(`Menu "${deletingItem.name}" berhasil dihapus`)
      setDeleteDialogOpen(false)
      setDeletingItem(null)
    }
  }

  // Order management functions
  const handleAcceptOrder = (order: Order) => {
    updateOrderStatus(order.id, "ready")
    toast.success("Pesanan diterima!", {
      description: `Pesanan ${order.id} sedang diproses`,
    })
  }

  const handleCompleteOrder = (order: Order) => {
    updateOrderStatus(order.id, "completed")
    toast.success("Pesanan selesai!", {
      description: `Pesanan ${order.id} telah selesai dan siap diambil`,
    })
  }

  const handleRejectOrder = (order: Order) => {
    updateOrderStatus(order.id, "pending")
    toast.error("Pesanan ditolak", {
      description: `Pesanan ${order.id} telah ditolak`,
    })
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setOrderDetailOpen(true)
  }

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Pesanan Baru</Badge>
      case "ready":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Sedang Diproses</Badge>
      case "completed":
        return <Badge className="bg-success/20 text-success border-success/30">Selesai</Badge>
      case "pending":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Ditolak</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "confirmed":
        return <Bell className="h-5 w-5 text-warning" />
      case "ready":
        return <ChefHat className="h-5 w-5 text-primary" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case "pending":
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5" />
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
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{currentUMKM.name}</p>
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
                <h1 className="text-xl font-bold text-foreground">{currentUMKM.name}</h1>
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

              {/* Quick Actions */}
              {newOrdersCount > 0 && (
                <Card className="mb-8 rounded-2xl border-warning/30 bg-gradient-to-r from-warning/10 to-warning/5 shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-warning/20 flex items-center justify-center animate-pulse">
                        <Bell className="h-7 w-7 text-warning" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">Pesanan Menunggu!</h3>
                        <p className="text-sm text-muted-foreground">
                          Anda memiliki {newOrdersCount} pesanan baru yang perlu diproses segera
                        </p>
                      </div>
                      <Button 
                        className="rounded-xl shadow-md bg-warning hover:bg-warning/90 text-warning-foreground"
                        onClick={() => setActiveSection("orders")}
                      >
                        Lihat Pesanan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                            {umkmOrders.length}
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
                          {preparingOrdersCount > 0 && (
                            <Badge className="ml-1 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                              {preparingOrdersCount}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="gap-1.5 text-xs sm:text-sm">
                          Selesai
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search */}
                  <div className="relative max-w-md mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Cari pesanan (ID, nama pelanggan, menu)..."
                      className="pl-12 h-12 rounded-xl"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Orders List */}
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
                      <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-semibold text-foreground">Belum Ada Pesanan</p>
                      <p className="text-muted-foreground">
                        {orderFilter === "all" 
                          ? "Pesanan dari pelanggan akan muncul di sini"
                          : `Tidak ada pesanan dengan status "${orderFilter === "confirmed" ? "baru" : orderFilter === "ready" ? "diproses" : "selesai"}"`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                            order.status === "confirmed" 
                              ? "border-warning/50 bg-warning/5" 
                              : order.status === "ready"
                              ? "border-primary/50 bg-primary/5"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Order Info */}
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                                order.status === "confirmed" 
                                  ? "bg-warning/20" 
                                  : order.status === "ready"
                                  ? "bg-primary/20"
                                  : order.status === "completed"
                                  ? "bg-success/20"
                                  : "bg-muted"
                              }`}>
                                {getStatusIcon(order.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-mono font-bold text-sm text-primary">
                                    {order.id}
                                  </span>
                                  {getStatusBadge(order.status)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <User className="h-4 w-4" />
                                  <span className="font-medium text-foreground">{order.customerName}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Utensils className="h-3 w-3" />
                                    {order.menuItem.name} x{order.quantity}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Ambil: {order.pickupTime}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price & Actions */}
                            <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/50">
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">{formatPrice(order.totalPrice)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(order.createdAt)} {formatTime(order.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-xl"
                                  onClick={() => openOrderDetail(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {order.status === "confirmed" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                                      onClick={() => handleRejectOrder(order)}
                                    >
                                      <Ban className="h-4 w-4 mr-1" />
                                      Tolak
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="rounded-xl bg-success hover:bg-success/90 text-success-foreground"
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
                                    className="rounded-xl"
                                    onClick={() => handleCompleteOrder(order)}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Selesai
                                  </Button>
                                )}
                              </div>
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
                          <div className="aspect-video relative overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
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
                                  checked={item.isAvailable}
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

                  {filteredItems.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                      <p className="text-muted-foreground">Tidak ada menu yang ditemukan</p>
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
                  <div className="text-center py-12 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Fitur pengaturan akan segera tersedia</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Floating Action Button */}
        {activeSection === "menu" && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
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

      {/* Order Detail Dialog */}
      <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              Detail Pesanan
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {/* Order ID & Status */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono font-bold text-primary">{selectedOrder.id}</p>
                </div>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Informasi Pelanggan</h4>
                <div className="p-3 bg-muted/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedOrder.customerName}</span>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Detail Pesanan</h4>
                <div className="p-3 bg-muted/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-xl overflow-hidden relative">
                      <Image
                        src={selectedOrder.menuItem.image}
                        alt={selectedOrder.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{selectedOrder.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">x{selectedOrder.quantity}</p>
                    </div>
                    <p className="font-bold text-primary">{formatPrice(selectedOrder.totalPrice)}</p>
                  </div>
                </div>
              </div>

              {/* Pickup Time */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Waktu Pengambilan</h4>
                <div className="p-3 bg-muted/30 rounded-xl flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedOrder.pickupTime}</span>
                </div>
              </div>

              {/* Order Time */}
              <div className="p-3 bg-muted/30 rounded-xl flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Waktu Pemesanan</span>
                <span>{formatDate(selectedOrder.createdAt)} {formatTime(selectedOrder.createdAt)}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOrderDetailOpen(false)} className="rounded-xl">
              Tutup
            </Button>
            {selectedOrder?.status === "confirmed" && (
              <>
                <Button 
                  variant="outline" 
                  className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    handleRejectOrder(selectedOrder)
                    setOrderDetailOpen(false)
                  }}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Tolak
                </Button>
                <Button 
                  className="rounded-xl bg-success hover:bg-success/90 text-success-foreground"
                  onClick={() => {
                    handleAcceptOrder(selectedOrder)
                    setOrderDetailOpen(false)
                  }}
                >
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Terima
                </Button>
              </>
            )}
            {selectedOrder?.status === "ready" && (
              <Button 
                className="rounded-xl"
                onClick={() => {
                  handleCompleteOrder(selectedOrder)
                  setOrderDetailOpen(false)
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Selesai
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-xl">
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl">
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
          <div className="text-center py-8 text-muted-foreground">
            <p>Fitur ini akan segera tersedia</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="rounded-xl">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
