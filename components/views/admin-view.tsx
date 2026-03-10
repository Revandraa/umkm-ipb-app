"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  Store,
  AlertTriangle,
  Search,
  MapPin
} from "lucide-react"
import { mockUMKMs, pendingUMKMs, formatPrice } from "@/lib/mock-data"
import type { UMKM } from "@/lib/mock-data"

export function AdminView() {
  const [pending, setPending] = useState(pendingUMKMs)
  const [selectedUMKM, setSelectedUMKM] = useState<UMKM | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const approvedCount = mockUMKMs.filter(u => u.isApproved).length
  const pendingCount = pending.length

  const handleApprove = (id: string) => {
    setPending(items => items.filter(item => item.id !== id))
    setSelectedUMKM(null)
  }

  const handleReject = (id: string) => {
    setPending(items => items.filter(item => item.id !== id))
    setSelectedUMKM(null)
  }

  const filteredPending = pending.filter(umkm =>
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
                <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30">
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
                              onClick={() => handleApprove(umkm.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Setujui</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleReject(umkm.id)}
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
            <CardDescription>Daftar UMKM yang sudah disetujui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>UMKM</TableHead>
                    <TableHead>Pemilik</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-center">Menu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUMKMs.filter(u => u.isApproved).map((umkm) => (
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
                        <Badge variant="secondary" className="gap-1">
                          ⭐ {umkm.rating}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              {selectedUMKM?.name}
            </DialogTitle>
            <DialogDescription>{selectedUMKM?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedUMKM && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pemilik</p>
                  <p className="font-medium text-foreground">{selectedUMKM.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lokasi</p>
                  <p className="font-medium text-foreground">{selectedUMKM.location}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Menu ({selectedUMKM.menu.length} item)</p>
                <div className="space-y-2">
                  {selectedUMKM.menu.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <p className="font-medium text-primary">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedUMKM(null)}>
              Tutup
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUMKM && handleReject(selectedUMKM.id)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Tolak
            </Button>
            <Button
              className="bg-success hover:bg-success/90 text-success-foreground"
              onClick={() => selectedUMKM && handleApprove(selectedUMKM.id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
