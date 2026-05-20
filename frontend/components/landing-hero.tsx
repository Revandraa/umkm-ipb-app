"use client"

import { MapPin, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background">
      {/* Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Top Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-background/80 border border-primary/20 text-primary text-sm font-semibold mb-8 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>Platform Resmi Kuliner IPB University</span>
          </motion.div>
          
          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 tracking-tight leading-[1.1]"
          >
            <span className="block mb-2">Portal UMKM IPB</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent block">
              Food Ecosystem
            </span>
          </motion.h1>
          
          {/* Elegant Tagline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-normal tracking-wide"
          >
            Ekosistem kuliner terpadu untuk seluruh civitas akademika IPB. Temukan, pesan, dan dukung UMKM kampus dengan lebih cepat dan praktis.
          </motion.p>
          
          {/* Canteen Indicators / Location Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-card/80 border border-border/60 shadow-sm backdrop-blur-md text-sm text-muted-foreground font-medium"
          >
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span>Melayani pengiriman & pickup di seluruh area Kampus IPB Dramaga</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
