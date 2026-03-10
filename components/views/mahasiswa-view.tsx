"use client"

import { useState } from "react"
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
import { Search, Store, Utensils, AlertCircle, ShoppingCart, MapPin, Star, Clock } from "lucide-react"
import { formatPrice, kantinLocations, type MenuItem } from "@/lib/mock-data"
import { useData, type Order } from "@/lib/data-context"
import { OrderForm, OrderSuccess } from "@/components/order-form"

interface ExtendedMenuItem extends MenuItem {
  vendorName: string
  vendorId: string
  vendorLocation: string
}

type ViewState = "browse" | "order" | "success"

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
      ease: "easeOut"
    }
  }
}

export function MahasiswaView() {
  const { approvedUMKMs } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedUMKM, setSelectedUMKM] = useState<string | null>(null)
  const [selectedKantin, setSelectedKantin] = useState<string>("all")
  const [viewState, setViewState] = useState<ViewState>("browse")
  const [selectedItem, setSelectedItem] = useState<ExtendedMenuItem | null>(null)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  
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

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {viewState === "browse" && (
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
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
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
                        onClick={() => setSelectedUMKM(selectedUMKM === umkm.id ? null : umkm.id)}
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
            <section id="menu" className="py-14 md:py-20 bg-gradient-to-b from-secondary/50 to-background">
              <div className="container mx-auto px-4">
                <motion.div 
                  className="flex items-center gap-4 mb-8"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
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
            className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-8"
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
            className="min-h-screen bg-gradient-to-b from-success/5 to-background py-8"
          >
            <div className="container mx-auto px-4">
              <OrderSuccess 
                order={completedOrder}
                onBackToMenu={handleBackToMenu}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 via-secondary to-muted relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
            {item.category === "Minuman" ? "🥤" : item.category === "Makanan Ringan" ? "🍪" : "🍽️"}
          </span>
        </div>
        
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
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
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
