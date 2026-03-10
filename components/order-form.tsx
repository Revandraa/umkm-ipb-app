"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  Clock, 
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Store,
  MapPin,
  Copy,
  Utensils
} from "lucide-react"
import { formatPrice, type MenuItem } from "@/lib/mock-data"
import { useData, type Order } from "@/lib/data-context"
import { toast } from "sonner"

interface ExtendedMenuItem extends MenuItem {
  vendorName: string
  vendorId: string
}

interface OrderFormProps {
  item: ExtendedMenuItem
  onBack: () => void
  onSuccess: (order: Order) => void
}

export function OrderForm({ item, onBack, onSuccess }: OrderFormProps) {
  const { addOrder, approvedUMKMs } = useData()
  const [quantity, setQuantity] = useState(1)
  const [pickupTime, setPickupTime] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [errors, setErrors] = useState<{ pickupTime?: string; quantity?: string; customerName?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current stock from context
  const currentUMKM = approvedUMKMs.find(u => u.id === item.vendorId)
  const currentMenuItem = currentUMKM?.menu.find(m => m.id === item.id)
  const currentStock = currentMenuItem?.stock ?? item.stock

  const isOutOfStock = currentStock === 0
  const maxQuantity = Math.min(currentStock, 10)
  const totalPrice = item.price * quantity

  const validateForm = () => {
    const newErrors: { pickupTime?: string; quantity?: string; customerName?: string } = {}
    
    if (!customerName.trim()) {
      newErrors.customerName = "Nama wajib diisi"
    }

    if (!pickupTime) {
      newErrors.pickupTime = "Pesan error: Wajib isi"
    } else {
      // Validate time is in the future
      const now = new Date()
      const [hours, minutes] = pickupTime.split(":").map(Number)
      const pickupDate = new Date()
      pickupDate.setHours(hours, minutes, 0, 0)
      
      if (pickupDate <= now) {
        newErrors.pickupTime = "Jam pengambilan harus lebih dari waktu sekarang"
      }
    }

    if (quantity > currentStock) {
      newErrors.quantity = `Stok tidak mencukupi (tersisa ${currentStock})`
    }

    if (quantity < 1) {
      newErrors.quantity = "Minimal pemesanan 1 porsi"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (errors.pickupTime) {
        toast.error("Validasi Gagal", {
          description: errors.pickupTime,
        })
      }
      return
    }

    if (isOutOfStock) {
      toast.error("Stok Kosong", {
        description: "Maaf, menu ini sedang tidak tersedia.",
        icon: <AlertCircle className="h-4 w-4" />,
      })
      return
    }

    setIsSubmitting(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const order = addOrder({
      menuItem: item,
      quantity,
      pickupTime,
      totalPrice,
      customerName: customerName.trim(),
    })

    setIsSubmitting(false)
    
    // Notify UMKM (simulated)
    toast.success("Pesanan Berhasil Dibuat!", {
      description: `Notifikasi telah dikirim ke ${item.vendorName}`,
    })

    onSuccess(order)
  }

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(q => q + 1)
      if (errors.quantity) {
        setErrors(e => ({ ...e, quantity: undefined }))
      }
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1)
      if (errors.quantity) {
        setErrors(e => ({ ...e, quantity: undefined }))
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Menu
      </Button>

      <Card className="overflow-hidden border-2 border-border">
        {/* Menu Detail Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-32 h-32 rounded-xl bg-card flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-5xl">🍽️</span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="secondary" className="mb-2">{item.category}</Badge>
                  <h2 className="text-2xl font-bold text-foreground">{item.name}</h2>
                </div>
                {isOutOfStock ? (
                  <Badge variant="destructive" className="shrink-0">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Stok Kosong
                  </Badge>
                ) : currentStock <= 5 ? (
                  <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30 shrink-0">
                    Sisa {currentStock}
                  </Badge>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-2">{item.description}</p>
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Store className="h-4 w-4" />
                <span>{item.vendorName}</span>
              </div>
              <p className="text-2xl font-bold text-primary mt-3">{formatPrice(item.price)}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {isOutOfStock ? (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Stok Tidak Tersedia</h3>
              <p className="text-muted-foreground mb-4">
                Maaf, menu ini sedang habis. Silakan pilih menu lain atau coba lagi nanti.
              </p>
              <Button variant="outline" onClick={onBack}>
                Kembali ke Menu
              </Button>
            </div>
          ) : (
            <FieldGroup className="space-y-6">
              {/* Customer Name */}
              <Field>
                <FieldLabel>Nama Pemesan</FieldLabel>
                <Input
                  placeholder="Masukkan nama Anda"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value)
                    if (errors.customerName) {
                      setErrors(e => ({ ...e, customerName: undefined }))
                    }
                  }}
                  className={errors.customerName ? "border-destructive" : ""}
                />
                {errors.customerName && <FieldError>{errors.customerName}</FieldError>}
              </Field>

              {/* Quantity */}
              <Field>
                <FieldLabel>Jumlah Porsi</FieldLabel>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-input rounded-lg overflow-hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-none h-10 w-10"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-foreground">{quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-none h-10 w-10"
                      onClick={incrementQuantity}
                      disabled={quantity >= maxQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Stok tersedia: {currentStock}
                  </span>
                </div>
                {errors.quantity && <FieldError>{errors.quantity}</FieldError>}
              </Field>

              {/* Pickup Time */}
              <Field>
                <FieldLabel>Jam Pengambilan</FieldLabel>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => {
                      setPickupTime(e.target.value)
                      if (errors.pickupTime) {
                        setErrors(err => ({ ...err, pickupTime: undefined }))
                      }
                    }}
                    className={`pl-10 ${errors.pickupTime ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.pickupTime && <FieldError>{errors.pickupTime}</FieldError>}
                <p className="text-xs text-muted-foreground mt-1">
                  Pilih waktu pengambilan pesanan di lokasi UMKM
                </p>
              </Field>

              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground">Ringkasan Pesanan</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name} x {quantity}</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-bold text-lg text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                className="w-full h-12 text-base gap-2" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Memproses Pesanan...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    Konfirmasi Pesanan
                  </>
                )}
              </Button>
            </FieldGroup>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface OrderSuccessProps {
  order: Order
  onBackToMenu: () => void
}

export function OrderSuccess({ order, onBackToMenu }: OrderSuccessProps) {
  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id)
    toast.success("Order ID disalin!")
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      <Card className="overflow-hidden border-2 border-success/30">
        <div className="bg-gradient-to-br from-success/20 via-success/10 to-transparent p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Pesanan Berhasil!</h2>
            <p className="text-muted-foreground">
              Pesanan Anda telah dikonfirmasi dan dikirim ke UMKM
            </p>
          </motion.div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Order ID */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-lg p-4"
          >
            <p className="text-xs text-muted-foreground mb-1">Order ID</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-lg font-mono font-bold text-primary">{order.id}</code>
              <Button variant="ghost" size="icon" onClick={copyOrderId}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Utensils className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Menu</p>
                <p className="font-medium text-foreground">
                  {order.menuItem.name} x {order.quantity}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Store className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">UMKM</p>
                <p className="font-medium text-foreground">{order.menuItem.vendorName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Jam Pengambilan</p>
                <p className="font-medium text-foreground">{order.pickupTime}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span className="font-medium text-foreground">Total Pembayaran</span>
              <span className="text-xl font-bold text-primary">{formatPrice(order.totalPrice)}</span>
            </div>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2"
          >
            <Badge className="bg-success/10 text-success border-success/30 hover:bg-success/20 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Status: Dikonfirmasi
            </Badge>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={onBackToMenu}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Menu
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
