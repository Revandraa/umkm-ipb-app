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
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag,
  Search,
  Store
} from "lucide-react"
import { mockUMKMs, formatPrice } from "@/lib/mock-data"
import type { MenuItem } from "@/lib/mock-data"

export function UMKMView() {
  // Simulate logged in UMKM - using first approved UMKM
  const currentUMKM = mockUMKMs[0]
  const [menuItems, setMenuItems] = useState<MenuItem[]>(currentUMKM.menu)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleAvailability = (itemId: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    )
  }

  const totalStock = menuItems.reduce((acc, item) => acc + item.stock, 0)
  const availableItems = menuItems.filter(item => item.isAvailable).length

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{currentUMKM.name}</h1>
                <p className="text-muted-foreground">{currentUMKM.location}</p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit">
              UMKM Terverifikasi
            </Badge>
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
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Menu</p>
                  <p className="text-2xl font-bold text-foreground">{menuItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Menu Aktif</p>
                  <p className="text-2xl font-bold text-foreground">{availableItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Stok</p>
                  <p className="text-2xl font-bold text-foreground">{totalStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendapatan Hari Ini</p>
                  <p className="text-2xl font-bold text-foreground">{formatPrice(450000)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Management Section */}
        <Card id="kelola">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Kelola Menu</CardTitle>
              <CardDescription>Atur menu makanan dan minuman Anda</CardDescription>
            </div>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Tambah Menu
            </Button>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative max-w-sm mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari menu..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Menu Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Menu</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-center">Stok</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <span className="text-lg">🍽️</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(item.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.stock === 0 ? "destructive" : item.stock <= 5 ? "outline" : "secondary"}>
                          {item.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={item.isAvailable}
                            onCheckedChange={() => toggleAvailability(item.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Tidak ada menu yang ditemukan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
