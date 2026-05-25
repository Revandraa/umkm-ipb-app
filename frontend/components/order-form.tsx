"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
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
  Utensils,
  QrCode,
  Upload,
  Image as ImageIcon,
  Trash2,
  Info,
  Check,
  FileText
} from "lucide-react"
import { formatPrice, type MenuItem } from "@/lib/mock-data"
import { useData, type Order, type Promo } from "@/lib/data-context"
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
  const { addOrder, uploadPaymentProof, approvedUMKMs, promos } = useData()
  const [step, setStep] = useState<"form" | "payment">("form")
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  
  const [quantity, setQuantity] = useState(1)
  const [pickupTime, setPickupTime] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [notes, setNotes] = useState("")
  const [promoCodeInput, setPromoCodeInput] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ pickupTime?: string; quantity?: string; customerName?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Payment proof states
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Get current stock from context
  const currentUMKM = approvedUMKMs.find(u => u.id === item.vendorId)
  const currentMenuItem = currentUMKM?.menu.find(m => m.id === item.id)
  const currentStock = currentMenuItem?.stock ?? item.stock

  const isOutOfStock = currentStock === 0
  const maxQuantity = Math.min(currentStock, 10)

  // Calculate prices based on applied promo code
  const baseTotalPrice = item.price * quantity
  let discountAmount = 0
  if (appliedPromo) {
    if (appliedPromo.discount_type === "percent") {
      discountAmount = baseTotalPrice * (appliedPromo.discount_value / 100)
      if (appliedPromo.max_discount !== null) {
        discountAmount = Math.min(discountAmount, appliedPromo.max_discount)
      }
    } else {
      discountAmount = appliedPromo.discount_value
    }
  }
  const totalPrice = Math.max(baseTotalPrice - discountAmount, 0)

  // Revalidate promo if quantity / subtotal changes
  useEffect(() => {
    if (appliedPromo && baseTotalPrice < appliedPromo.min_order) {
      setAppliedPromo(null)
      setPromoError(`Promo dibatalkan karena total belanja kurang dari ${formatPrice(appliedPromo.min_order)}`)
      toast.error("Promo Dibatalkan", {
        description: "Total belanja tidak memenuhi syarat minimum promo."
      })
    }
  }, [quantity, baseTotalPrice, appliedPromo])

  // Prefill pickupTime to 15 minutes from now
  useEffect(() => {
    const defaultTime = new Date(Date.now() + 15 * 60 * 1000)
    const hours = String(defaultTime.getHours()).padStart(2, "0")
    const minutes = String(defaultTime.getMinutes()).padStart(2, "0")
    setPickupTime(`${hours}:${minutes}`)
  }, [])

  // Cleanup payment preview URL on unmount
  useEffect(() => {
    return () => {
      if (paymentPreview) {
        URL.revokeObjectURL(paymentPreview)
      }
    }
  }, [paymentPreview])

  const validateForm = () => {
    const newErrors: { pickupTime?: string; quantity?: string; customerName?: string } = {}
    
    if (!customerName.trim()) {
      newErrors.customerName = "Nama wajib diisi"
    }

    if (!pickupTime) {
      newErrors.pickupTime = "Jam pengambilan wajib diisi"
    } else {
      const now = new Date()
      const [hours, minutes] = pickupTime.split(":").map(Number)
      const pickupDate = new Date()
      pickupDate.setHours(hours, minutes, 0, 0)
      
      const minPickupDate = new Date(now.getTime() + 15 * 60 * 1000)
      if (pickupDate < minPickupDate) {
        newErrors.pickupTime = "Jam pengambilan minimal 15 menit dari waktu sekarang (waktu memasak UMKM)"
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

  const handleApplyPromo = () => {
    setPromoError(null)
    if (!promoCodeInput.trim()) {
      setPromoError("Kode promo wajib diisi")
      return
    }

    const code = promoCodeInput.trim().toUpperCase()
    const promo = promos.find(p => p.code.toUpperCase() === code)

    if (!promo) {
      setPromoError("Kode voucher tidak valid")
      setAppliedPromo(null)
      return
    }

    if (!promo.is_active) {
      setPromoError("Voucher sedang tidak aktif")
      setAppliedPromo(null)
      return
    }

    const now = new Date()
    if (new Date(promo.valid_from) > now || new Date(promo.valid_until) < now) {
      setPromoError("Voucher sudah kedaluwarsa")
      setAppliedPromo(null)
      return
    }

    if (baseTotalPrice < promo.min_order) {
      setPromoError(`Minimal belanja untuk promo ini adalah ${formatPrice(promo.min_order)}`)
      setAppliedPromo(null)
      return
    }

    if (promo.umkm_id && promo.umkm_id !== item.vendorId) {
      setPromoError("Voucher tidak berlaku untuk UMKM ini")
      setAppliedPromo(null)
      return
    }

    setAppliedPromo(promo)
    toast.success("Promo Berhasil Diterapkan!", {
      description: `Diskon telah dikurangi dari total belanja.`
    })
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCodeInput("")
    setPromoError(null)
    toast.success("Promo Dihapus")
  }

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      if (errors.pickupTime) {
        toast.error("Validasi Gagal", { description: errors.pickupTime })
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
    
    try {
      // Create the pending order in the database
      const order = await addOrder({
        menuItem: item,
        quantity,
        pickupTime,
        totalPrice,
        customerName: customerName.trim(),
        notes: notes.trim(),
        promoCode: appliedPromo ? appliedPromo.code : undefined,
      })
      
      setActiveOrder(order)
      setStep("payment")
      toast.success("Pesanan Dibuat", {
        description: "Silakan selesaikan pembayaran QRIS berikut."
      })
    } catch (err) {
      toast.error("Gagal membuat pesanan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Format File Salah", { description: "Harap unggah file gambar (JPG, PNG, atau WEBP)." })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File Terlalu Besar", { description: "Ukuran file maksimal adalah 5MB." })
        return
      }

      setPaymentFile(file)
      if (paymentPreview) URL.revokeObjectURL(paymentPreview)
      setPaymentPreview(URL.createObjectURL(file))
    }
  }

  const handleUploadProof = async () => {
    if (!paymentFile || !activeOrder) {
      toast.error("Bukti Pembayaran Wajib", { description: "Silakan unggah foto bukti transfer terlebih dahulu." })
      return
    }

    setIsUploading(true)

    try {
      const success = await uploadPaymentProof(activeOrder.id, paymentFile)
      if (success) {
        toast.success("Bukti Pembayaran Terkirim!", {
          description: "Pesanan Anda sedang menunggu verifikasi toko."
        })
        
        // Pass the updated order to onSuccess
        const confirmedOrder: Order = {
          ...activeOrder,
          status: "confirmed",
          paymentProof: paymentPreview || ""
        }
        onSuccess(confirmedOrder)
      } else {
        toast.error("Gagal mengunggah bukti pembayaran")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengunggah bukti pembayaran")
    } finally {
      setIsUploading(false)
    }
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={step === "payment" ? () => setStep("form") : onBack}
        className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {step === "payment" ? "Kembali ke Formulir" : "Kembali ke Menu"}
      </Button>

      <Card className="overflow-hidden border-2 border-border/80 shadow-xl rounded-2xl bg-card">
        {/* Menu Detail Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/40">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-32 h-32 rounded-xl bg-muted overflow-hidden shrink-0 shadow-md relative border border-border/50">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="secondary" className="mb-2 rounded-full font-medium">{item.category}</Badge>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">{item.name}</h2>
                </div>
                {isOutOfStock ? (
                  <Badge variant="destructive" className="shrink-0 rounded-full">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Stok Kosong
                  </Badge>
                ) : currentStock <= 5 ? (
                  <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30 shrink-0 rounded-full animate-pulse">
                    Sisa {currentStock}
                  </Badge>
                ) : null}
              </div>
              <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-primary">
                <Store className="h-4 w-4 shrink-0" />
                <span>{item.vendorName}</span>
              </div>
              <p className="text-2xl font-black text-primary mt-3">{formatPrice(item.price)}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="form-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {isOutOfStock ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Stok Tidak Tersedia</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
                      Maaf, menu ini sedang habis di toko. Silakan pilih menu lain atau hubungi penjual.
                    </p>
                    <Button variant="outline" onClick={onBack} className="rounded-xl">
                      Kembali ke Menu
                    </Button>
                  </div>
                ) : (
                  <FieldGroup className="space-y-6">
                    {/* Customer Name */}
                    <Field>
                      <FieldLabel className="text-sm font-bold text-foreground">Nama Pemesan</FieldLabel>
                      <Input
                        placeholder="Masukkan nama lengkap Anda"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value)
                          if (errors.customerName) {
                            setErrors(e => ({ ...e, customerName: undefined }))
                          }
                        }}
                        className={`rounded-xl h-11 border-border/80 focus-visible:ring-primary ${errors.customerName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {errors.customerName && <FieldError className="text-xs text-destructive mt-1 font-medium">{errors.customerName}</FieldError>}
                    </Field>

                    {/* Quantity */}
                    <Field>
                      <FieldLabel className="text-sm font-bold text-foreground">Jumlah Porsi</FieldLabel>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-input rounded-xl overflow-hidden shadow-sm bg-muted/20">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-none h-11 w-11 hover:bg-muted"
                            onClick={decrementQuantity}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-bold text-foreground text-lg">{quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-none h-11 w-11 hover:bg-muted"
                            onClick={incrementQuantity}
                            disabled={quantity >= maxQuantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Stok tersedia di kantin: <strong className="text-foreground">{currentStock} porsi</strong>
                        </span>
                      </div>
                      {errors.quantity && <FieldError className="text-xs text-destructive mt-1 font-medium">{errors.quantity}</FieldError>}
                    </Field>

                    {/* Pickup Time */}
                    <Field>
                      <FieldLabel className="text-sm font-bold text-foreground">Jam Pengambilan</FieldLabel>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="time"
                          value={pickupTime}
                          onChange={(e) => {
                            setPickupTime(e.target.value)
                            if (errors.pickupTime) {
                              setErrors(err => ({ ...err, pickupTime: undefined }))
                            }
                          }}
                          className={`pl-11 rounded-xl h-11 border-border/80 focus-visible:ring-primary ${errors.pickupTime ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                      </div>
                      {errors.pickupTime && <FieldError className="text-xs text-destructive mt-1 font-medium">{errors.pickupTime}</FieldError>}
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1 font-medium">
                        <Info className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                        UMKM membutuhkan minimal 15 menit untuk mempersiapkan dan memasak pesanan Anda.
                      </p>
                    </Field>

                    {/* Catatan Tambahan */}
                    <Field>
                      <FieldLabel className="text-sm font-bold text-foreground">Catatan Tambahan (Opsional)</FieldLabel>
                      <Textarea
                        placeholder="Contoh: pedas, sendok plastik, kuah dipisah, dll."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="rounded-xl border-border/80 focus-visible:ring-primary"
                        rows={2}
                      />
                    </Field>

                    {/* Voucher Code */}
                    <Field>
                      <FieldLabel className="text-sm font-bold text-foreground">Kode Promo / Voucher</FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Masukkan kode voucher (contoh: PROMO10)"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          disabled={!!appliedPromo}
                          className="rounded-xl h-11 border-border/80 uppercase focus-visible:ring-primary flex-1"
                        />
                        {appliedPromo ? (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={handleRemovePromo}
                            className="rounded-xl h-11 px-4"
                          >
                            Hapus
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleApplyPromo}
                            className="rounded-xl h-11 px-5 font-bold"
                          >
                            Terapkan
                          </Button>
                        )}
                      </div>
                      {promoError && (
                        <p className="text-xs text-destructive mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {promoError}
                        </p>
                      )}
                      {appliedPromo && (
                        <p className="text-xs text-success mt-1 font-bold flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Promo &quot;{appliedPromo.title}&quot; berhasil digunakan!
                        </p>
                      )}
                    </Field>

                    {/* Order Summary */}
                    <div className="bg-muted/40 rounded-2xl p-5 border border-border/50 space-y-3">
                      <h4 className="font-bold text-foreground text-sm uppercase tracking-wider text-muted-foreground">Ringkasan Pesanan</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">{item.name} x {quantity}</span>
                        <span className="text-foreground font-semibold">{formatPrice(baseTotalPrice)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-success font-bold">
                          <span>Diskon Voucher</span>
                          <span>-{formatPrice(discountAmount)}</span>
                        </div>
                      )}
                      <div className="border-t border-border/60 pt-3 flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total Tagihan</span>
                        <span className="font-black text-xl text-primary">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      className="w-full h-12 text-base font-bold gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all" 
                      onClick={handleProceedToPayment}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-5 w-5" />
                          Lanjut ke Pembayaran
                        </>
                      )}
                    </Button>
                  </FieldGroup>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="payment-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* QRIS Display */}
                <div className="max-w-sm mx-auto bg-gradient-to-b from-card to-secondary/30 rounded-3xl p-5 border-2 border-primary/20 shadow-xl relative overflow-hidden flex flex-col items-center">
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-blue-500 to-amber-500" />
                  
                  {/* QRIS Branding */}
                  <div className="w-full flex justify-between items-center mb-4 px-2 pt-2">
                    <span className="font-extrabold text-sm text-foreground tracking-widest">QRIS</span>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold py-0.5 px-2 rounded-full">
                      GPN & Bank Indonesia
                    </Badge>
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="font-black text-foreground text-lg tracking-tight uppercase">{item.vendorName}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">NMID: ID1020304050607</p>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-white p-4 rounded-2xl shadow-inner border border-muted flex items-center justify-center w-52 h-52 relative group">
                    {/* Dummy QR Code SVG */}
                    <svg className="w-44 h-44 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      <rect width="100" height="100" fill="white" />
                      {/* Outer Corners */}
                      <path d="M5,5 h25 v25 h-25 z M12,12 h11 v11 h-11 z" />
                      <path d="M70,5 h25 v25 h-25 z M77,12 h11 v11 h-11 z" />
                      <path d="M5,70 h25 v25 h-25 z M12,77 h11 v11 h-11 z" />
                      <path d="M80,80 h15 v15 h-15 z" />
                      {/* Random Grid Blocks for realistic QR look */}
                      <path d="M35,5 h10 v5 h-10 z M50,5 h15 v5 h-15 z M40,15 h15 v10 h-15 z M60,15 h5 v5 h-5 z" />
                      <path d="M35,30 h10 v5 h-10 z M50,30 h5 v5 h-5 z M60,30 h10 v15 h-10 z" />
                      <path d="M5,35 h15 v5 h-15 z M25,35 h5 v10 h-5 z M15,45 h15 v5 h-15 z M5,55 h10 v10 h-10 z" />
                      <path d="M35,50 h15 v5 h-15 z M55,50 h10 v5 h-10 z M35,60 h5 v15 h-5 z M45,65 h15 v5 h-15 z" />
                      <path d="M35,80 h15 v5 h-15 z M55,80 h10 v10 h-10 z M70,55 h25 v5 h-25 z M80,65 h10 v10 h-10 z" />
                      {/* Center food logo for branding */}
                      <rect x="42" y="42" width="16" height="16" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />
                      <circle cx="50" cy="50" r="5" fill="#f97316" />
                    </svg>
                    
                    {/* Tiny Brand Center Overlay */}
                    <div className="absolute inset-0 m-auto w-10 h-10 bg-primary rounded-xl border-4 border-white flex items-center justify-center shadow-lg">
                      <QrCode className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-[10px] text-muted-foreground font-semibold">Total Tagihan Pembayaran</p>
                    <p className="text-2xl font-black text-primary tracking-tight mt-1">{formatPrice(totalPrice)}</p>
                  </div>
                </div>

                {/* Upload Form */}
                <div className="space-y-4">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    Unggah Bukti Pembayaran
                  </h4>
                  
                  {/* File Selector Dropzone */}
                  {!paymentFile ? (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border hover:border-primary rounded-2xl cursor-pointer bg-muted/10 hover:bg-primary/5 transition-all duration-200">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <div className="p-3 bg-primary/10 rounded-2xl mb-2 text-primary">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Klik untuk memilih foto / bukti transfer
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          Mendukung file PNG, JPG, JPEG (Maks. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-2xl border-2 border-border overflow-hidden bg-muted/10 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 relative rounded-xl border overflow-hidden shrink-0 bg-white">
                          {paymentPreview && (
                            <img
                              src={paymentPreview}
                              alt="Bukti pembayaran"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">{paymentFile.name}</p>
                          <p className="text-xs text-muted-foreground font-semibold">{(paymentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                        onClick={() => {
                          setPaymentFile(null)
                          if (paymentPreview) URL.revokeObjectURL(paymentPreview)
                          setPaymentPreview(null)
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <Button
                  className="w-full h-12 text-base font-bold gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all mt-6"
                  onClick={handleUploadProof}
                  disabled={isUploading || !paymentFile}
                >
                  {isUploading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Mengunggah Bukti Pembayaran...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Kirim Bukti Pembayaran
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
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

  // Determine status configurations for different states
  const getSuccessContent = () => {
    switch (order.status) {
      case "pending":
        return {
          title: "Menunggu Pembayaran",
          desc: "Pesanan Anda sudah masuk ke sistem. Silakan selesaikan pembayaran agar pesanan dapat diproses oleh toko.",
          icon: <QrCode className="h-10 w-10 text-warning" />,
          colorClass: "bg-warning/20 border-warning/30",
          badge: <Badge className="bg-warning/10 text-warning border-warning/30 hover:bg-warning/20">Awaiting Payment</Badge>
        }
      case "confirmed":
        return {
          title: "Menunggu Konfirmasi Toko",
          desc: "Bukti pembayaran telah berhasil dikirimkan. Penjual sedang memverifikasi pembayaran Anda. Mohon tunggu.",
          icon: <Clock className="h-10 w-10 text-blue-500" />,
          colorClass: "bg-blue-500/10 border-blue-500/20",
          badge: <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/20">Menunggu Verifikasi</Badge>
        }
      case "ready":
      case "completed":
        return {
          title: "Pembayaran Berhasil Disetujui!",
          desc: "Pembayaran Anda telah diverifikasi oleh toko! Pesanan Anda sedang dipersiapkan atau sudah siap diambil.",
          icon: <CheckCircle2 className="h-10 w-10 text-success" />,
          colorClass: "bg-success/20 border-success/30",
          badge: <Badge className="bg-success/10 text-success border-success/30 hover:bg-success/20">Pembayaran Sukses</Badge>
        }
      case "cancelled":
        return {
          title: "Pesanan Ditolak/Dibatalkan",
          desc: "Maaf, pesanan Anda telah ditolak atau dibatalkan oleh toko. Silakan periksa kembali bukti pembayaran Anda atau hubungi penjual.",
          icon: <AlertCircle className="h-10 w-10 text-destructive" />,
          colorClass: "bg-destructive/10 border-destructive/20",
          badge: <Badge className="bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20">Pesanan Ditolak</Badge>
        }
      default:
        return {
          title: "Status Pesanan Diproses",
          desc: "Pesanan Anda dalam pemrosesan.",
          icon: <Clock className="h-10 w-10 text-primary" />,
          colorClass: "bg-primary/10 border-primary/20",
          badge: <Badge variant="secondary">Status: {order.status}</Badge>
        }
    }
  }

  const content = getSuccessContent()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      <Card className={`overflow-hidden border-2 rounded-2xl shadow-xl bg-card ${content.colorClass}`}>
        <div className="p-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-4"
          >
            <div className="h-20 w-20 rounded-full bg-background flex items-center justify-center shadow-md">
              {content.icon}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-black text-foreground tracking-tight">{content.title}</h2>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              {content.desc}
            </p>
          </motion.div>
        </div>

        <CardContent className="p-6 bg-card border-t border-border/40 space-y-4">
          {/* Order ID */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-2xl p-4 border border-border/40"
          >
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Order ID</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-base font-mono font-bold text-primary break-all">{order.id}</code>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={copyOrderId}>
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
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/20">
              <Utensils className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Menu</p>
                <p className="font-bold text-foreground text-sm truncate">
                  {order.menuItem.name} <span className="text-primary">x{order.quantity}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/20">
              <Store className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">UMKM Kantin</p>
                <p className="font-bold text-foreground text-sm truncate">{order.menuItem.vendorName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/20">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Estimasi Jam Pengambilan</p>
                <p className="font-bold text-foreground text-sm">{order.pickupTime}</p>
              </div>
            </div>

            {order.notes && (
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/20">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Catatan</p>
                  <p className="font-bold text-foreground text-sm whitespace-pre-wrap">{order.notes}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <span className="font-semibold text-foreground text-sm">Total Pembayaran</span>
              <span className="text-xl font-black text-primary">{formatPrice(order.totalPrice)}</span>
            </div>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 pt-2"
          >
            {content.badge}
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-2"
          >
            <Button 
              variant="outline" 
              className="w-full h-11 font-bold rounded-xl" 
              onClick={onBackToMenu}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Menu Utama
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
