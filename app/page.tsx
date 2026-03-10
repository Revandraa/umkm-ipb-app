"use client"

import { RoleProvider, useRole } from "@/lib/role-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MahasiswaView } from "@/components/views/mahasiswa-view"
import { UMKMView } from "@/components/views/umkm-view"
import { AdminView } from "@/components/views/admin-view"

function MainContent() {
  const { role } = useRole()

  return (
    <>
      <Header />
      <main>
        {role === "mahasiswa" && <MahasiswaView />}
        {role === "umkm" && <UMKMView />}
        {role === "admin" && <AdminView />}
      </main>
      <Footer />
    </>
  )
}

export default function Page() {
  return (
    <RoleProvider>
      <MainContent />
    </RoleProvider>
  )
}
