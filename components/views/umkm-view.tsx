"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Bell
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

export function UMKMView() {
  const { approvedUMKMs, orders, updateMenuItem, deleteMenuItem } = useData()
  
  // Simulate logged in UMKM - using first approved UMKM
  const currentUMKM = approvedUMKMs[0]
  const [searchQuery, setSearchQuery] = useState("")
  
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

  if (!currentUMKM) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Tidak ada UMKM</h2>
          <p className="text-muted-foreground">Belum ada UMKM yang terverifikasi</p>
        </div>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{currentUMKM.name}</h1>
                <p className="text-muted-foreground">{currentUMKM.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {newOrdersCount > 0 && (
                <Badge className="bg-success/10 text-success border-success/30 gap-1">
                  <Bell className="h-3 w-3" />
                  {newOrdersCount} Pesanan Baru
                </Badge>
              )}
              <Badge variant="secondary" className="w-fit">
                UMKM Terverifikasi
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Menu</p>
                  <p className="text-2xl font-bold text-foreground">{menuItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Menu Aktif</p>
                  <p className="text-2xl font-bold text-foreground">{availableItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Stok</p>
                  <p className="text-2xl font-bold text-foreground">{totalStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pesanan Hari Ini</p>
                  <p className="text-2xl font-bold text-foreground">{umkmOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Notification */}
        {newOrdersCount > 0 && (
          <Card className="mb-8 border-success/30 bg-success/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Pesanan Baru!</h3>
                  <p className="text-sm text-muted-foreground">
                    Anda memiliki {newOrdersCount} pesanan baru yang perlu diproses
                  </p>
                </div>
                <Button variant="outline" className="border-success/30 text-success hover:bg-success/10">
                  Lihat Pesanan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Management Section */}
        <Card id="kelola">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Kelola Menu</CardTitle>
              <CardDescription>Atur menu makanan dan minuman Anda</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Network Error Toggle for Testing */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch
                  checked={simulateNetworkError}
                  onCheckedChange={setSimulateNetworkError}
                  id="network-toggle"
                />
                <label htmlFor="network-toggle" className="cursor-pointer flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  <span className="hidden sm:inline">Simulasi Error</span>
                </label>
              </div>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Tambah Menu
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative max-w-sm mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari menu..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Menu Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Menu</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-center">Stok</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <span className="text-lg">🍽️</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(item.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.stock === 0 ? "destructive" : item.stock <= 5 ? "outline" : "secondary"}>
                          {item.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={item.isAvailable}
                            onCheckedChange={() => toggleAvailability(item.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Tidak ada menu yang ditemukan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Menu Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
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
                className={formErrors.name ? "border-destructive" : ""}
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
                className={formErrors.price ? "border-destructive" : ""}
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
                className={formErrors.stock ? "border-destructive" : ""}
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
                className={formErrors.description ? "border-destructive" : ""}
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
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Hapus Menu
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus menu <strong>{deletingItem?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
