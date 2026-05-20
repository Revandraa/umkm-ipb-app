"use client"

import { RoleSwitcher } from "./role-switcher"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { Menu, X, LogIn } from "lucide-react"
import { useState } from "react"
import { useRole } from "@/lib/role-context"

export function Header({ onLogout }: { onLogout?: () => void }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { role } = useRole()
    const isAuthenticated = !!onLogout

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
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
                    {onLogout && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLogout}
                            className="hidden md:flex gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                            <LogIn className="h-4 w-4 rotate-180" />
                            Keluar
                        </Button>
                    )}
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
