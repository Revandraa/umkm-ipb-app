"use client"

import { useState } from "react"
import { LandingHero } from "@/components/landing-hero"
import { UMKMCard } from "@/components/umkm-card"
import { MenuItemCard } from "@/components/menu-item-card"
import { mockUMKMs } from "@/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Store, Utensils } from "lucide-react"

export function MahasiswaView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedUMKM, setSelectedUMKM] = useState<string | null>(null)

  const approvedUMKMs = mockUMKMs.filter((u) => u.isApproved)
  
  const allMenuItems = approvedUMKMs.flatMap((umkm) =>
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

  return (
    <div className="min-h-screen">
      <LandingHero />
      
      {/* UMKM List Section */}
      <section id="umkm" className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Daftar UMKM</h2>
              <p className="text-muted-foreground text-sm">Temukan kuliner favorit dari UMKM kampus</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {approvedUMKMs.map((umkm) => (
              <UMKMCard 
                key={umkm.id} 
                umkm={umkm}
                onClick={() => setSelectedUMKM(selectedUMKM === umkm.id ? null : umkm.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Menu Makanan</h2>
              <p className="text-muted-foreground text-sm">Pilih menu favoritmu dari berbagai pilihan</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          </div>

          {selectedUMKM && (
            <div className="flex items-center gap-2 mb-4">
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
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenuItems.map((item) => (
              <MenuItemCard
                key={`${item.vendorId}-${item.id}`}
                item={item}
                vendorName={item.vendorName}
              />
            ))}
          </div>

          {filteredMenuItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tidak ada menu yang ditemukan</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
