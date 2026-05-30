"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { 
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  Store,
  AlertTriangle,
  Search,
  MapPin,
  Calendar,
  User,
  FileText,
  ArrowRight,
  Utensils,
  Ban,
  RefreshCcw,
  MoreVertical,
  Power,
  PowerOff,
  Star,
  Ticket,
  Plus,
  Trash2,
  Edit,
  Gift,
  Percent
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPrice } from "@/lib/mock-data"
import type { UMKM } from "@/lib/mock-data"
import { useData, type Promo } from "@/lib/data-context"
import { toast } from "sonner"
import { AdminUMKMDetailModal } from "@/components/admin-umkm-detail-modal"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const }
  }
}

type ViewTab = "pending" | "verified" | "suspended"

export function AdminView() {
  const { 
    approvedUMKMs, 
    pendingUMKMs, 
    suspendedUMKMs, 
    activeUsersCount, 
    approveUMKM, 
    rejectUMKM, 
    suspendUMKM, 
    reactivateUMKM,
    promos,
    addPromo,
    updatePromo,
    deletePromo
  } = useData()
  const [selectedUMKM, setSelectedUMKM] = useState<UMKM | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<ViewTab>("pending")

  // Tab switch state
  const [mainTab, setMainTab] = useState<"umkm" | "promo">("umkm")

  // Promo Management State
  const [promoSearchQuery, setPromoSearchQuery] = useState("")
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null)
  
  // Promo Form Fields State
  const [promoTitle, setPromoTitle] = useState("")
  const [promoDescription, setPromoDescription] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [promoDiscountType, setPromoDiscountType] = useState<"percent" | "fixed">("percent")
  const [promoDiscountValue, setPromoDiscountValue] = useState("")
  const [promoMinOrder, setPromoMinOrder] = useState("0")
  const [promoMaxDiscount, setPromoMaxDiscount] = useState("")
  const [promoUmkmId, setPromoUmkmId] = useState("") // empty = global
  const [promoValidFrom, setPromoValidFrom] = useState(new Date().toISOString().substring(0, 10))
  const [promoValidUntil, setPromoValidUntil] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10))
  const [promoIsActive, setPromoIsActive] = useState(true)

  // Promo deletion state
  const [deletePromoDialogOpen, setDeletePromoDialogOpen] = useState(false)
  const [promoToDelete, setPromoToDelete] = useState<Promo | null>(null)

  // Promo Handlers
  const openNewPromoModal = () => {
    setEditingPromo(null)
    setPromoTitle("")
    setPromoDescription("")
    setPromoCode("")
    setPromoDiscountType("percent")
    setPromoDiscountValue("")
    setPromoMinOrder("0")
    setPromoMaxDiscount("")
    setPromoUmkmId("")
    setPromoValidFrom(new Date().toISOString().substring(0, 10))
    setPromoValidUntil(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10))
    setPromoIsActive(true)
    setIsPromoModalOpen(true)
  }

  const openEditPromoModal = (promo: Promo) => {
    setEditingPromo(promo)
    setPromoTitle(promo.title)
    setPromoDescription(promo.description || "")
    setPromoCode(promo.code)
    setPromoDiscountType(promo.discount_type)
    setPromoDiscountValue(promo.discount_value.toString())
    setPromoMinOrder(promo.min_order.toString())
    setPromoMaxDiscount(promo.max_discount ? promo.max_discount.toString() : "")
    setPromoUmkmId(promo.umkm_id || "")
    setPromoValidFrom(new Date(promo.valid_from).toISOString().substring(0, 10))
    setPromoValidUntil(new Date(promo.valid_until).toISOString().substring(0, 10))
    setPromoIsActive(promo.is_active)
    setIsPromoModalOpen(true)
  }

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim() || !promoTitle.trim() || !promoDiscountValue) {
      toast.error("Harap isi kode promo, judul, dan nilai potongan")
      return
    }

    setIsProcessing(true)
    try {
      const payload = {
        title: promoTitle,
        description: promoDescription || null,
        code: promoCode.toUpperCase().replace(/\s+/g, ""),
        discount_type: promoDiscountType,
        discount_value: parseFloat(promoDiscountValue),
        min_order: parseFloat(promoMinOrder) || 0,
        max_discount: promoMaxDiscount ? parseFloat(promoMaxDiscount) : null,
        umkm_id: promoUmkmId === "" ? null : promoUmkmId,
        image_url: editingPromo ? editingPromo.image_url : null,
        valid_from: new Date(promoValidFrom).toISOString(),
        valid_until: new Date(promoValidUntil + "T23:59:59").toISOString(),
        is_active: promoIsActive,
      }

      if (editingPromo) {
        await updatePromo(editingPromo.id, payload)
        toast.success("Promo Berhasil Diperbarui")
      } else {
        await addPromo(payload)
        toast.success("Promo Baru Berhasil Dibuat")
      }
      setIsPromoModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan promo")
    } finally {
      setIsProcessing(false)
    }
  }

  const confirmDeletePromo = (promo: Promo) => {
    setPromoToDelete(promo)
    setDeletePromoDialogOpen(true)
  }

  const handleDeletePromo = async () => {
    if (!promoToDelete) return
    setIsProcessing(true)
    try {
      await deletePromo(promoToDelete.id)
      toast.success(`Promo "${promoToDelete.code}" berhasil dihapus`)
      setDeletePromoDialogOpen(false)
      setPromoToDelete(null)
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus promo")
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Detail Modal State
  const [detailUMKM, setDetailUMKM] = useState<UMKM | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  // Rejection Modal State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingUMKM, setRejectingUMKM] = useState<UMKM | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectionError, setRejectionError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Approval Confirmation Dialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [approvingUMKM, setApprovingUMKM] = useState<UMKM | null>(null)

  // Suspension Dialog State
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [suspendingUMKM, setSuspendingUMKM] = useState<UMKM | null>(null)
  const [suspensionReason, setSuspensionReason] = useState("")
  const [suspensionError, setSuspensionError] = useState("")

  // Reactivation Dialog State
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false)
  const [reactivatingUMKM, setReactivatingUMKM] = useState<UMKM | null>(null)

  const approvedCount = approvedUMKMs.length
  const pendingCount = pendingUMKMs.length
  const suspendedCount = suspendedUMKMs.length

  const openDetailModal = (umkm: UMKM) => {
    setDetailUMKM(umkm)
    setIsDetailModalOpen(true)
  }

  const handleApproveFromModal = (umkm: UMKM) => {
    setIsDetailModalOpen(false)
    setDetailUMKM(null)
    setApprovingUMKM(umkm)
    setApproveDialogOpen(true)
  }

  const handleRejectFromModal = (umkm: UMKM, reason: string) => {
    setIsDetailModalOpen(false)
    setDetailUMKM(null)
    setRejectingUMKM(umkm)
    setRejectionReason(reason)
    
    // Directly process rejection
    setIsProcessing(true)
    setTimeout(() => {
      rejectUMKM(umkm.id)
      setIsProcessing(false)
      toast.success("Pendaftaran UMKM Ditolak", {
        description: `"${umkm.name}" telah ditolak. Notifikasi akan dikirim ke pemilik.`,
      })
    }, 1000)
  }

  const openApproveDialog = (umkm: UMKM) => {
    setApprovingUMKM(umkm)
    setApproveDialogOpen(true)
  }

  const handleApprove = async () => {
    if (!approvingUMKM) return

    setIsProcessing(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    approveUMKM(approvingUMKM.id)
    
    setIsProcessing(false)
    setApproveDialogOpen(false)
    setSelectedUMKM(null)
    setApprovingUMKM(null)

    toast.success("UMKM Berhasil Disetujui!", {
      description: `"${approvingUMKM.name}" sekarang berstatus Aktif dan dapat mulai berjualan.`,
    })
  }

  const openRejectDialog = (umkm: UMKM) => {
    setRejectingUMKM(umkm)
    setRejectionReason("")
    setRejectionError("")
    setRejectDialogOpen(true)
  }

  const handleReject = async () => {
    // Validate rejection reason
    if (!rejectionReason.trim()) {
      setRejectionError("Alasan penolakan wajib diisi")
      toast.warning("Alasan penolakan belum diisi", {
        description: "Silakan berikan alasan untuk menolak pendaftaran UMKM ini.",
        icon: <AlertTriangle className="h-4 w-4" />,
      })
      return
    }

    if (rejectionReason.trim().length < 10) {
      setRejectionError("Alasan penolakan minimal 10 karakter")
      return
    }

    if (!rejectingUMKM) return

    setIsProcessing(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    rejectUMKM(rejectingUMKM.id)
    
    setIsProcessing(false)
    setRejectDialogOpen(false)
    setSelectedUMKM(null)
    setRejectingUMKM(null)
    setRejectionReason("")

    toast.success("Pendaftaran UMKM Ditolak", {
      description: `"${rejectingUMKM.name}" telah ditolak. Notifikasi akan dikirim ke pemilik.`,
    })
  }

  const filteredPending = pendingUMKMs.filter(umkm =>
    umkm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    umkm.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredApproved = approvedUMKMs.filter(umkm =>
    umkm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    umkm.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSuspended = suspendedUMKMs.filter(umkm =>
    umkm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    umkm.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openSuspendDialog = (umkm: UMKM) => {
    setSuspendingUMKM(umkm)
    setSuspensionReason("")
    setSuspensionError("")
    setSuspendDialogOpen(true)
  }

  const handleSuspend = async () => {
    if (!suspensionReason.trim()) {
      setSuspensionError("Alasan penangguhan wajib diisi")
      toast.warning("Alasan penangguhan belum diisi", {
        description: "Silakan berikan alasan untuk menangguhkan UMKM ini.",
        icon: <AlertTriangle className="h-4 w-4" />,
      })
      return
    }

    if (suspensionReason.trim().length < 10) {
      setSuspensionError("Alasan penangguhan minimal 10 karakter")
      return
    }

    if (!suspendingUMKM) return

    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    suspendUMKM(suspendingUMKM.id, suspensionReason)
    
    setIsProcessing(false)
    setSuspendDialogOpen(false)
    setSuspendingUMKM(null)
    setSuspensionReason("")

    toast.success("UMKM Ditangguhkan", {
      description: `"${suspendingUMKM.name}" telah ditangguhkan. UMKM tidak akan muncul di halaman mahasiswa.`,
    })
  }

  const openReactivateDialog = (umkm: UMKM) => {
    setReactivatingUMKM(umkm)
    setReactivateDialogOpen(true)
  }

  const handleReactivate = async () => {
    if (!reactivatingUMKM) return

    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    reactivateUMKM(reactivatingUMKM.id)
    
    setIsProcessing(false)
    setReactivateDialogOpen(false)
    setReactivatingUMKM(null)

    toast.success("UMKM Diaktifkan Kembali", {
      description: `"${reactivatingUMKM.name}" telah diaktifkan kembali dan dapat berjualan.`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/3 to-background">
      <AdminUMKMDetailModal
        umkm={detailUMKM}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onApprove={handleApproveFromModal}
        onReject={handleRejectFromModal}
        isProcessing={isProcessing}
      />
      
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            className="flex items-center gap-5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/20">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                {mainTab === "umkm" ? "Kelola persetujuan dan verifikasi UMKM" : "Manajemen promo diskon dan potongan harga platform"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-muted/60 p-1 rounded-2xl border border-border/50 flex gap-1 w-full max-w-md shadow-inner">
            <button
              onClick={() => setMainTab("umkm")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mainTab === "umkm"
                  ? "bg-background text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="h-4 w-4" />
              Kelola UMKM
            </button>
            <button
              onClick={() => setMainTab("promo")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mainTab === "promo"
                  ? "bg-background text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Ticket className="h-4 w-4" />
              Kelola Promo
            </button>
          </div>
        </div>

        {mainTab === "umkm" ? (
          <>
            {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-primary/5 overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Total UMKM</p>
                    <p className="text-3xl font-bold text-foreground">{approvedCount + pendingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-success/5 overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Terverifikasi</p>
                    <p className="text-3xl font-bold text-foreground">{approvedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-warning/5 overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-warning/15 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Menunggu</p>
                    <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-accent/5 overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Pengguna Aktif</p>
                    <p className="text-3xl font-bold text-foreground">{activeUsersCount.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Pending Approvals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-2xl border-0 shadow-xl mb-10" id="antrian">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-warning/15 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Antrian Persetujuan UMKM</CardTitle>
                    <CardDescription>Verifikasi pendaftaran UMKM baru</CardDescription>
                  </div>
                </div>
                {pendingCount > 0 && (
                  <Badge className="bg-warning/15 text-warning border-warning/30 py-1.5 px-4 rounded-full">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    {pendingCount} menunggu verifikasi
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Cari UMKM atau pemilik..."
                  className="pl-12 h-12 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {filteredPending.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredPending.map((umkm) => (
                    <motion.div key={umkm.id} variants={itemVariants}>
                      <Card className="group rounded-2xl border border-warning/30 bg-gradient-to-br from-warning/5 to-transparent hover:shadow-lg hover:border-warning/50 transition-all overflow-hidden">
                        <CardContent className="p-5">
                          {/* Header */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Store className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-foreground truncate">{umkm.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">{umkm.owner}</p>
                              <Badge variant="outline" className="mt-2 bg-warning/10 text-warning border-warning/30 text-xs rounded-full">
                                <Clock className="h-3 w-3 mr-1" />
                                Menunggu Verifikasi
                              </Badge>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">{umkm.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 shrink-0" />
                              <span>
                                {new Date(umkm.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Utensils className="h-4 w-4 shrink-0" />
                              <span>{umkm.menu.length} menu terdaftar</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 rounded-xl gap-1"
                              onClick={() => openDetailModal(umkm)}
                            >
                              <Eye className="h-4 w-4" />
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 rounded-xl gap-1 bg-success hover:bg-success/90 text-success-foreground"
                              onClick={() => openApproveDialog(umkm)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Setujui
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => openRejectDialog(umkm)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-16 border-2 border-dashed border-success/30 rounded-2xl bg-success/5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">Semua sudah diproses!</p>
                  <p className="text-muted-foreground">Tidak ada UMKM yang menunggu persetujuan</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* UMKM Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="rounded-2xl border-0 shadow-xl" id="umkm-list">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Kelola UMKM</CardTitle>
                    <CardDescription>Kelola status dan aktivitas UMKM</CardDescription>
                  </div>
                </div>

                {/* Tabs for filtering */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ViewTab)} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full max-w-md">
                    <TabsTrigger value="verified" className="gap-1.5">
                      <Power className="h-4 w-4" />
                      Aktif
                      <Badge className="ml-1 bg-success/20 text-success h-5 min-w-5 p-1 flex items-center justify-center rounded-full text-xs">
                        {approvedCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="suspended" className="gap-1.5">
                      <PowerOff className="h-4 w-4" />
                      Ditangguhkan
                      {suspendedCount > 0 && (
                        <Badge className="ml-1 bg-destructive/20 text-destructive h-5 min-w-5 p-1 flex items-center justify-center rounded-full text-xs">
                          {suspendedCount}
                        </Badge>
                      )}
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
                  placeholder="Cari UMKM atau pemilik..."
                  className="pl-12 h-12 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Active UMKM Tab */}
              {activeTab === "verified" && (
                <>
                  {filteredApproved.length > 0 ? (
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {filteredApproved.map((umkm) => (
                        <motion.div key={umkm.id} variants={itemVariants}>
                          <Card className="group rounded-2xl border border-success/20 bg-gradient-to-br from-success/5 to-transparent hover:shadow-lg hover:border-success/40 transition-all overflow-hidden">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                  <Store className="h-7 w-7 text-success" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <h3 className="font-bold text-foreground truncate">{umkm.name}</h3>
                                      <p className="text-sm text-muted-foreground truncate">{umkm.owner}</p>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="rounded-xl">
                                        <DropdownMenuItem onClick={() => openDetailModal(umkm)} className="gap-2">
                                          <Eye className="h-4 w-4" />
                                          Lihat Detail
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => openSuspendDialog(umkm)} 
                                          className="gap-2 text-destructive focus:text-destructive"
                                        >
                                          <Ban className="h-4 w-4" />
                                          Tangguhkan UMKM
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-success/15 text-success border-success/30 text-xs rounded-full">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Aktif
                                    </Badge>
                                    <Badge variant="outline" className="text-xs rounded-full">
                                      {umkm.menu.length} menu
                                    </Badge>
                                    {umkm.rating > 0 && (
                                      <Badge variant="outline" className="text-xs rounded-full gap-1">
                                        <Star className="h-3 w-3 fill-warning text-warning" />
                                        {umkm.rating}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{umkm.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4 shrink-0" />
                                  <span>Bergabung {new Date(umkm.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 rounded-xl"
                                  onClick={() => openDetailModal(umkm)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Detail
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() => openSuspendDialog(umkm)}
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Tangguhkan
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
                      <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-semibold text-foreground">Belum Ada UMKM Aktif</p>
                      <p className="text-muted-foreground">UMKM yang disetujui akan muncul di sini</p>
                    </div>
                  )}
                </>
              )}

              {/* Suspended UMKM Tab */}
              {activeTab === "suspended" && (
                <>
                  {filteredSuspended.length > 0 ? (
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {filteredSuspended.map((umkm) => (
                        <motion.div key={umkm.id} variants={itemVariants}>
                          <Card className="group rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent hover:shadow-lg hover:border-destructive/40 transition-all overflow-hidden">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                  <Store className="h-7 w-7 text-destructive" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <h3 className="font-bold text-foreground truncate">{umkm.name}</h3>
                                      <p className="text-sm text-muted-foreground truncate">{umkm.owner}</p>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="rounded-xl">
                                        <DropdownMenuItem onClick={() => openDetailModal(umkm)} className="gap-2">
                                          <Eye className="h-4 w-4" />
                                          Lihat Detail
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => openReactivateDialog(umkm)} 
                                          className="gap-2 text-success focus:text-success"
                                        >
                                          <RefreshCcw className="h-4 w-4" />
                                          Aktifkan Kembali
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs rounded-full">
                                      <Ban className="h-3 w-3 mr-1" />
                                      Ditangguhkan
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Suspension Reason */}
                              {umkm.suspensionReason && (
                                <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                                  <p className="text-xs text-muted-foreground mb-1">Alasan penangguhan:</p>
                                  <p className="text-sm text-foreground">{umkm.suspensionReason}</p>
                                  {umkm.suspendedAt && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Ditangguhkan pada {new Date(umkm.suspendedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                  )}
                                </div>
                              )}

                              <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{umkm.location}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 rounded-xl"
                                  onClick={() => openDetailModal(umkm)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Detail
                                </Button>
                                <Button
                                  size="sm"
                                  className="rounded-xl bg-success hover:bg-success/90 text-success-foreground"
                                  onClick={() => openReactivateDialog(umkm)}
                                >
                                  <RefreshCcw className="h-4 w-4 mr-1" />
                                  Aktifkan
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-success/30 rounded-2xl bg-success/5">
                      <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-8 w-8 text-success" />
                      </div>
                      <p className="text-lg font-semibold text-foreground">Tidak Ada UMKM Ditangguhkan</p>
                      <p className="text-muted-foreground">Semua UMKM berstatus aktif</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header / Search & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-5 rounded-2xl border border-border/50 shadow-md">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Daftar Promo & Diskon
                </h2>
                <p className="text-sm text-muted-foreground">Kelola promo potongan harga dan syarat ketentuannya.</p>
              </div>
              <Button onClick={openNewPromoModal} className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 gap-1.5 h-11 px-5 shadow-lg shadow-primary/20 shrink-0">
                <Plus className="h-4 w-4" />
                Buat Promo Baru
              </Button>
            </div>

            {/* Filter / Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan kode, judul, atau deskripsi..."
                className="pl-12 h-12 rounded-xl"
                value={promoSearchQuery}
                onChange={(e) => setPromoSearchQuery(e.target.value)}
              />
            </div>

            {/* Promos Grid */}
            {promos.filter(p => 
              p.code.toLowerCase().includes(promoSearchQuery.toLowerCase()) ||
              p.title.toLowerCase().includes(promoSearchQuery.toLowerCase()) ||
              (p.description || "").toLowerCase().includes(promoSearchQuery.toLowerCase())
            ).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promos.filter(p => 
                  p.code.toLowerCase().includes(promoSearchQuery.toLowerCase()) ||
                  p.title.toLowerCase().includes(promoSearchQuery.toLowerCase()) ||
                  (p.description || "").toLowerCase().includes(promoSearchQuery.toLowerCase())
                ).map((promo) => {
                  const targetUMKM = approvedUMKMs.find(u => u.id === promo.umkm_id)
                  const isPercent = promo.discount_type === "percent"
                  
                  return (
                    <Card key={promo.id} className={`group rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 ${!promo.is_active ? 'opacity-75 border-muted bg-muted/20' : 'border-border'}`}>
                      <CardContent className="p-0">
                        {/* Header Banner */}
                        <div className={`p-5 text-white bg-gradient-to-br ${
                          !promo.is_active 
                            ? 'from-muted-foreground/60 to-muted-foreground/45' 
                            : new Date(promo.valid_until) < new Date() 
                              ? 'from-red-500/80 to-rose-600/70' 
                              : 'from-primary/95 to-indigo-600/85'
                        } relative overflow-hidden`}>
                          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                          <div className="flex justify-between items-start mb-2">
                            <Badge className="bg-white/20 hover:bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                              {promo.umkm_id ? `Khusus: ${targetUMKM?.name || 'Toko'}` : 'Berlaku di Semua Toko'}
                            </Badge>
                            <Badge className={`border-0 text-xs text-white ${
                              !promo.is_active 
                                ? 'bg-zinc-500/70' 
                                : new Date(promo.valid_until) < new Date() 
                                  ? 'bg-red-500/90' 
                                  : 'bg-emerald-500/90'
                            }`}>
                              {!promo.is_active 
                                ? 'Non-aktif' 
                                : new Date(promo.valid_until) < new Date() 
                                  ? 'Kedaluwarsa' 
                                  : 'Aktif'}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-lg truncate drop-shadow-sm">{promo.title}</h3>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-extrabold tracking-tight">
                              {isPercent ? `${promo.discount_value}%` : formatPrice(promo.discount_value)}
                            </span>
                            <span className="text-xs text-white/80 font-medium">potongan</span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-5 space-y-4">
                          <div className="bg-muted/50 border border-dashed border-border rounded-xl px-4 py-2.5 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">KODE PROMO</span>
                            <code className="text-sm font-mono font-bold text-primary tracking-wider">{promo.code}</code>
                          </div>

                          <div className="space-y-2 text-sm">
                            {promo.description && (
                              <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                                {promo.description}
                              </p>
                            )}
                            <div className="flex justify-between py-1 border-b border-border/40 text-xs">
                              <span className="text-muted-foreground">Minimal Pembelian</span>
                              <span className="font-semibold text-foreground">{formatPrice(promo.min_order)}</span>
                            </div>
                            {isPercent && promo.max_discount && (
                              <div className="flex justify-between py-1 border-b border-border/40 text-xs">
                                <span className="text-muted-foreground">Maksimal Diskon</span>
                                <span className="font-semibold text-foreground">{formatPrice(promo.max_discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between py-1 text-xs">
                              <span className="text-muted-foreground">Masa Berlaku</span>
                              <span className="font-medium text-foreground">
                                {new Date(promo.valid_from).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(promo.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2 border-t border-border/50">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openEditPromoModal(promo)}
                              className="flex-1 rounded-xl gap-1 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => confirmDeletePromo(promo)}
                              className="rounded-xl text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card">
                <Ticket className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground">Tidak Ada Promo</p>
                <p className="text-muted-foreground">Belum ada promo yang terdaftar atau cocok dengan pencarian Anda.</p>
                <Button onClick={openNewPromoModal} className="mt-4 rounded-xl">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Buat Promo Pertama
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* UMKM Detail Dialog */}
      <Dialog open={!!selectedUMKM} onOpenChange={() => setSelectedUMKM(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
              Detail Pendaftaran UMKM
            </DialogTitle>
            <DialogDescription>
              Review informasi lengkap pendaftaran UMKM
            </DialogDescription>
          </DialogHeader>
          
          {selectedUMKM && (
            <div className="space-y-6">
              {/* UMKM Info Card */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-lg">
                    <Store className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{selectedUMKM.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedUMKM.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 rounded-full">
                    <Clock className="h-3 w-3 mr-1" />
                    Menunggu
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pemilik</p>
                    <p className="font-semibold text-foreground">{selectedUMKM.owner}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lokasi</p>
                    <p className="font-semibold text-foreground">{selectedUMKM.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Daftar</p>
                    <p className="font-semibold text-foreground">
                      {new Date(selectedUMKM.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Jumlah Menu</p>
                    <p className="font-semibold text-foreground">{selectedUMKM.menu.length} item</p>
                  </div>
                </div>
              </div>

              {/* Menu List */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Daftar Menu
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedUMKM.menu.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center">
                          <span className="text-lg">
                            {item.category === "Minuman" ? "🥤" : item.category === "Makanan Ringan" ? "🍪" : "🍽️"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary text-sm">{formatPrice(item.price)}</p>
                        <p className="text-xs text-muted-foreground">Stok: {item.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Change Preview */}
              <div className="bg-success/10 border border-success/30 rounded-xl p-4">
                <p className="text-sm text-foreground flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-success" />
                  <span className="font-medium">Jika disetujui:</span>
                  <span>Status akan berubah menjadi</span>
                  <Badge className="bg-success text-success-foreground">Aktif</Badge>
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedUMKM(null)} className="rounded-xl">
              Tutup
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedUMKM) {
                  openRejectDialog(selectedUMKM)
                  setSelectedUMKM(null)
                }
              }}
              className="rounded-xl"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Tolak
            </Button>
            <Button 
              onClick={() => {
                if (selectedUMKM) {
                  openApproveDialog(selectedUMKM)
                  setSelectedUMKM(null)
                }
              }}
              className="rounded-xl bg-success hover:bg-success/90 text-success-foreground"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              Setujui UMKM
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui pendaftaran UMKM "{approvingUMKM?.name}"?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-success/10 border border-success/30 rounded-xl p-4 my-4">
            <p className="text-sm text-foreground flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-success" />
              <span>Status akan berubah menjadi:</span>
              <Badge className="bg-success text-success-foreground">Aktif</Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              UMKM akan dapat mulai berjualan dan menu mereka akan tampil di halaman mahasiswa.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={isProcessing} className="rounded-xl">
              Batal
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing} className="rounded-xl bg-success hover:bg-success/90 text-success-foreground">
              {isProcessing ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Ya, Setujui
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-destructive/15 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              Tolak Pendaftaran UMKM
            </DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk &quot;{rejectingUMKM?.name}&quot;
            </DialogDescription>
          </DialogHeader>

          <Field data-invalid={!!rejectionError}>
            <FieldLabel htmlFor="rejection-reason">Alasan Penolakan</FieldLabel>
            <Textarea
              id="rejection-reason"
              placeholder="Jelaskan alasan penolakan pendaftaran UMKM ini (minimal 10 karakter)..."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value)
                if (rejectionError) setRejectionError("")
              }}
              className={`rounded-xl min-h-[100px] ${rejectionError ? "border-destructive" : ""}`}
            />
            {rejectionError && (
              <FieldError>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {rejectionError}
                </span>
              </FieldError>
            )}
          </Field>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={isProcessing} className="rounded-xl">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing} className="rounded-xl">
              {isProcessing ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Memproses...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Tolak Pendaftaran
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspension Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-destructive/15 flex items-center justify-center">
                <Ban className="h-6 w-6 text-destructive" />
              </div>
              Tangguhkan UMKM
            </DialogTitle>
            <DialogDescription>
              Berikan alasan penangguhan untuk &quot;{suspendingUMKM?.name}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 my-2">
            <p className="text-sm text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-medium">Perhatian:</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              UMKM yang ditangguhkan tidak akan tampil di halaman mahasiswa dan tidak dapat menerima pesanan baru.
            </p>
          </div>

          <Field data-invalid={!!suspensionError}>
            <FieldLabel htmlFor="suspension-reason">Alasan Penangguhan</FieldLabel>
            <Textarea
              id="suspension-reason"
              placeholder="Jelaskan alasan penangguhan UMKM ini (minimal 10 karakter)..."
              value={suspensionReason}
              onChange={(e) => {
                setSuspensionReason(e.target.value)
                if (suspensionError) setSuspensionError("")
              }}
              className={`rounded-xl min-h-[100px] ${suspensionError ? "border-destructive" : ""}`}
            />
            {suspensionError && (
              <FieldError>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {suspensionError}
                </span>
              </FieldError>
            )}
          </Field>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)} disabled={isProcessing} className="rounded-xl">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={isProcessing} className="rounded-xl">
              {isProcessing ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Memproses...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Tangguhkan UMKM
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivation Dialog */}
      <Dialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center">
                <RefreshCcw className="h-6 w-6 text-success" />
              </div>
              Aktifkan Kembali UMKM
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengaktifkan kembali &quot;{reactivatingUMKM?.name}&quot;?
            </DialogDescription>
          </DialogHeader>

          {reactivatingUMKM?.suspensionReason && (
            <div className="bg-muted/50 border border-border rounded-xl p-4 my-2">
              <p className="text-xs text-muted-foreground mb-1">Alasan penangguhan sebelumnya:</p>
              <p className="text-sm text-foreground">{reactivatingUMKM.suspensionReason}</p>
            </div>
          )}

          <div className="bg-success/10 border border-success/30 rounded-xl p-4 my-2">
            <p className="text-sm text-foreground flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-success" />
              <span>Status akan berubah menjadi:</span>
              <Badge className="bg-success text-success-foreground">Aktif</Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              UMKM akan kembali tampil di halaman mahasiswa dan dapat menerima pesanan.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReactivateDialogOpen(false)} disabled={isProcessing} className="rounded-xl">
              Batal
            </Button>
            <Button onClick={handleReactivate} disabled={isProcessing} className="rounded-xl bg-success hover:bg-success/90 text-success-foreground">
              {isProcessing ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Memproses...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Ya, Aktifkan Kembali
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promo Form Dialog (Create / Edit) */}
      <Dialog open={isPromoModalOpen} onOpenChange={setIsPromoModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              {editingPromo ? "Edit Promo" : "Buat Promo Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi formulir di bawah ini untuk {editingPromo ? "memperbarui" : "menambahkan"} promo diskon.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePromo} className="space-y-5 my-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="promo-code">Kode Promo *</FieldLabel>
                <Input
                  id="promo-code"
                  placeholder="CONTOH: KAMPUSHEMAT"
                  required
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  className="rounded-xl uppercase font-mono font-bold tracking-wider"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="promo-title">Judul Promo *</FieldLabel>
                <Input
                  id="promo-title"
                  placeholder="e.g. Diskon Khusus Maba"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  className="rounded-xl"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="promo-desc">Deskripsi & Ketentuan</FieldLabel>
              <Textarea
                id="promo-desc"
                placeholder="Jelaskan detail syarat & ketentuan promo di sini..."
                value={promoDescription}
                onChange={(e) => setPromoDescription(e.target.value)}
                className="rounded-xl min-h-[80px]"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="discount-type">Tipe Potongan</FieldLabel>
                <select
                  id="discount-type"
                  value={promoDiscountType}
                  onChange={(e) => setPromoDiscountType(e.target.value as "percent" | "fixed")}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring animate-none"
                >
                  <option value="percent">Persentase (%)</option>
                  <option value="fixed">Nominal Rupiah (Rp)</option>
                </select>
              </Field>

              <Field>
                <FieldLabel htmlFor="discount-value">Nilai Potongan *</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                    {promoDiscountType === "percent" ? "%" : "Rp"}
                  </span>
                  <Input
                    id="discount-value"
                    type="number"
                    min="1"
                    required
                    placeholder={promoDiscountType === "percent" ? "10" : "5000"}
                    value={promoDiscountValue}
                    onChange={(e) => setPromoDiscountValue(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="min-order">Minimal Pembelian (Rp)</FieldLabel>
                <Input
                  id="min-order"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={promoMinOrder}
                  onChange={(e) => setPromoMinOrder(e.target.value)}
                  className="rounded-xl"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="max-discount">
                  Maksimal Potongan (Rp) {promoDiscountType === "fixed" && "(Tidak Aktif)"}
                </FieldLabel>
                <Input
                  id="max-discount"
                  type="number"
                  min="1"
                  disabled={promoDiscountType === "fixed"}
                  placeholder="e.g. 10000 (kosongkan jika tanpa batas)"
                  value={promoMaxDiscount}
                  onChange={(e) => setPromoMaxDiscount(e.target.value)}
                  className="rounded-xl"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="promo-target">Target Toko (Keterangan Promo Bisa Digunakan di Toko Apa Saja)</FieldLabel>
              <select
                id="promo-target"
                value={promoUmkmId}
                onChange={(e) => setPromoUmkmId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring animate-none"
              >
                <option value="">Semua Toko (Promo Global)</option>
                {approvedUMKMs.map((umkm) => (
                  <option key={umkm.id} value={umkm.id}>
                    Khusus Toko: {umkm.name} ({umkm.location})
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="valid-from">Tanggal Mulai</FieldLabel>
                <Input
                  id="valid-from"
                  type="date"
                  required
                  value={promoValidFrom}
                  onChange={(e) => setPromoValidFrom(e.target.value)}
                  className="rounded-xl"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="valid-until">Tanggal Berakhir</FieldLabel>
                <Input
                  id="valid-until"
                  type="date"
                  required
                  value={promoValidUntil}
                  onChange={(e) => setPromoValidUntil(e.target.value)}
                  className="rounded-xl"
                />
              </Field>
            </div>

            <div className="flex items-center gap-3 py-1.5 px-3 bg-muted/40 rounded-xl">
              <input
                id="promo-active-toggle"
                type="checkbox"
                checked={promoIsActive}
                onChange={(e) => setPromoIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="promo-active-toggle" className="text-sm font-medium text-foreground cursor-pointer select-none">
                Aktifkan Promo ini (Bisa langsung digunakan oleh mahasiswa)
              </label>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPromoModalOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" disabled={isProcessing} className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-primary-foreground">
                {isProcessing ? "Menyimpan..." : "Simpan Promo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Promo Dialog */}
      <Dialog open={deletePromoDialogOpen} onOpenChange={setDeletePromoDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-destructive/15 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              Hapus Promo
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus promo dengan kode &quot;{promoToDelete?.code}&quot;? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletePromoDialogOpen(false)} disabled={isProcessing} className="rounded-xl">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeletePromo} disabled={isProcessing} className="rounded-xl">
              {isProcessing ? "Menghapus..." : "Ya, Hapus Promo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
