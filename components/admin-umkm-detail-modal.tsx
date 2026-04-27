"use client"

import React from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { 
  Star, 
  MapPin, 
  Store, 
  ShoppingBag, 
  Calendar,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react"
import type { UMKM } from "@/lib/mock-data"
import { formatPrice } from "@/lib/mock-data"
import { Spinner } from "@/components/ui/spinner"

interface AdminUMKMDetailModalProps {
  umkm: UMKM | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (umkm: UMKM) => void
  onReject?: (umkm: UMKM, reason: string) => void
  isProcessing?: boolean
}

export function AdminUMKMDetailModal({ 
  umkm, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject,
  isProcessing = false 
}: AdminUMKMDetailModalProps) {
  if (!umkm) return null

  const [rejectionReason, setRejectionReason] = React.useState("")
  const [showRejectForm, setShowRejectForm] = React.useState(false)

  const handleApprove = () => {
    onApprove?.(umkm)
  }

  const handleReject = () => {
    if (rejectionReason.trim() && rejectionReason.trim().length >= 10) {
      onReject?.(umkm, rejectionReason)
      setRejectionReason("")
      setShowRejectForm(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl">Detail UMKM</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className="pr-4">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 -mx-6 px-6 py-6 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{umkm.name}</h2>
                  <p className="text-foreground/70 mb-4 line-clamp-2">{umkm.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {umkm.isApproved && (
                      <Badge className="bg-success/20 text-success border-success/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Terverifikasi
                      </Badge>
                    )}
                    {umkm.isPending && (
                      <Badge className="bg-warning/20 text-warning border-warning/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Menunggu Verifikasi
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="h-24 w-24 rounded-2xl bg-muted overflow-hidden shrink-0 shadow-md">
                  <Image
                    src={umkm.image}
                    alt={umkm.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* UMKM Information Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="rounded-xl border-0 bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Pemilik
                  </p>
                  <p className="font-semibold text-foreground">{umkm.owner}</p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-0 bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Lokasi
                  </p>
                  <p className="font-semibold text-foreground truncate">{umkm.location}</p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-0 bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Tanggal Daftar
                  </p>
                  <p className="font-semibold text-foreground">
                    {new Date(umkm.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                </CardContent>
              </Card>
              {umkm.rating > 0 && (
                <Card className="rounded-xl border-0 bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Rating
                    </p>
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      {umkm.rating}
                      <Star className="h-4 w-4 fill-warning text-warning" />
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Description */}
            <div className="mb-6 bg-muted/30 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Deskripsi Lengkap
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{umkm.description}</p>
            </div>

            {/* Menu Section */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Menu Makanan & Minuman ({umkm.menu.length})
              </h3>

              {umkm.menu.length > 0 ? (
                <motion.div 
                  className="grid gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {umkm.menu.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="rounded-xl overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-foreground">{item.name}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {item.category}
                                </Badge>
                                {!item.isAvailable && (
                                  <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                                    Tidak Tersedia
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-primary">
                                  {formatPrice(item.price)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Stok: {item.stock}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/30">
                  <p className="text-muted-foreground">Belum ada menu</p>
                </div>
              )}
            </div>

            {/* Action Section untuk Pending UMKM */}
            {umkm.isPending && (
              <div className="space-y-4">
                {!showRejectForm ? (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 rounded-xl bg-success hover:bg-success/90 text-success-foreground gap-2"
                      onClick={handleApprove}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Setujui UMKM Ini
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 rounded-xl gap-2"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isProcessing}
                    >
                      <XCircle className="h-5 w-5" />
                      Tolak
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                    <p className="text-sm font-medium text-foreground">Alasan Penolakan</p>
                    <Textarea
                      placeholder="Jelaskan alasan penolakan pendaftaran UMKM ini..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-24 rounded-lg"
                    />
                    <div className="text-xs text-muted-foreground">
                      Minimal 10 karakter
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg"
                        onClick={() => {
                          setShowRejectForm(false)
                          setRejectionReason("")
                        }}
                        disabled={isProcessing}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 rounded-lg gap-1"
                        onClick={handleReject}
                        disabled={isProcessing || rejectionReason.trim().length < 10}
                      >
                        {isProcessing ? (
                          <>
                            <Spinner className="h-3 w-3" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Konfirmasi Penolakan
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
