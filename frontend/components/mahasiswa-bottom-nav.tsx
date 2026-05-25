"use client"

import { motion } from "framer-motion"
import { Home, Clock, Ticket, User } from "lucide-react"

export type MahasiswaTab = "beranda" | "riwayat" | "promo" | "akun"

interface MahasiswaBottomNavProps {
  activeTab: MahasiswaTab
  onTabChange: (tab: MahasiswaTab) => void
}

const tabs: { id: MahasiswaTab; label: string; icon: React.ElementType }[] = [
  { id: "beranda", label: "Beranda", icon: Home },
  { id: "riwayat", label: "Riwayat", icon: Clock },
  { id: "promo", label: "Promo", icon: Ticket },
  { id: "akun", label: "Akun", icon: User },
]

export function MahasiswaBottomNav({ activeTab, onTabChange }: MahasiswaBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] px-2 pb-safe transition-all duration-300">
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200 group"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`p-1.5 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? "text-white bg-white/20"
                    : "text-blue-200 group-hover:text-white group-hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
              </motion.div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? "text-white" : "text-blue-200 group-hover:text-white"
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
