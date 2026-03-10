"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Store, ChevronRight, Utensils } from "lucide-react"
import type { UMKM } from "@/lib/mock-data"

interface UMKMCardProps {
  umkm: UMKM
  onClick?: () => void
  isSelected?: boolean
}

export function UMKMCard({ umkm, onClick, isSelected }: UMKMCardProps) {
  const menuCount = umkm.menu.length
  const availableMenuCount = umkm.menu.filter((m) => m.isAvailable).length

  return (
    <Card 
      className={`group overflow-hidden transition-all duration-300 cursor-pointer rounded-2xl border-0 shadow-md hover:shadow-xl ${
        isSelected 
          ? "ring-2 ring-primary shadow-lg bg-gradient-to-br from-primary/10 to-primary/5" 
          : "hover:-translate-y-1"
      }`} 
      onClick={onClick}
    >
      {/* Header Image Area */}
      <div className="aspect-[16/9] bg-gradient-to-br from-primary/15 via-primary/10 to-secondary relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-card/90 backdrop-blur flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
            <Store className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        {/* Rating Badge */}
        {umkm.rating > 0 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-card/90 backdrop-blur text-foreground border-0 shadow-md rounded-full px-2.5 py-1">
              <Star className="h-3.5 w-3.5 fill-warning text-warning mr-1" />
              <span className="font-semibold">{umkm.rating}</span>
            </Badge>
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground border-0 shadow-md rounded-full">
              Dipilih
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        {/* Title and description */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {umkm.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[2.5rem]">
            {umkm.description}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
          <span className="truncate">{umkm.location}</span>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs rounded-full px-3 py-1 bg-primary/10 text-primary border-0">
              <Utensils className="h-3 w-3 mr-1" />
              {menuCount} Menu
            </Badge>
            {availableMenuCount < menuCount && (
              <Badge variant="outline" className="text-xs rounded-full">
                {availableMenuCount} Tersedia
              </Badge>
            )}
          </div>
          <ChevronRight className={`h-5 w-5 transition-all ${isSelected ? "text-primary translate-x-1" : "text-muted-foreground group-hover:text-primary group-hover:translate-x-1"}`} />
        </div>
      </CardContent>
    </Card>
  )
}
