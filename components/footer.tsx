"use client"

import { Store, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">U</span>
              </div>
              <div>
                <span className="font-bold text-lg">UMKM IPB</span>
              </div>
            </div>
            <p className="text-background/70 text-sm">
              Platform kuliner kampus untuk menghubungkan mahasiswa dengan UMKM lokal di lingkungan IPB.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigasi</h3>
            <ul className="space-y-2 text-background/70 text-sm">
              <li><a href="#" className="hover:text-background transition-colors">Beranda</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Daftar UMKM</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Menu Makanan</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Daftar UMKM</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Bantuan</h3>
            <ul className="space-y-2 text-background/70 text-sm">
              <li><a href="#" className="hover:text-background transition-colors">Cara Pesan</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Daftar Jadi UMKM</a></li>
              <li><a href="#" className="hover:text-background transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Hubungi Kami</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontak</h3>
            <ul className="space-y-3 text-background/70 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Kampus IPB Dramaga, Bogor</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>umkm@apps.ipb.ac.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(0251) 8622-642</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © 2024 UMKM IPB. Hak Cipta Dilindungi.
          </p>
          <p className="text-background/50 text-sm">
            Dibuat dengan ❤️ untuk Civitas IPB
          </p>
        </div>
      </div>
    </footer>
  )
}
