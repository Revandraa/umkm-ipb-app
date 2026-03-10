"use client"

import { useRole } from "@/lib/role-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GraduationCap, Store, Shield, ChevronDown } from "lucide-react"
import type { Role } from "@/lib/mock-data"

const roleConfig: Record<Role, { label: string; icon: typeof GraduationCap; description: string }> = {
  mahasiswa: {
    label: "Mahasiswa",
    icon: GraduationCap,
    description: "Lihat katalog & pesan makanan",
  },
  umkm: {
    label: "UMKM",
    icon: Store,
    description: "Kelola menu & pesanan",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    description: "Kelola persetujuan UMKM",
  },
}

export function RoleSwitcher() {
  const { role, setRole } = useRole()
  const currentRole = roleConfig[role]
  const CurrentIcon = currentRole.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-card border-border hover:bg-secondary"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentRole.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {(Object.keys(roleConfig) as Role[]).map((roleKey) => {
          const config = roleConfig[roleKey]
          const Icon = config.icon
          return (
            <DropdownMenuItem
              key={roleKey}
              onClick={() => setRole(roleKey)}
              className={`flex items-center gap-3 cursor-pointer ${
                role === roleKey ? "bg-primary/10" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">
                  {config.description}
                </span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
