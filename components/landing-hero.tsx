import { Utensils, Users, TrendingUp, MapPin } from "lucide-react"
import Image from "next/image"

export function LandingHero() {

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-primary/3 to-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086&auto=format&fit=crop"
          alt="IPB University Campus"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20 md:py-28">
        <div className="max-w-5xl mx-auto text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Platform Resmi Kuliner Kampus IPB
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
            <span className="block">Portal UMKM IPB</span>
            <span className="text-primary block mt-2">Food Ecosystem</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Ekosistem kuliner terpadu untuk seluruh civitas akademika IPB. 
            Temukan, pesan, dan dukung UMKM kampus dengan mudah.
          </p>
          

          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="group flex flex-col items-center p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <span className="text-4xl font-bold text-foreground">50+</span>
              <span className="text-sm text-muted-foreground font-medium">UMKM Terdaftar</span>
            </div>
            <div className="group flex flex-col items-center p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Utensils className="h-7 w-7 text-primary" />
              </div>
              <span className="text-4xl font-bold text-foreground">200+</span>
              <span className="text-sm text-muted-foreground font-medium">Menu Tersedia</span>
            </div>
            <div className="group flex flex-col items-center p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <span className="text-4xl font-bold text-foreground">5000+</span>
              <span className="text-sm text-muted-foreground font-medium">Pesanan/Bulan</span>
            </div>
          </div>

          {/* Location Badge */}
          <div className="mt-10 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Kampus IPB Dramaga, Bogor
          </div>
        </div>
      </div>
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-40 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/8 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
