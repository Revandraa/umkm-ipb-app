"use client"

import { RoleSwitcher } from "./role-switcher"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useRole } from "@/lib/role-context"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { role } = useRole()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">U</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-lg leading-tight">UMKM IPB</span>
              <span className="text-xs text-muted-foreground leading-tight hidden sm:block">
                Food Ecosystem
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {role === "mahasiswa" && (
            <>
              <a href="#umkm" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Daftar UMKM
              </a>
              <a href="#menu" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Menu Makanan
              </a>
            </>
          )}
          {role === "umkm" && (
            <>
              <a href="#kelola" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Kelola Menu
              </a>
              <a href="#pesanan" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pesanan
              </a>
            </>
          )}
          {role === "admin" && (
            <>
              <a href="#antrian" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Antrian Persetujuan
              </a>
              <a href="#umkm-list" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Daftar UMKM
              </a>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {role === "mahasiswa" && (
              <>
                <a href="#umkm" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                  Daftar UMKM
                </a>
                <a href="#menu" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                  Menu Makanan
                </a>
              </>
            )}
            {role === "umkm" && (
              <>
                <a href="#kelola" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                  Kelola Menu
                </a>
                <a href="#pesanan" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                  Pesanan
                </a>
              </>
            )}
            {role === "admin" && (
              <>
                <a href="#antrian" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                  Antrian Persetujuan
                </a>
                <a href="#umkm-list" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                  Daftar UMKM
                </a>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
