"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LogIn, 
  UserPlus, 
  Store, 
  GraduationCap, 
  Shield, 
  ArrowRight, 
  Mail, 
  Lock, 
  User,
  ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import { UMKMRegistrationForm } from "@/components/umkm-registration-form"
import { useRole } from "@/lib/role-context"

type AuthMode = "signin" | "signup-choice" | "signup-account" | "signup-umkm"

export function AuthView({ onLogin }: { onLogin: (userData: any) => void }) {
  const [mode, setMode] = useState<AuthMode>("signin")
  const [isLoading, setIsLoading] = useState(false)
  const { setRole } = useRole()

  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({ 
    fullName: "", 
    email: "", 
    password: "", 
    role: "customer" 
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Direct integration to local Next.js API
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      if (!response.ok) {
        throw new Error("Email atau password salah")
      }

      const data = await response.json()
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      toast.success("Login berhasil!")
      onLogin(data.user) 
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          full_name: signupData.fullName,
          role: signupData.role,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Gagal mendaftar")
      }

      toast.success("Registrasi berhasil! Silakan login.")
      setMode("signin")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-accent/10">
      <div className="w-full max-w-[450px]">
        <AnimatePresence mode="wait">
          {mode === "signin" && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-background/80 backdrop-blur-xl border border-white/20 p-0 gap-0">
                <CardHeader className="space-y-1 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground pb-10 pt-8 px-8 relative overflow-hidden rounded-t-[2.5rem]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full -ml-12 -mb-12 blur-xl" />
                  <CardTitle className="text-4xl font-extrabold flex items-center gap-3 relative z-10 tracking-tight">
                    <LogIn className="h-8 w-8" />
                    Sign In
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Masuk ke platform UMKM IPB
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-10 space-y-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="nim@apps.ipb.ac.id" 
                          className="pl-10 rounded-2xl"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          className="pl-10 rounded-2xl"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full rounded-2xl py-7 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]" disabled={isLoading}>
                      {isLoading ? "Memproses..." : "Masuk ke Akun"}
                    </Button>
                  </form>
                  <div className="text-center">
                    <button 
                      onClick={() => setMode("signup-choice")}
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      Belum punya akun? Daftar sekarang
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {mode === "signup-choice" && (
            <motion.div
              key="signup-choice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold">Pilih Tipe Akun</h2>
                <p className="text-muted-foreground">Sesuaikan dengan kebutuhan Anda di platform</p>
              </div>
              
              <div 
                onClick={() => setMode("signup-account")}
                className="group p-8 bg-card/60 backdrop-blur-md border border-primary/10 rounded-[2.5rem] cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-all">
                    <UserPlus className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold tracking-tight">Sign Up Account</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Pilih role sebagai Mahasiswa atau Admin</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-primary group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              <div 
                onClick={() => setMode("signup-umkm")}
                className="group p-8 bg-card/60 backdrop-blur-md border border-accent/10 rounded-[2.5rem] cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shadow-lg shadow-accent/20 group-hover:-rotate-6 transition-all">
                    <Store className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold tracking-tight">Daftar UMKM</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Daftarkan bisnis Anda dan mulai berjualan</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-accent group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => setMode("signin")}
                className="w-full gap-2 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali ke Login
              </Button>
            </motion.div>
          )}

          {mode === "signup-account" && (
            <motion.div
              key="signup-account"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-background/80 backdrop-blur-xl border border-white/20 p-0 gap-0">
                <CardHeader className="space-y-1 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground pb-10 pt-8 px-8 relative overflow-hidden rounded-t-[2.5rem]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full -ml-12 -mb-12 blur-xl" />
                  <CardTitle className="text-3xl font-extrabold flex items-center gap-3 relative z-10 tracking-tight">
                    <UserPlus className="h-8 w-8" />
                    Buat Akun
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/80 relative z-10">
                    Bergabung dengan ekosistem UMKM IPB
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-8 space-y-6">
                  <form onSubmit={handleSignupAccount} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input 
                        id="fullName" 
                        placeholder="Budi Santoso" 
                        className="rounded-xl"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="nim@apps.ipb.ac.id" 
                        className="rounded-xl"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        className="rounded-xl"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-2xl py-7 text-lg font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                      {isLoading ? "Mendaftar..." : "Buat Akun Sekarang"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button variant="ghost" onClick={() => setMode("signup-choice")} className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {mode === "signup-umkm" && (
            <motion.div
              key="signup-umkm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-card/80 backdrop-blur-md border border-border rounded-[2.5rem] shadow-2xl p-10"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => setMode("signup-choice")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-bold">Pendaftaran UMKM Baru</h2>
                  <p className="text-sm text-muted-foreground">Lengkapi data untuk mulai berjualan di kampus</p>
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-2xl mb-6 border border-primary/10">
                <p className="text-sm">
                  <strong>Catatan:</strong> Dengan mendaftarkan UMKM, Anda secara otomatis akan membuat akun dengan role <strong>Pemilik UMKM</strong>.
                </p>
              </div>

              <UMKMRegistrationForm 
                onCancel={() => setMode("signup-choice")}
                onSubmit={(data) => {
                  toast.success("Pendaftaran UMKM terkirim! Silakan tunggu konfirmasi admin.")
                  setMode("signin")
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
