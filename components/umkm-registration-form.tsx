"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, AlertCircle, CheckCircle2, Phone, Mail, Store, User, MapPin, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import type { UMKM } from "@/lib/mock-data"

interface UMKMRegistrationFormProps {
  onSubmit?: (formData: Omit<UMKM, "id" | "isApproved" | "isPending" | "rating" | "createdAt">) => void
  onCancel?: () => void
}

export function UMKMRegistrationForm({ onSubmit, onCancel }: UMKMRegistrationFormProps) {
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    ownerName: "",
    businessName: "",
    description: "",
    location: "",
    contactPhone: "",
    contactEmail: "",
    businessType: "",
    businessLicense: "",
    bankAccount: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNum === 1) {
      if (!formData.ownerName.trim()) newErrors.ownerName = "Nama pemilik harus diisi"
      if (!formData.businessName.trim()) newErrors.businessName = "Nama bisnis harus diisi"
      if (!formData.contactEmail.trim()) newErrors.contactEmail = "Email harus diisi"
      if (formData.contactEmail && !formData.contactEmail.includes("@")) newErrors.contactEmail = "Email tidak valid"
      if (!formData.contactPhone.trim()) newErrors.contactPhone = "No. telepon harus diisi"
    }

    if (stepNum === 2) {
      if (!formData.description.trim()) newErrors.description = "Deskripsi bisnis harus diisi"
      if (!formData.businessType) newErrors.businessType = "Jenis bisnis harus dipilih"
      if (!formData.location.trim()) newErrors.location = "Lokasi harus diisi"
    }

    if (stepNum === 3) {
      if (!formData.businessLicense.trim()) newErrors.businessLicense = "No. izin usaha harus diisi"
      if (!formData.bankAccount.trim()) newErrors.bankAccount = "No. rekening bank harus diisi"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(3)) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      if (onSubmit) {
        onSubmit({
          name: formData.businessName,
          description: formData.description,
          owner: formData.ownerName,
          location: formData.location,
          image: "/stores/default-store.jpg",
          menu: [],
        })
      }

      setSubmitted(true)
      toast.success("Pendaftaran UMKM berhasil!", {
        description: "Data Anda akan ditinjau oleh admin dalam 1-2 hari kerja.",
      })

      setTimeout(() => {
        setSubmitted(false)
        setStep(1)
        setFormData({
          ownerName: "",
          businessName: "",
          description: "",
          location: "",
          contactPhone: "",
          contactEmail: "",
          businessType: "",
          businessLicense: "",
          bankAccount: "",
        })
        if (onCancel) onCancel()
      }, 2000)

      setIsSubmitting(false)
    }, 1500)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6"
        >
          <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-2">Pendaftaran Berhasil!</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Terima kasih telah mendaftarkan UMKM Anda. Tim admin akan meninjau data Anda dalam waktu singkat.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  s <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-12 mx-2 transition-all ${
                    s < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {step === 1 && "Langkah 1: Informasi Pemilik"}
          {step === 2 && "Langkah 2: Detail Bisnis"}
          {step === 3 && "Langkah 3: Dokumen & Rekening"}
        </div>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 1 && "Informasi Pemilik UMKM"}
            {step === 2 && "Detail Bisnis Anda"}
            {step === 3 && "Dokumen & Informasi Perbankan"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Masukkan informasi pribadi pemilik bisnis"}
            {step === 2 && "Jelaskan detail dan lokasi bisnis Anda"}
            {step === 3 && "Lampirkan dokumen resmi dan rekening bank"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Owner Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Nama Pemilik
                  </label>
                  <Input
                    placeholder="Contoh: Budi Santoso"
                    value={formData.ownerName}
                    onChange={(e) => handleChange("ownerName", e.target.value)}
                    className={`rounded-xl ${errors.ownerName ? "border-destructive" : ""}`}
                  />
                  {errors.ownerName && (
                    <p className="text-sm text-destructive mt-1">{errors.ownerName}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <Store className="h-4 w-4 mr-2 text-primary" />
                    Nama Bisnis/UMKM
                  </label>
                  <Input
                    placeholder="Contoh: Warung Nasi Bakar Lezat"
                    value={formData.businessName}
                    onChange={(e) => handleChange("businessName", e.target.value)}
                    className={`rounded-xl ${errors.businessName ? "border-destructive" : ""}`}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive mt-1">{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Contoh: budi@email.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    className={`rounded-xl ${errors.contactEmail ? "border-destructive" : ""}`}
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-destructive mt-1">{errors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    No. Telepon
                  </label>
                  <Input
                    placeholder="Contoh: 0812-3456-7890"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                    className={`rounded-xl ${errors.contactPhone ? "border-destructive" : ""}`}
                  />
                  {errors.contactPhone && (
                    <p className="text-sm text-destructive mt-1">{errors.contactPhone}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Business Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Deskripsi Bisnis
                  </label>
                  <Textarea
                    placeholder="Jelaskan tentang bisnis Anda, produk/layanan yang ditawarkan, keunggulan, dll"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className={`rounded-xl min-h-[120px] ${
                      errors.description ? "border-destructive" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <Store className="h-4 w-4 mr-2 text-primary" />
                    Jenis Bisnis
                  </label>
                  <Select value={formData.businessType} onValueChange={(value) => handleChange("businessType", value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih jenis bisnis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="makanan">Makanan & Minuman</SelectItem>
                      <SelectItem value="fashion">Fashion & Pakaian</SelectItem>
                      <SelectItem value="elektronik">Elektronik</SelectItem>
                      <SelectItem value="kerajinan">Kerajinan & Seni</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.businessType && (
                    <p className="text-sm text-destructive mt-1">{errors.businessType}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    Lokasi Bisnis
                  </label>
                  <Input
                    placeholder="Contoh: Kantin Fakultas Pertanian, Kampus IPB"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className={`rounded-xl ${errors.location ? "border-destructive" : ""}`}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive mt-1">{errors.location}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Documents & Banking */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <Alert className="border-info/50 bg-info/5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Data Anda akan diverifikasi oleh admin sebelum akun diaktifkan. Pastikan semua informasi akurat.
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    No. Izin Usaha / NOPOL / NIB
                  </label>
                  <Input
                    placeholder="Contoh: 1234567890123456"
                    value={formData.businessLicense}
                    onChange={(e) => handleChange("businessLicense", e.target.value)}
                    className={`rounded-xl ${errors.businessLicense ? "border-destructive" : ""}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nomor dari surat izin usaha atau sertifikat bisnis Anda
                  </p>
                  {errors.businessLicense && (
                    <p className="text-sm text-destructive mt-1">{errors.businessLicense}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    No. Rekening Bank
                  </label>
                  <Input
                    placeholder="Contoh: 1234567890"
                    value={formData.bankAccount}
                    onChange={(e) => handleChange("bankAccount", e.target.value)}
                    className={`rounded-xl ${errors.bankAccount ? "border-destructive" : ""}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nomor rekening untuk pembayaran dari pembeli
                  </p>
                  {errors.bankAccount && (
                    <p className="text-sm text-destructive mt-1">{errors.bankAccount}</p>
                  )}
                </div>

                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Ringkasan Pendaftaran:</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Nama Pemilik:</span> <strong>{formData.ownerName}</strong></p>
                    <p><span className="text-muted-foreground">Nama Bisnis:</span> <strong>{formData.businessName}</strong></p>
                    <p><span className="text-muted-foreground">Email:</span> <strong>{formData.contactEmail}</strong></p>
                    <p><span className="text-muted-foreground">Lokasi:</span> <strong>{formData.location}</strong></p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="rounded-xl flex-1"
                  disabled={isSubmitting}
                >
                  Kembali
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl flex-1 gap-2"
                  disabled={isSubmitting}
                >
                  Lanjutkan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="rounded-xl flex-1 gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Mengirim..." : "Daftar Sekarang"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {step === 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  className="rounded-xl"
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
