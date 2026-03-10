"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LandingHero } from "@/components/landing-hero"
import { UMKMCard } from "@/components/umkm-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Store, Utensils, AlertCircle, ShoppingCart } from "lucide-react"
import { formatPrice, type MenuItem } from "@/lib/mock-data"
import { useData, type Order } from "@/lib/data-context"
import { OrderForm, OrderSuccess } from "@/components/order-form"

interface ExtendedMenuItem extends MenuItem {
  vendorName: string
  vendorId: string
}

type ViewState = "browse" | "order" | "success"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  }
}

export function MahasiswaView() {
  const { approvedUMKMs } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedUMKM, setSelectedUMKM] = useState<string | null>(null)
  const [viewState, setViewState] = useState<ViewState>("browse")
  const [selectedItem, setSelectedItem] = useState<ExtendedMenuItem | null>(null)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  
  const allMenuItems: ExtendedMenuItem[] = approvedUMKMs.flatMap((umkm) =>
    umkm.menu.map((item) => ({ ...item, vendorName: umkm.name, vendorId: umkm.id }))
  )

  const categories = Array.from(new Set(allMenuItems.map((item) => item.category)))

  const filteredMenuItems = allMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesUMKM = !selectedUMKM || item.vendorId === selectedUMKM
    return matchesSearch && matchesCategory && matchesUMKM
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
    <div className="min-h-screen">
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
            <section id="umkm" className="py-12 md:py-16 bg-background">
              <div className="container mx-auto px-4">
                <motion.div 
                  className="flex items-center gap-3 mb-8"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Daftar UMKM</h2>
                    <p className="text-muted-foreground text-sm">Temukan kuliner favorit dari UMKM kampus</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {approvedUMKMs.map((umkm) => (
                    <motion.div key={umkm.id} variants={itemVariants}>
                      <UMKMCard 
                        umkm={umkm}
                        onClick={() => setSelectedUMKM(selectedUMKM === umkm.id ? null : umkm.id)}
                        isSelected={selectedUMKM === umkm.id}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {approvedUMKMs.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg">
                    <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">Belum ada UMKM terdaftar</p>
                    <p className="text-muted-foreground">UMKM yang sudah disetujui akan muncul di sini</p>
                  </div>
                )}
              </div>
            </section>

            {/* Menu Section */}
            <section id="menu" className="py-12 md:py-16 bg-secondary/30">
              <div className="container mx-auto px-4">
                <motion.div 
                  className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Menu Makanan</h2>
                    <p className="text-muted-foreground text-sm">Pilih menu favoritmu dari berbagai pilihan</p>
                  </div>
                </motion.div>

                {/* Search and Filter */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari menu atau UMKM..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Semua
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </motion.div>

                {selectedUMKM && (
                  <motion.div 
                    className="flex items-center gap-2 mb-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <span className="text-sm text-muted-foreground">Filter:</span>
                    <Badge variant="secondary" className="gap-1">
                      {approvedUMKMs.find((u) => u.id === selectedUMKM)?.name}
                      <button
                        onClick={() => setSelectedUMKM(null)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  </motion.div>
                )}

                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  key={`${selectedCategory}-${selectedUMKM}-${searchQuery}`}
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
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">Tidak ada menu yang ditemukan</p>
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
            className="min-h-screen bg-background py-8"
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
            className="min-h-screen bg-background py-8"
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
    <Card className={`overflow-hidden transition-all duration-300 group ${isOutOfStock ? "opacity-60" : "hover:shadow-lg hover:border-primary/30"}`}>
      <div className="aspect-video bg-muted relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
          <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🍽️</span>
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="destructive" className="text-sm gap-1">
              <AlertCircle className="h-3 w-3" />
              Habis
            </Badge>
          </div>
        )}
        {!isOutOfStock && isLowStock && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-warning/20 text-warning-foreground border-warning/30 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Stok: {item.stock}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-xs text-muted-foreground">{item.vendorName}</p>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {item.category}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(item.price)}
          </span>
          <Button 
            size="sm" 
            disabled={isOutOfStock}
            className="gap-1"
            onClick={onOrderClick}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Pesan</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
