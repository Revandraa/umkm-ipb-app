
"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { LandingHero } from "@/components/landing-hero"
import { UMKMCard } from "@/components/umkm-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Search, Store, Utensils, AlertCircle, ShoppingCart, MapPin, Star, Clock, ArrowLeft, QrCode, Upload, Image as ImageIcon, Trash2, Check, ClipboardList, FileText } from "lucide-react"
import { formatPrice, kantinLocations, type MenuItem, type UMKM } from "@/lib/mock-data"
import { useData, type Order } from "@/lib/data-context"
import { OrderForm, OrderSuccess } from "@/components/order-form"
import { UMKMDetailModal } from "@/components/umkm-detail-modal"
import { MahasiswaBottomNav, type MahasiswaTab } from "@/components/mahasiswa-bottom-nav"
import { MahasiswaPromoView } from "@/components/views/mahasiswa-promo-view"
import { MahasiswaAccountView } from "@/components/views/mahasiswa-account-view"
import { toast } from "sonner"

const getStatusBadgeConfig = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return { text: "Menunggu Pembayaran", className: "bg-warning/15 text-warning border-warning/30 font-semibold" }
    case "confirmed":
      return { text: "Menunggu Verifikasi Toko", className: "bg-blue-500/10 text-blue-500 border-blue-500/30 font-semibold" }
    case "ready":
      return { text: "Sedang Diproses (ACC)", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 font-bold" }
    case "completed":
      return { text: "Selesai Diambil", className: "bg-success/15 text-success border-success/20 font-semibold" }
    case "cancelled":
      return { text: "Ditolak / Batal", className: "bg-destructive/15 text-destructive border-destructive/20 font-semibold" }
    default:
      return { text: (status as string).toUpperCase(), className: "bg-muted text-muted-foreground" }
  }
}

interface ExtendedMenuItem extends MenuItem {
  vendorName: string
  vendorId: string
  vendorLocation: string
}

type ViewState = "browse" | "order" | "success" | "history"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const
    }
  }
}

interface MahasiswaViewProps {
  onLogout?: () => void
}

export function MahasiswaView({ onLogout }: MahasiswaViewProps) {
  const { approvedUMKMs, orders, customerId, customerName, uploadPaymentProof } = useData()
  const [activeTab, setActiveTab] = useState<MahasiswaTab>("beranda")
  
  // Payment states from History
  const [payingOrder, setPayingOrder] = useState<Order | null>(null)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [payFile, setPayFile] = useState<File | null>(null)
  const [payPreview, setPayPreview] = useState<string | null>(null)
  const [isUploadingPay, setIsUploadingPay] = useState(false)

  const handleOpenPayModal = (order: Order) => {
    setPayingOrder(order)
    setIsPayModalOpen(true)
  }

  const handleClosePayModal = () => {
    setPayingOrder(null)
    setIsPayModalOpen(false)
    setPayFile(null)
    if (payPreview) {
      URL.revokeObjectURL(payPreview)
      setPayPreview(null)
    }
  }

  const handlePayFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Format File Salah", { description: "Harap unggah file gambar." })
        return
      }
      setPayFile(file)
      if (payPreview) URL.revokeObjectURL(payPreview)
      setPayPreview(URL.createObjectURL(file))
    }
  }

  const handleUploadPayProofSubmit = async () => {
    if (!payFile || !payingOrder) return
    setIsUploadingPay(true)
    try {
      const success = await uploadPaymentProof(payingOrder.id, payFile)
      if (success) {
        toast.success("Bukti Pembayaran Terkirim!", {
          description: "Pembayaran Anda sedang menunggu konfirmasi toko."
        })
        handleClosePayModal()
      } else {
        toast.error("Gagal mengunggah bukti pembayaran")
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengunggah bukti")
    } finally {
      setIsUploadingPay(false)
    }
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedUMKM, setSelectedUMKM] = useState<string | null>(null)
  const [selectedKantin, setSelectedKantin] = useState<string>("all")
  const [viewState, setViewState] = useState<ViewState>("browse")
  const [selectedItem, setSelectedItem] = useState<ExtendedMenuItem | null>(null)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const [detailUMKM, setDetailUMKM] = useState<UMKM | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<Order | null>(null)
  const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false)
  
  const allMenuItems: ExtendedMenuItem[] = approvedUMKMs.flatMap((umkm) =>
    umkm.menu.map((item) => ({ 
      ...item, 
      vendorName: umkm.name, 
      vendorId: umkm.id,
      vendorLocation: umkm.location 
    }))
  )

  const categories = Array.from(new Set(allMenuItems.map((item) => item.category)))

  const filteredUMKMs = approvedUMKMs.filter((umkm) => {
    if (selectedKantin === "all") return true
    const kantinName = kantinLocations.find(k => k.id === selectedKantin)?.name || ""
    return umkm.location.toLowerCase().includes(kantinName.toLowerCase().replace("kantin ", ""))
  })

  const filteredMenuItems = allMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesUMKM = !selectedUMKM || item.vendorId === selectedUMKM
    const matchesKantin = selectedKantin === "all" || 
      item.vendorLocation.toLowerCase().includes(
        (kantinLocations.find(k => k.id === selectedKantin)?.name || "").toLowerCase().replace("kantin ", "")
      )
    return matchesSearch && matchesCategory && matchesUMKM && matchesKantin
  })

  const handleOrderClick = (item: ExtendedMenuItem) => {
    setSelectedItem(item)
    setViewState("order")
  }

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order)
    setViewState("success")
  }

  const handleBackToMenu = () => {
    setSelectedItem(null)
    setCompletedOrder(null)
    setViewState("browse")
  }

  const handleOpenUMKMDetail = (umkm: UMKM) => {
    setDetailUMKM(umkm)
    setIsDetailModalOpen(true)
  }

  const handleSelectMenuFromModal = (item: MenuItem & { vendorName: string; vendorId: string }) => {
    setIsDetailModalOpen(false)
    setSelectedItem(item as ExtendedMenuItem)
    setViewState("order")
  }

  const handleOpenHistoryDetail = (order: Order) => {
    setSelectedHistoryOrder(order)
    setIsHistoryDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <UMKMDetailModal 
        umkm={detailUMKM}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSelectMenuItem={handleSelectMenuFromModal}
      />

      {/* Tab: Promo */}
      {activeTab === "promo" && (
        <MahasiswaPromoView />
      )}

      {/* Tab: Akun */}
      {activeTab === "akun" && (
        <MahasiswaAccountView onLogout={onLogout || (() => {})} />
      )}

      {/* Tab: Beranda & Riwayat — shared AnimatePresence */}
      {(activeTab === "beranda" || activeTab === "riwayat") && (
      <AnimatePresence mode="wait">
        {viewState === "browse" && activeTab === "beranda" && (
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingHero />
            
            {/* UMKM List Section */}
            <section id="umkm" className="py-14 md:py-20 bg-background">
              <div className="container mx-auto px-4">
                <motion.div 
                  className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">Daftar UMKM</h2>
                      <p className="text-muted-foreground">Temukan kuliner favorit dari UMKM kampus</p>
                    </div>
                  </div>

                  {/* Kantin Filter */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedKantin} onValueChange={setSelectedKantin}>
                      <SelectTrigger className="w-[200px] rounded-xl">
                        <SelectValue placeholder="Filter by Kantin" />
                      </SelectTrigger>
                      <SelectContent>
                        {kantinLocations.map((kantin) => (
                          <SelectItem key={kantin.id} value={kantin.id}>
                            {kantin.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  key={selectedKantin}
                >
                  {filteredUMKMs.map((umkm) => (
                    <motion.div key={umkm.id} variants={itemVariants}>
                      <UMKMCard 
                        umkm={umkm}
                        onClick={() => handleOpenUMKMDetail(umkm)}
                        isSelected={selectedUMKM === umkm.id}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {filteredUMKMs.length === 0 && (
                  <motion.div 
                    className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Store className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-foreground">Belum ada UMKM terdaftar</p>
                    <p className="text-muted-foreground">UMKM yang sudah disetujui akan muncul di sini</p>
                  </motion.div>
                )}
              </div>
            </section>

            {/* Menu Section */}
            <section id="menu" className="py-14 md:py-20 bg-linear-to-b from-secondary/50 to-background">
              <div className="container mx-auto px-4">
                <motion.div 
                  className="flex items-center gap-4 mb-8"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Menu Makanan</h2>
                    <p className="text-muted-foreground">Pilih menu favoritmu dari berbagai pilihan</p>
                  </div>
                </motion.div>

                {/* Search and Filter */}
                <motion.div 
                  className="flex flex-col gap-4 mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-lg">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Cari menu atau UMKM..."
                        className="pl-12 h-12 rounded-xl text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground mr-1">Kategori:</span>
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className="rounded-full"
                    >
                      Semua
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="rounded-full"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </motion.div>

                {selectedUMKM && (
                  <motion.div 
                    className="flex items-center gap-2 mb-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <span className="text-sm text-muted-foreground">Filter UMKM:</span>
                    <Badge variant="secondary" className="gap-1 py-1.5 px-3 rounded-full">
                      {approvedUMKMs.find((u) => u.id === selectedUMKM)?.name}
                      <button
                        onClick={() => setSelectedUMKM(null)}
                        className="ml-1 hover:text-destructive font-bold"
                      >
                        x
                      </button>
                    </Badge>
                  </motion.div>
                )}

                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  key={`${selectedCategory}-${selectedUMKM}-${searchQuery}-${selectedKantin}`}
                >
                  {filteredMenuItems.map((item) => (
                    <motion.div key={`${item.vendorId}-${item.id}`} variants={itemVariants}>
                      <MenuCard 
                        item={item} 
                        onOrderClick={() => handleOrderClick(item)} 
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {filteredMenuItems.length === 0 && (
                  <motion.div 
                    className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Utensils className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-foreground">Tidak ada menu yang ditemukan</p>
                    <p className="text-muted-foreground">Coba ubah filter atau kata kunci pencarian</p>
                  </motion.div>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {viewState === "order" && selectedItem && (
          <motion.div
            key="order"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-linear-to-b from-primary/5 to-background py-8"
          >
            <div className="container mx-auto px-4">
              <OrderForm 
                item={selectedItem}
                onBack={handleBackToMenu}
                onSuccess={handleOrderSuccess}
              />
            </div>
          </motion.div>
        )}

        {viewState === "success" && completedOrder && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-linear-to-b from-success/5 to-background py-8"
          >
            <div className="container mx-auto px-4">
              <OrderSuccess 
                order={completedOrder}
                onBackToMenu={handleBackToMenu}
              />
            </div>
          </motion.div>
        )}
        {viewState === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-linear-to-b from-secondary/50 to-background py-8"
          >
            <div className="container mx-auto px-4 max-w-4xl">
              <Button
                variant="ghost"
                onClick={() => setViewState("browse")}
                className="mb-6 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Button>

              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Riwayat Pesanan</h2>
                  <p className="text-muted-foreground">Lacak pesanan yang sedang diproses dan yang sudah selesai</p>
                </div>
              </div>

              <div className="space-y-4">
                {orders.filter(o => o.customerId === customerId).length === 0 ? (
                  <Card className="p-12 text-center border-dashed border-2">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Belum Ada Pesanan</h3>
                    <p className="text-muted-foreground mb-6">Anda belum membuat pesanan apapun.</p>
                    <Button onClick={() => setViewState("browse")}>Mulai Memesan</Button>
                  </Card>
                ) : (
                  orders.filter(o => o.customerId === customerId)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(order => (
                    <Card 
                      key={order.id} 
                      className="overflow-hidden border border-border/50 hover:shadow-md hover:border-primary/40 transition-all rounded-2xl bg-card cursor-pointer"
                      onClick={() => handleOpenHistoryDetail(order)}
                    >
                      <div className="flex flex-col md:flex-row gap-4 p-5">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-[10px] text-muted-foreground font-mono">#{order.id.slice(0, 16)}...</p>
                              <h3 className="text-lg font-bold text-foreground mt-0.5">{order.menuItem.name}</h3>
                              <p className="text-sm text-muted-foreground font-medium mt-0.5">
                                {order.menuItem.vendorName} &bull; {order.quantity} porsi
                              </p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1.5">
                              <Badge className={getStatusBadgeConfig(order.status).className}>
                                {getStatusBadgeConfig(order.status).text}
                              </Badge>
                              <p className="text-base font-black text-primary mt-1">
                                {formatPrice(order.totalPrice)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-muted/40 rounded-xl p-3.5 mt-4 text-xs font-semibold flex flex-wrap gap-4 text-muted-foreground border border-border/30">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-primary/75" />
                              <span>Pickup: {order.pickupTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-primary/75" />
                              <span className="truncate max-w-[200px]">{order.menuItem.vendorLocation || "Lokasi Kantin"}</span>
                            </div>
                          </div>

                          {/* Tombol Bayar jika masih pending */}
                          {order.status === "pending" && (
                            <div className="mt-4 flex justify-end pt-3 border-t border-border/40">
                              <Button
                                size="sm"
                                className="rounded-xl font-bold gap-1.5 shadow-md bg-warning text-warning-foreground hover:bg-warning/90 transition-all text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenPayModal(order)
                                }}
                              >
                                <QrCode className="h-3.5 w-3.5" />
                                Bayar Sekarang (QRIS)
                              </Button>
                            </div>
                          )}

                          {/* Feedback info jika ditolak */}
                          {order.status === "cancelled" && (
                            <div className="mt-4 flex items-center gap-2 p-3 bg-destructive/5 rounded-xl border border-destructive/10 text-destructive text-xs font-medium">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span>Pesanan ini ditolak oleh toko. Silakan periksa kembali bukti pembayaran Anda atau hubungi penjual.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      )}

      {/* Dialog Detail Riwayat Pesanan */}
      <Dialog open={isHistoryDetailOpen} onOpenChange={setIsHistoryDetailOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 border-2 border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <ClipboardList className="h-5 w-5 text-primary" />
              Detail Pesanan
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-semibold">
              Informasi lengkap transaksi dan status pesanan Anda.
            </DialogDescription>
          </DialogHeader>

          {selectedHistoryOrder && (
            <div className="space-y-4 pt-2">
              {/* Status Header */}
              <div className="flex justify-between items-center bg-muted/40 rounded-xl p-4 border border-border/30">
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono">No. Pesanan</p>
                  <p className="text-sm font-bold font-mono text-foreground">#{selectedHistoryOrder.id.slice(0, 18)}...</p>
                </div>
                <Badge className={getStatusBadgeConfig(selectedHistoryOrder.status).className}>
                  {getStatusBadgeConfig(selectedHistoryOrder.status).text}
                </Badge>
              </div>

              {/* Detail Menu */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Item Pesanan</h4>
                <div className="flex gap-4 p-3 bg-muted/10 rounded-xl border border-border/20">
                  <div className="w-16 h-16 relative rounded-lg border overflow-hidden bg-white shrink-0">
                    <Image 
                      src={selectedHistoryOrder.menuItem.image || "/food/placeholder.jpg"} 
                      alt={selectedHistoryOrder.menuItem.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-foreground truncate">{selectedHistoryOrder.menuItem.name}</h5>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {selectedHistoryOrder.menuItem.vendorName}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-1.5">
                      {selectedHistoryOrder.quantity} porsi x {formatPrice(selectedHistoryOrder.menuItem.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rincian Pembayaran */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rincian Pembayaran</h4>
                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between text-muted-foreground font-medium">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedHistoryOrder.menuItem.price * selectedHistoryOrder.quantity)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground font-medium">
                    <span>Biaya Layanan</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between text-foreground font-bold pt-1.5 border-t border-border/50 text-sm">
                    <span>Total Pembayaran</span>
                    <span className="text-primary font-black">{formatPrice(selectedHistoryOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Informasi Pengambilan */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Informasi Pengambilan</h4>
                <div className="bg-muted/30 rounded-xl p-3 border border-border/20 space-y-2 text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>Jam Pengambilan: <strong className="text-foreground">{selectedHistoryOrder.pickupTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">Lokasi Kantin: <strong className="text-foreground">{selectedHistoryOrder.menuItem.vendorLocation || "Kantin Fakultas Pertanian"}</strong></span>
                  </div>
                  {selectedHistoryOrder.notes && (
                    <div className="flex items-start gap-2 pt-1 border-t border-border/40">
                      <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Catatan: <strong className="text-foreground">{selectedHistoryOrder.notes}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bukti Pembayaran */}
              {selectedHistoryOrder.paymentProof && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bukti Pembayaran</h4>
                  <div className="relative rounded-xl border overflow-hidden aspect-video bg-muted/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedHistoryOrder.paymentProof.startsWith("data:") 
                        ? selectedHistoryOrder.paymentProof 
                        : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace("/api/v1", "") + selectedHistoryOrder.paymentProof
                      }
                      alt="Bukti Transfer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Aksi Bayar jika pending */}
              {selectedHistoryOrder.status === "pending" && (
                <Button
                  className="w-full h-10 font-bold gap-2 rounded-xl mt-2 bg-warning text-warning-foreground hover:bg-warning/90"
                  onClick={() => {
                    setIsHistoryDetailOpen(false)
                    handleOpenPayModal(selectedHistoryOrder)
                  }}
                >
                  <QrCode className="h-4 w-4" />
                  Bayar Sekarang (QRIS)
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog QRIS & Pembayaran dari Riwayat */}
      <Dialog open={isPayModalOpen} onOpenChange={handleClosePayModal}>
        <DialogContent className="max-w-md rounded-2xl p-6 border-2 border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <QrCode className="h-5 w-5 text-primary" />
              Selesaikan Pembayaran
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-semibold">
              Scan QRIS di bawah dan unggah bukti transfer untuk memproses pesanan Anda.
            </DialogDescription>
          </DialogHeader>

          {payingOrder && (
            <div className="space-y-5 pt-2">
              {/* QRIS Card */}
              <div className="bg-gradient-to-b from-card to-secondary/30 rounded-2xl p-4 border border-border shadow-md flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-blue-500 to-amber-500" />
                <div className="w-full flex justify-between items-center mb-3">
                  <span className="font-extrabold text-sm tracking-widest text-foreground">QRIS</span>
                  <span className="text-[9px] font-mono text-muted-foreground font-bold">NMID: ID1020304050607</span>
                </div>
                <div className="text-center mb-3">
                  <h4 className="font-extrabold text-foreground text-sm uppercase">{payingOrder.menuItem.vendorName}</h4>
                </div>
                
                {/* QR Code SVG */}
                <div className="bg-white p-3 rounded-xl border border-muted w-36 h-36 flex items-center justify-center relative">
                  <svg className="w-32 h-32 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    <rect width="100" height="100" fill="white" />
                    <path d="M5,5 h25 v25 h-25 z M12,12 h11 v11 h-11 z" />
                    <path d="M70,5 h25 v25 h-25 z M77,12 h11 v11 h-11 z" />
                    <path d="M5,70 h25 v25 h-25 z M12,77 h11 v11 h-11 z" />
                    <path d="M80,80 h15 v15 h-15 z" />
                    <path d="M35,5 h10 v5 h-10 z M50,5 h15 v5 h-15 z M40,15 h15 v10 h-15 z" />
                    <path d="M5,35 h15 v5 h-15 z M25,35 h5 v10 h-5 z M15,45 h15 v5 h-15 z" />
                    <rect x="42" y="42" width="16" height="16" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="50" r="5" fill="#f97316" />
                  </svg>
                  <div className="absolute inset-0 m-auto w-8 h-8 bg-primary rounded-lg border-2 border-white flex items-center justify-center shadow-md">
                    <QrCode className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <div className="text-center mt-3">
                  <p className="text-[10px] text-muted-foreground font-semibold">Total Tagihan</p>
                  <p className="text-xl font-black text-primary mt-0.5">{formatPrice(payingOrder.totalPrice)}</p>
                </div>
              </div>

              {/* Upload Section */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground">Unggah Bukti Pembayaran</label>
                {!payFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border hover:border-primary rounded-xl cursor-pointer bg-muted/10 hover:bg-primary/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-3 pb-4 text-center px-4">
                      <Upload className="h-5 w-5 text-primary mb-1" />
                      <p className="text-xs font-bold text-foreground">Pilih file bukti transfer</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Format gambar (Maks. 5MB)</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePayFileChange} />
                  </label>
                ) : (
                  <div className="relative rounded-xl border border-border p-2.5 flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 relative rounded-lg border overflow-hidden bg-white shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {payPreview && <img src={payPreview} alt="Preview" className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[150px]">{payFile.name}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">{(payFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-lg text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setPayFile(null)
                        if (payPreview) URL.revokeObjectURL(payPreview)
                        setPayPreview(null)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                className="w-full h-11 font-bold gap-2 rounded-xl text-sm"
                disabled={isUploadingPay || !payFile}
                onClick={handleUploadPayProofSubmit}
              >
                {isUploadingPay ? (
                  <><Spinner className="h-4 w-4" />Mengunggah...</>
                ) : (
                  <><Check className="h-4 w-4" />Kirim Bukti Pembayaran</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation — always visible */}
      <MahasiswaBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab === "beranda") {
            setViewState("browse")
          } else if (tab === "riwayat") {
            setViewState("history")
          }
        }}
      />
    </div>
  )
}

interface MenuCardProps {
  item: ExtendedMenuItem
  onOrderClick: () => void
}

function MenuCard({ item, onOrderClick }: MenuCardProps) {
  const isOutOfStock = item.stock === 0
  const isLowStock = item.stock > 0 && item.stock <= 5

  return (
    <Card className={`group overflow-hidden transition-all duration-300 rounded-2xl border-0 shadow-md hover:shadow-xl ${isOutOfStock ? "opacity-60" : "hover:-translate-y-1"}`}>
      {/* Image Area */}
      <div className="aspect-4/3 bg-muted relative overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        
        {/* Pre-Order Badge */}
        {item.isAvailable && !isOutOfStock && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold shadow-lg">
              Pre-Order
            </Badge>
          </div>
        )}
        
        {/* Stock Indicators */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive" className="text-sm gap-1.5 py-1.5 px-4 rounded-full">
              <AlertCircle className="h-4 w-4" />
              Stok Habis
            </Badge>
          </div>
        )}
        {!isOutOfStock && isLowStock && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-warning text-warning-foreground border-0 rounded-full text-xs shadow-md">
              <Clock className="h-3 w-3 mr-1" />
              Sisa {item.stock}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Content Area */}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground line-clamp-1 text-base group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
              <Store className="h-3 w-3 shrink-0" />
              <span className="text-xs truncate">{item.vendorName}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0 rounded-full border-primary/30 text-primary bg-primary/5">
            {item.category}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-10">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-lg font-bold text-primary">
            {formatPrice(item.price)}
          </span>
          <Button 
            size="sm" 
            disabled={isOutOfStock}
            className="gap-1.5 rounded-xl shadow-md hover:shadow-lg transition-all"
            onClick={onOrderClick}
          >
            <ShoppingCart className="h-4 w-4" />
            Pesan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
