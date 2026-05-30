"use client"

import { RoleProvider, useRole } from "@/lib/role-context"
import { DataProvider, useData } from "@/lib/data-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MahasiswaView } from "@/components/views/mahasiswa-view"
import { UMKMView } from "@/components/views/umkm-view"
import { AdminView } from "@/components/views/admin-view"
import { UMKMRegistrationView } from "@/components/views/umkm-registration-view"
import { AuthView } from "@/components/auth-view"
import { useState, useEffect } from "react"

function MainContent() {
  const { role, setRole } = useRole()
  const { syncUser } = useData()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Auto-login if token exists
  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    if (token && storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsAuthenticated(true)
      
      // Map role
      let mappedRole = userData.role
      if (userData.role === "customer") mappedRole = "mahasiswa"
      if (userData.role === "umkm_owner") mappedRole = "umkm"
      setRole(mappedRole)
      syncUser()
    }
  }, [setRole, syncUser])

  const handleLogin = (userData: any) => {
    setUser(userData)
    setIsAuthenticated(true)
    
    // Map backend roles to frontend roles
    let mappedRole = userData.role
    if (userData.role === "customer") mappedRole = "mahasiswa"
    if (userData.role === "umkm_owner") mappedRole = "umkm"
    
    setRole(mappedRole)
    syncUser()
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    setUser(null)
    syncUser()
  }

  return (
    <>
      {isAuthenticated ? (
        <>
          <Header onLogout={handleLogout} user={user} />
          <main className="pt-16">
            {role === "mahasiswa" && <MahasiswaView onLogout={handleLogout} />}
            {role === "umkm" && <UMKMView />}
            {role === "umkm-register" && <UMKMRegistrationView />}
            {role === "admin" && <AdminView />}
          </main>
          <Footer className={role === "umkm" ? "lg:ml-72" : ""} />
        </>
      ) : (
        <>
          <AuthView onLogin={handleLogin} />
          <Footer />
        </>
      )}
    </>
  )
}

export default function Page() {
  return (
    <DataProvider>
      <RoleProvider>
        <MainContent />
      </RoleProvider>
    </DataProvider>
  )
}
