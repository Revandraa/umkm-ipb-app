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
  FileText
} from "lucide-react"
import { formatPrice } from "@/lib/mock-data"
import type { UMKM } from "@/lib/mock-data"
import { useData } from "@/lib/data-context"
import { toast } from "sonner"

export function AdminView() {
  const { approvedUMKMs, pendingUMKMs, approveUMKM, rejectUMKM } = useData()
  const [selectedUMKM, setSelectedUMKM] = useState<UMKM | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Rejection Modal State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingUMKM, setRejectingUMKM] = useState<UMKM | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectionError, setRejectionError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Approval Confirmation Dialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [approvingUMKM, setApprovingUMKM] = useState<UMKM | null>(null)

  const approvedCount = approvedUMKMs.length
  const pendingCount = pendingUMKMs.length

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

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Kelola persetujuan dan verifikasi UMKM</p>
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
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total UMKM</p>
                  <p className="text-2xl font-bold text-foreground">{approvedCount + pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Terverifikasi</p>
                  <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Menunggu</p>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pengguna Aktif</p>
                  <p className="text-2xl font-bold text-foreground">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals Section */}
        <Card id="antrian">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  Antrian Persetujuan UMKM
                </CardTitle>
                <CardDescription>
                  Verifikasi pendaftaran UMKM baru
                </CardDescription>
              </div>
              {pendingCount > 0 && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {pendingCount} menunggu
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative max-w-sm mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari UMKM..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredPending.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>UMKM</TableHead>
                      <TableHead>Pemilik</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Tanggal Daftar</TableHead>
                      <TableHead className="text-center">Menu</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPending.map((umkm) => (
                      <TableRow key={umkm.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Store className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{umkm.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{umkm.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {umkm.owner}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">{umkm.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(umkm.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{umkm.menu.length}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => setSelectedUMKM(umkm)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">Detail</span>
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-1 bg-success hover:bg-success/90 text-success-foreground"
                              onClick={() => openApproveDialog(umkm)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Setujui</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                              onClick={() => openRejectDialog(umkm)}
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="hidden sm:inline">Tolak</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">Semua sudah diproses!</p>
                <p className="text-muted-foreground">Tidak ada UMKM yang menunggu persetujuan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved UMKM List */}
        <Card className="mt-8" id="umkm-list">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              UMKM Terverifikasi
            </CardTitle>
            <CardDescription>Daftar UMKM yang sudah disetujui dan aktif</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>UMKM</TableHead>
                    <TableHead>Pemilik</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Menu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedUMKMs.map((umkm) => (
                    <TableRow key={umkm.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                            <Store className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{umkm.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{umkm.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{umkm.owner}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">{umkm.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-success/10 text-success border-success/30 hover:bg-success/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Aktif
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{umkm.menu.length}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* UMKM Detail Dialog */}
      <Dialog open={!!selectedUMKM} onOpenChange={() => setSelectedUMKM(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Detail Pendaftaran UMKM
            </DialogTitle>
            <DialogDescription>
              Review informasi lengkap pendaftaran UMKM
            </DialogDescription>
          </DialogHeader>
          
          {selectedUMKM && (
            <div className="space-y-6">
              {/* UMKM Info Card */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{selectedUMKM.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUMKM.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    <Clock className="h-3 w-3 mr-1" />
                    Menunggu
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pemilik</p>
                    <p className="font-medium text-foreground">{selectedUMKM.owner}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lokasi</p>
                    <p className="font-medium text-foreground">{selectedUMKM.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Daftar</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedUMKM.createdAt).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Jumlah Menu</p>
                    <p className="font-medium text-foreground">{selectedUMKM.menu.length} item</p>
                  </div>
                </div>
              </div>

              {/* Menu List */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Daftar Menu</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedUMKM.menu.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center">
                          <span className="text-lg">🍽️</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatPrice(item.price)}</p>
                        <p className="text-xs text-muted-foreground">Stok: {item.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedUMKM(null)}
              className="w-full sm:w-auto"
            >
              Tutup
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto gap-1"
              onClick={() => {
                if (selectedUMKM) {
                  openRejectDialog(selectedUMKM)
                }
              }}
            >
              <XCircle className="h-4 w-4" />
              Tolak
            </Button>
            <Button
              className="w-full sm:w-auto gap-1 bg-success hover:bg-success/90 text-success-foreground"
              onClick={() => {
                if (selectedUMKM) {
                  openApproveDialog(selectedUMKM)
                }
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Konfirmasi Persetujuan
            </DialogTitle>
            <DialogDescription>
              Anda akan menyetujui pendaftaran UMKM berikut
            </DialogDescription>
          </DialogHeader>
          
          {approvingUMKM && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{approvingUMKM.name}</p>
                    <p className="text-sm text-muted-foreground">Pemilik: {approvingUMKM.owner}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/30">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <p className="text-sm text-foreground">
                  Status akan berubah menjadi <span className="font-semibold text-success">Aktif</span> dan menu akan ditampilkan ke mahasiswa
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApproveDialogOpen(false)}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button 
              className="bg-success hover:bg-success/90 text-success-foreground gap-2"
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
                  <CheckCircle2 className="h-4 w-4" />
                  Ya, Setujui
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Tolak Pendaftaran UMKM
            </DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk UMKM ini
            </DialogDescription>
          </DialogHeader>
          
          {rejectingUMKM && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{rejectingUMKM.name}</p>
                    <p className="text-sm text-muted-foreground">Pemilik: {rejectingUMKM.owner}</p>
                  </div>
                </div>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel>Alasan Penolakan <span className="text-destructive">*</span></FieldLabel>
                  <Textarea
                    placeholder="Contoh: Dokumen tidak lengkap, lokasi tidak sesuai, dll."
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value)
                      if (rejectionError) setRejectionError("")
                    }}
                    className={rejectionError ? "border-destructive" : ""}
                    rows={4}
                  />
                  {rejectionError && <FieldError>{rejectionError}</FieldError>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimal 10 karakter. Alasan ini akan dikirimkan ke pemilik UMKM.
                  </p>
                </Field>
              </FieldGroup>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectDialogOpen(false)}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Memproses...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Tolak Pendaftaran
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
