"use client"

import { useState } from "react"
import { useRole } from "@/lib/role-context"
import { useData } from "@/lib/data-context"
import { UMKMRegistrationForm } from "@/components/umkm-registration-form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import type { UMKM } from "@/lib/mock-data"

type ViewState = "intro" | "form" | "success"

export function UMKMRegistrationView() {
  const { setRole } = useRole()
  const [viewState, setViewState] = useState<ViewState>("intro")

  const handleStartRegistration = () => {
    setViewState("form")
  }

  const handleCancelRegistration = () => {
    setViewState("intro")
  }

  const handleFormSubmit = (formData: Omit<UMKM, "id" | "isApproved" | "isPending" | "rating" | "createdAt">) => {
    // Here we would normally submit to an API
    // For now, we'll just show success state
    setViewState("success")

    // Auto-redirect to homepage after 3 seconds
    setTimeout(() => {
      setRole("mahasiswa")
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => setRole("mahasiswa")}
            className="gap-2 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {viewState === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">
                Daftar UMKM Anda di{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  UMKM IPB
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Jangkau mahasiswa IPB dengan produk dan layanan terbaik Anda. Pendaftaran gratis dan mudah!
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full p-6 border-0 shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  size="lg"
                  onClick={handleStartRegistration}
                  className="rounded-xl h-12 px-8 text-base gap-2 shadow-lg hover:shadow-xl"
                >
                  Mulai Pendaftaran
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </motion.div>
            </div>

            {/* How It Works */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Bagaimana Cara Kerjanya?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                      </div>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-5 w-0.5 h-20 bg-gradient-to-b from-primary to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {viewState === "form" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <UMKMRegistrationForm
              onSubmit={handleFormSubmit}
              onCancel={handleCancelRegistration}
            />
          </motion.div>
        )}

        {viewState === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Pendaftaran Berhasil!</h2>
              <p className="text-muted-foreground max-w-md">
                Terima kasih telah mendaftar di UMKM IPB. Kami akan meninjau data Anda dan menghubungi dalam 1-2 hari kerja.
              </p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Mengalihkan kembali ke beranda dalam beberapa detik...
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

const features = [
  {
    icon: () => <span>🚀</span>,
    title: "Jangkau Mahasiswa",
    description: "Tampilkan produk Anda kepada ribuan mahasiswa IPB yang aktif berbelanja",
  },
  {
    icon: () => <span>💰</span>,
    title: "Tingkatkan Penjualan",
    description: "Kelola pesanan, inventori, dan transaksi dengan mudah melalui dashboard",
  },
  {
    icon: () => <span>✅</span>,
    title: "Verifikasi Aman",
    description: "Semua UMKM diverifikasi untuk memastikan kualitas dan kepercayaan",
  },
]

const steps = [
  {
    title: "Isi Formulir Pendaftaran",
    description: "Berikan informasi lengkap tentang UMKM Anda, termasuk detail bisnis dan dokumen",
  },
  {
    title: "Tunggu Verifikasi Admin",
    description: "Admin kami akan meninjau data Anda untuk memastikan kelengkapan dan keaslian",
  },
  {
    title: "Mulai Berjualan",
    description: "Setelah disetujui, Anda dapat mengelola menu, pesanan, dan bisnis Anda",
  },
]
