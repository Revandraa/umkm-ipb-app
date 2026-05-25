"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Ticket, Copy, CheckCircle2, Clock, Sparkles, Tag, Search, Zap, Gift, AlertCircle } from "lucide-react"
import { useData, type Promo } from "@/lib/data-context"
import { formatPrice } from "@/lib/mock-data"
import { toast } from "sonner"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
}

function getDaysRemaining(validUntil: string): number {
  const now = new Date()
  const end = new Date(validUntil)
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

function PromoCard({ promo }: { promo: Promo }) {
  const [copied, setCopied] = useState(false)
  const daysLeft = getDaysRemaining(promo.valid_until)
  const isExpiringSoon = daysLeft <= 3
  const isPercent = promo.discount_type === "percent"

  const handleCopy = () => {
    navigator.clipboard.writeText(promo.code)
    setCopied(true)
    toast.success("Kode promo disalin!", {
      description: `Kode "${promo.code}" berhasil disalin ke clipboard.`,
    })
    setTimeout(() => setCopied(false), 2500)
  }

  const gradients = [
    "from-violet-500 via-purple-500 to-indigo-500",
    "from-orange-400 via-rose-500 to-pink-500",
    "from-emerald-400 via-teal-500 to-cyan-500",
    "from-amber-400 via-orange-500 to-red-500",
    "from-blue-400 via-indigo-500 to-violet-500",
  ]
  // Pick consistent gradient based on promo id
  const gradientIndex = promo.id.charCodeAt(0) % gradients.length
  const gradient = gradients[gradientIndex]

  return (
    <motion.div variants={itemVariants} className="relative">
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
        {/* Hero gradient banner */}
        <div className={`relative bg-gradient-to-br ${gradient} p-5 overflow-hidden`}>
          {/* Background decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

          {/* Top row: Icon + badges */}
          <div className="relative flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Gift className="h-5 w-5 text-white" />
              </div>
              {promo.umkm_id === null && (
                <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                  Semua UMKM
                </Badge>
              )}
            </div>
            {isExpiringSoon ? (
              <Badge className="bg-red-500/80 text-white border-0 text-xs backdrop-blur-sm gap-1">
                <Zap className="h-3 w-3" />
                Berakhir {daysLeft === 0 ? "hari ini" : `${daysLeft} hari lagi`}
              </Badge>
            ) : (
              <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm gap-1">
                <Clock className="h-3 w-3" />
                {daysLeft} hari lagi
              </Badge>
            )}
          </div>

          {/* Promo title and discount */}
          <div className="relative">
            <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-sm">
              {promo.title}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-white/90 text-3xl font-extrabold tracking-tight drop-shadow">
                {isPercent ? `${promo.discount_value}%` : formatPrice(promo.discount_value)}
              </span>
              <span className="text-white/70 text-sm font-medium">
                {isPercent ? "DISKON" : "POTONGAN"}
              </span>
            </div>
          </div>
        </div>

        {/* Card body */}
        <CardContent className="p-4 space-y-3">
          {/* Description */}
          {promo.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {promo.description}
            </p>
          )}

          {/* Syarat & ketentuan */}
          <div className="flex flex-wrap gap-2">
            {promo.min_order > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                <Tag className="h-3 w-3" />
                Min. order {formatPrice(promo.min_order)}
              </div>
            )}
            {promo.max_discount && isPercent && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                <Tag className="h-3 w-3" />
                Maks. hemat {formatPrice(promo.max_discount)}
              </div>
            )}
          </div>

          {/* Divider dashed */}
          <div className="relative py-1">
            <div className="border-t border-dashed border-border" />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full border-r border-border" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full border-l border-border" />
          </div>

          {/* Promo code copy section */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted/50 border border-dashed border-primary/40 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
              <code className="text-sm font-mono font-bold text-primary tracking-widest">
                {promo.code}
              </code>
              <Ticket className="h-4 w-4 text-primary/50 shrink-0" />
            </div>
            <Button
              size="sm"
              variant={copied ? "default" : "outline"}
              className={`shrink-0 h-10 px-3 transition-all duration-300 ${copied ? "bg-emerald-500 border-emerald-500 text-white" : "border-primary/40 text-primary hover:bg-primary/5"}`}
              onClick={handleCopy}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Disalin!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Salin
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>

          {/* Valid date */}
          <p className="text-xs text-muted-foreground text-right">
            Berlaku s/d {new Date(promo.valid_until).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function MahasiswaPromoView() {
  const { promos } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "percent" | "fixed">("all")

  const filteredPromos = promos.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchFilter = filter === "all" || p.discount_type === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 via-background to-background dark:from-violet-950/10 pb-28">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 pt-6 pb-16 px-4">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative container mx-auto max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Promo & Diskon</h1>
              <p className="text-white/70 text-sm">Hemat lebih banyak setiap hari!</p>
            </div>
          </div>
          {/* Promo count badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white text-sm font-semibold">
                {filteredPromos.length} promo aktif tersedia
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter - floats over the banner */}
      <div className="container mx-auto max-w-2xl px-4 -mt-8 relative z-10">
        <div className="bg-background border border-border rounded-2xl shadow-xl p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari promo atau kode..."
              className="pl-9 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "percent", "fixed"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                className="rounded-full text-xs h-8"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Semua" : f === "percent" ? "Diskon %" : "Potongan Rp"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Promo grid */}
      <div className="container mx-auto max-w-2xl px-4 mt-6">
        {filteredPromos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <AlertCircle className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {promos.length === 0 ? "Belum Ada Promo" : "Promo Tidak Ditemukan"}
            </h3>
            <p className="text-muted-foreground">
              {promos.length === 0
                ? "Pantau terus, promo menarik akan segera hadir!"
                : "Coba kata kunci pencarian yang berbeda."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`${searchQuery}-${filter}`}
          >
            {filteredPromos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </motion.div>
        )}

        {/* Info footer */}
        <p className="text-center text-xs text-muted-foreground mt-8 pb-4">
          Promo berlaku sesuai syarat & ketentuan yang berlaku. <br />
          Hubungi admin jika mengalami kendala penggunaan promo.
        </p>
      </div>
    </div>
  )
}
