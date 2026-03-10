"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  X
} from "lucide-react"
import { formatPrice } from "@/lib/mock-data"
import type { MenuItem } from "@/lib/mock-data"
import { useData } from "@/lib/data-context"
import { toast } from "sonner"

interface FormErrors {
  name?: string
  price?: string
  stock?: string
  description?: string
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "menu", label: "Kelola Menu", icon: UtensilsCrossed },
  { id: "orders", label: "Pesanan", icon: ClipboardList },
  { id: "settings", label: "Pengaturan", icon: Settings },
]

export function UMKMView() {
  const { approvedUMKMs, orders, updateMenuItem, deleteMenuItem } = useData()
  
  // Simulate logged in UMKM - using first approved UMKM
  const currentUMKM = approvedUMKMs[0]
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState("menu")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
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

  const toggleAvailability = (itemId: string) => {
    const item = menuItems.find(m => m.id === itemId)
    if (item) {
      updateMenuItem(currentUMKM.id, itemId, { isAvailable: !item.isAvailable })
      toast.success(`Status menu "${item.name}" berhasil diubah`, {
        className: "bg-primary text-primary-foreground",
      })
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
                <Badge className="bg-success text-success-foreground gap-1.5 py-1.5 px-3 rounded-full shadow-md">
                  <Bell className="h-3.5 w-3.5" />
                  {newOrdersCount} Pesanan Baru
                </Badge>
              )}
              {/* Network Error Toggle for Testing */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
                <Switch
                  checked={simulateNetworkError}
                  onCheckedChange={setSimulateNetworkError}
                  id="network-toggle"
                />
                <label htmlFor="network-toggle" className="cursor-pointer flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  <span className="text-xs">Test Error</span>
                </label>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Total Menu</p>
                    <p className="text-2xl font-bold text-foreground">{menuItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Menu Aktif</p>
                    <p className="text-2xl font-bold text-foreground">{availableItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Total Stok</p>
                    <p className="text-2xl font-bold text-foreground">{totalStock}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-warning/15 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Pesanan Hari Ini</p>
                    <p className="text-2xl font-bold text-foreground">{umkmOrders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders Notification */}
          {newOrdersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mb-8 rounded-2xl border-success/30 bg-gradient-to-r from-success/10 to-success/5 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-success/20 flex items-center justify-center">
                      <Bell className="h-7 w-7 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg">Pesanan Baru!</h3>
                      <p className="text-sm text-muted-foreground">
                        Anda memiliki {newOrdersCount} pesanan baru yang perlu diproses
                      </p>
                    </div>
                    <Button className="rounded-xl shadow-md bg-success hover:bg-success/90 text-success-foreground">
                      Lihat Pesanan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Menu Management Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
                        <div className="aspect-video bg-gradient-to-br from-primary/10 via-secondary to-muted relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                              {item.category === "Minuman" ? "🥤" : item.category === "Makanan Ringan" ? "🍪" : "🍽️"}
                            </span>
                          </div>
                          {item.stock === 0 && (
                            <div className="absolute top-3 right-3">
                              <Badge variant="destructive" className="rounded-full">Habis</Badge>
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
        </div>

        {/* Floating Action Button */}
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
              Apakah Anda yakin ingin menghapus menu "{deletingItem?.name}"? 
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
