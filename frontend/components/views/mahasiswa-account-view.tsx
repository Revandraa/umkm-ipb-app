"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  Wallet,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  Star,
  Info,
  Edit3,
  Save,
  X,
} from "lucide-react"
import { useData } from "@/lib/data-context"
import { formatPrice } from "@/lib/mock-data"
import { toast } from "sonner"

interface MahasiswaAccountViewProps {
  onLogout: () => void
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: React.ElementType
  label: string
  value: string
  gradient: string
}) {
  return (
    <div className={`relative flex-1 rounded-2xl p-4 bg-gradient-to-br ${gradient} overflow-hidden`}>
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
      <Icon className="h-5 w-5 text-white/80 mb-2" />
      <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
      <p className="text-xs text-white/70 font-medium mt-0.5">{label}</p>
    </div>
  )
}

function MenuRow({
  icon: Icon,
  label,
  description,
  onClick,
  danger,
}: {
  icon: React.ElementType
  label: string
  description?: string
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 rounded-2xl transition-colors duration-150 group text-left ${danger ? "hover:bg-destructive/5" : ""}`}
    >
      <div className={`p-2 rounded-xl ${danger ? "bg-destructive/10" : "bg-muted"} group-hover:scale-105 transition-transform`}>
        <Icon className={`h-4 w-4 ${danger ? "text-destructive" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? "text-destructive" : "text-foreground"}`}>{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>}
      </div>
      {!danger && <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:translate-x-0.5 transition-transform" />}
    </button>
  )
}

export function MahasiswaAccountView({ onLogout }: MahasiswaAccountViewProps) {
  const {
    customerName,
    customerEmail,
    customerPhone,
    customerCreatedAt,
    customerId,
    totalOrdersCount,
    completedOrdersCount,
    totalSpent,
  } = useData()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(customerName)
  const [editPhone, setEditPhone] = useState(customerPhone)
  const [isSaving, setIsSaving] = useState(false)

  const initials = customerName
    ? customerName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "M"

  const joinedDate = customerCreatedAt
    ? new Date(customerCreatedAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "—"

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error("Nama tidak boleh kosong")
      return
    }
    setIsSaving(true)
    try {
      let rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
      rawUrl = rawUrl.replace(/\/+$/, "")
      if (!rawUrl.endsWith("/api/v1")) {
        rawUrl = `${rawUrl}/api/v1`
      }
      const backendUrl = rawUrl
      const res = await fetch(`${backendUrl}/users/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: editName.trim(), phone: editPhone.trim() }),
      })
      if (res.ok) {
        // Update localStorage
        const stored = localStorage.getItem("user")
        if (stored) {
          const parsed = JSON.parse(stored)
          localStorage.setItem("user", JSON.stringify({ ...parsed, full_name: editName.trim(), phone: editPhone.trim() }))
        }
        toast.success("Profil berhasil diperbarui!", { description: "Perubahan akan diterapkan setelah refresh." })
        setIsEditing(false)
      } else {
        toast.error("Gagal menyimpan profil", { description: "Coba lagi nanti." })
      }
    } catch {
      toast.error("Koneksi bermasalah")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoutConfirm = () => {
    toast("Yakin ingin keluar?", {
      action: {
        label: "Logout",
        onClick: onLogout,
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-28">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent pt-8 pb-20 px-4">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

        <div className="relative container mx-auto max-w-lg">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border-2 border-white/30">
                <span className="text-2xl font-extrabold text-white tracking-tight">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-extrabold text-white tracking-tight truncate">
                  {customerName || "Mahasiswa IPB"}
                </h1>
                <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm shrink-0">
                  Mahasiswa
                </Badge>
              </div>
              <p className="text-white/70 text-sm truncate">{customerEmail || "—"}</p>
              <p className="text-white/50 text-xs mt-0.5">Bergabung sejak {joinedDate}</p>
            </div>

            {/* Edit button */}
            <button
              onClick={() => { setIsEditing(!isEditing); setEditName(customerName); setEditPhone(customerPhone) }}
              className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Strip - floats over header */}
      <div className="container mx-auto max-w-lg px-4 -mt-10 relative z-10">
        <div className="flex gap-3">
          <StatCard
            icon={ShoppingBag}
            label="Total Pesanan"
            value={String(totalOrdersCount)}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Selesai"
            value={String(completedOrdersCount)}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            icon={Wallet}
            label="Total Hemat"
            value={formatPrice(totalSpent).replace("Rp", "Rp\n")}
            gradient="from-amber-500 to-orange-600"
          />
        </div>
      </div>

      {/* Edit Profile Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="container mx-auto max-w-lg px-4 mt-4">
              <Card className="border border-primary/20 shadow-lg">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Edit3 className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Edit Profil</h3>
                  </div>
                  <Field>
                    <FieldLabel>Nama Lengkap</FieldLabel>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nama lengkap kamu"
                      className="rounded-xl"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Nomor HP</FieldLabel>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      type="tel"
                      className="rounded-xl"
                    />
                  </Field>
                  <div className="flex gap-2 pt-1">
                    <Button className="flex-1" onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? <><Spinner className="h-4 w-4 mr-2" />Menyimpan...</> : <><Save className="h-4 w-4 mr-2" />Simpan Perubahan</>}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Batal</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Info Card */}
      <div className="container mx-auto max-w-lg px-4 mt-4">
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
              Informasi Akun
            </h3>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="p-2 bg-muted rounded-xl">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nama Lengkap</p>
                <p className="text-sm font-semibold text-foreground">{customerName || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="p-2 bg-muted rounded-xl">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Alamat Email</p>
                <p className="text-sm font-semibold text-foreground">{customerEmail || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="p-2 bg-muted rounded-xl">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nomor HP</p>
                <p className="text-sm font-semibold text-foreground">{customerPhone || "Belum diisi"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="p-2 bg-muted rounded-xl">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bergabung Sejak</p>
                <p className="text-sm font-semibold text-foreground">{joinedDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Pengaturan */}
      <div className="container mx-auto max-w-lg px-4 mt-4">
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
              Pengaturan
            </h3>
            <MenuRow
              icon={Shield}
              label="Keamanan & Privasi"
              description="Ganti password, kelola keamanan akun"
              onClick={() => toast.info("Fitur segera hadir!")}
            />
            <MenuRow
              icon={Bell}
              label="Notifikasi"
              description="Atur preferensi notifikasi pesanan"
              onClick={() => toast.info("Fitur segera hadir!")}
            />
            <MenuRow
              icon={Star}
              label="Beri Penilaian UMKM"
              description="Ulasan kamu membantu UMKM berkembang"
              onClick={() => toast.info("Fitur segera hadir!")}
            />
            <MenuRow
              icon={HelpCircle}
              label="Pusat Bantuan"
              description="FAQ, hubungi admin, laporkan masalah"
              onClick={() => toast.info("Fitur segera hadir!")}
            />
            <MenuRow
              icon={Info}
              label="Tentang Aplikasi"
              description="UMKM IPB v1.0 — Portal Kuliner Kampus"
              onClick={() =>
                toast("UMKM IPB Portal", {
                  description: "Versi 1.0.0 — Dikembangkan untuk civitas akademika IPB University 🎓",
                })
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <div className="container mx-auto max-w-lg px-4 mt-4">
        <Card className="border border-destructive/20 shadow-sm bg-destructive/5">
          <CardContent className="p-3">
            <MenuRow
              icon={LogOut}
              label="Keluar dari Akun"
              description="Anda akan kembali ke halaman login"
              onClick={handleLogoutConfirm}
              danger
            />
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        UMKM IPB Portal © 2024 — Made with ❤️ for IPB
      </p>
    </div>
  )
}
