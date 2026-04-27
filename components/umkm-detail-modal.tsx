"use client"

import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Store, ShoppingBag, X } from "lucide-react"
import type { UMKM, MenuItem } from "@/lib/mock-data"
import { formatPrice } from "@/lib/mock-data"

interface UMKMDetailModalProps {
  umkm: UMKM | null
  isOpen: boolean
  onClose: () => void
  onSelectMenuItem?: (item: MenuItem & { vendorName: string; vendorId: string }) => void
}

export function UMKMDetailModal({ umkm, isOpen, onClose, onSelectMenuItem }: UMKMDetailModalProps) {
  if (!umkm) return null

  const availableMenuCount = umkm.menu.filter(m => m.isAvailable).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 -mx-6 px-6 py-8 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">{umkm.name}</h2>
              <p className="text-foreground/70 mb-4 line-clamp-2">{umkm.description}</p>
              <div className="flex flex-wrap gap-3">
                {/* Rating */}
                {umkm.rating > 0 && (
                  <div className="flex items-center gap-2 bg-card/80 px-3 py-2 rounded-full">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold text-sm">{umkm.rating}</span>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-2 bg-card/80 px-3 py-2 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{umkm.location}</span>
                </div>

                {/* Status */}
                {umkm.isApproved && (
                  <Badge className="bg-success/20 text-success border-success/30">
                    Terverifikasi
                  </Badge>
                )}
              </div>
            </div>

            {/* Store Icon */}
            <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <Store className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">Pemilik</p>
            <p className="font-semibold text-foreground">{umkm.owner}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">Menu Tersedia</p>
            <p className="font-semibold text-foreground">{availableMenuCount}/{umkm.menu.length}</p>
          </div>
        </div>

        {/* Menu Section Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Menu Makanan & Minuman
          </h3>
        </div>

        {/* Menu Items Grid */}
        {umkm.menu.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 gap-3"
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
                <Card className={`overflow-hidden transition-all cursor-pointer group ${
                  item.isAvailable 
                    ? "hover:shadow-md hover:border-primary/50" 
                    : "opacity-60"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          {!item.isAvailable && (
                            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                              Kosong
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {item.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary text-lg">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Stok: {item.stock}
                          </span>
                        </div>
                      </div>
                      
                      {item.isAvailable && (
                        <Button
                          size="sm"
                          className="rounded-lg group-hover:bg-primary group-hover:text-primary-foreground"
                          onClick={() => onSelectMenuItem?.(
                            { 
                              ...item, 
                              vendorName: umkm.name,
                              vendorId: umkm.id 
                            }
                          )}
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Belum ada menu</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
