"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Utensils, Users, TrendingUp } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Utensils className="h-4 w-4" />
            Platform Kuliner Kampus IPB
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Ekosistem Kuliner
            <span className="text-primary block">untuk Civitas IPB</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Temukan berbagai pilihan kuliner dari UMKM kampus. 
            Pesan makanan dengan mudah, dukung pelaku usaha lokal.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="gap-2">
              Jelajahi Menu
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Daftar sebagai UMKM
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-xl bg-card border border-border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">50+</span>
              <span className="text-sm text-muted-foreground">UMKM Terdaftar</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-xl bg-card border border-border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Utensils className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">200+</span>
              <span className="text-sm text-muted-foreground">Menu Tersedia</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-xl bg-card border border-border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">5000+</span>
              <span className="text-sm text-muted-foreground">Pesanan/Bulan</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
