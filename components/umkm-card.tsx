"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, ChevronRight } from "lucide-react"
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
      className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
        isSelected 
          ? "border-primary shadow-md bg-primary/5" 
          : "border-border hover:border-primary/30"
      }`} 
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {umkm.name}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {umkm.description}
            </CardDescription>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{umkm.location}</span>
          </div>
          {umkm.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-medium text-foreground">{umkm.rating}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {menuCount} Menu
            </Badge>
            {availableMenuCount < menuCount && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {availableMenuCount} Tersedia
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
            Lihat Menu
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
