"use client"

import { RoleSwitcher } from "./role-switcher"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { Menu, X, LogIn } from "lucide-react"
import { useState, useEffect } from "react"
import { useRole } from "@/lib/role-context"

export function Header({ onLogout, user }: { onLogout?: () => void; user?: any }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { role } = useRole()
    
    const [currentUser, setCurrentUser] = useState<any>(user || null)

    useEffect(() => {
        if (user) {
            setCurrentUser(user)
        } else {
            const storedUser = localStorage.getItem("user")
            if (storedUser) {
                try {
                    setCurrentUser(JSON.parse(storedUser))
                } catch (e) {
                    console.error("Failed to parse user", e)
                }
            }
        }
    }, [user])

    const isDeveloper = currentUser?.email === "revandraarevandra@apps.ipb.ac.id"
    const isMahasiswa = role === "mahasiswa"

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-primary/20 text-white bg-primary shadow-sm backdrop-blur supports-[backdrop-filter]:bg-primary/90 transition-all duration-300">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Logo size="md" invert={true} />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {role === "mahasiswa" && (
                        <>
                            <a href="#umkm" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                                Daftar UMKM
                            </a>
                            <a href="#menu" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                                Menu Makanan
                            </a>
                        </>
                    )}
                    {role === "umkm" && (
                        <>
                            <a href="#kelola" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                                Kelola Menu
                            </a>
                            <a href="#pesanan" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                                Pesanan
                            </a>
                        </>
                    )}
                    {role === "admin" && (
                        <>
                            <a href="#antrian" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                                Antrian Persetujuan
                            </a>
                            <a href="#umkm-list" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                                Daftar UMKM
                            </a>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {isDeveloper && <RoleSwitcher />}
                    {onLogout && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLogout}
                            className="hidden md:flex gap-2 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <LogIn className="h-4 w-4 rotate-180" />
                            Keluar
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-primary border-white/10">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                        {role === "mahasiswa" && (
                            <>
                                <a href="#umkm" className="px-3 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                    Daftar UMKM
                                </a>
                                <a href="#menu" className="px-3 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                    Menu Makanan
                                </a>
                            </>
                        )}
                        {role === "umkm" && (
                            <>
                                <a href="#kelola" className="px-3 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                    Kelola Menu
                                </a>
                                <a href="#pesanan" className="px-3 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                    Pesanan
                                </a>
                            </>
                        )}
                        {role === "admin" && (
                            <>
                                <a href="#antrian" className="px-3 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                    Antrian Persetujuan
                                </a>
                                <a href="#umkm-list" className="px-3 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors">
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
