"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, AlertCircle } from "lucide-react"
import type { MenuItem } from "@/lib/mock-data"
import { formatPrice } from "@/lib/mock-data"

interface MenuItemCardProps {
  item: MenuItem
  vendorName?: string
}

export function MenuItemCard({ item, vendorName }: MenuItemCardProps) {
  const isOutOfStock = item.stock === 0
  const isLowStock = item.stock > 0 && item.stock <= 5

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isOutOfStock ? "opacity-60" : "hover:shadow-md"}`}>
      <div className="aspect-video bg-muted relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-secondary">
          <span className="text-4xl">🍽️</span>
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">
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
            <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
            {vendorName && (
              <p className="text-xs text-muted-foreground">{vendorName}</p>
            )}
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
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Pesan</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
