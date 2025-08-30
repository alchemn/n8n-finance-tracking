import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, Shield, Zap, ArrowRight, Star, DollarSign, PieChart, Bell } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-green-900/10 dark:to-gray-800">
      <header className="container mx-auto px-4 py-6 sticky top-0 z-50 glass-effect">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">FinanceTracker</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <section className="container mx-auto px-4 py-16 lg:py-24 text-center animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 px-4 py-2 shadow-lg">
              <Star className="h-4 w-4 mr-2" />
              Dipercaya 10,000+ pengguna Indonesia
            </Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Kelola Keuangan dengan
            <span className="gradient-text block sm:inline"> Insight Cerdas</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Lacak pengeluaran, analisis pola spending, dan dapatkan laporan keuangan personal yang dikirim langsung ke
            email atau WhatsApp Anda. Ambil kontrol masa depan finansial Anda hari ini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button
                size="lg"
                className="text-lg px-8 py-4 btn-primary shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Mulai Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-2 hover:bg-primary/5 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-primary" />
              Keamanan tingkat bank
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-accent" />
              Insight real-time
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-success" />
              Tanpa setup ribet
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Semua yang Anda Butuhkan untuk Mengelola Uang
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dari tracking pengeluaran dasar hingga insight keuangan advanced, kami punya tools yang powerful untuk Anda.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group card-hover border-0 shadow-lg bg-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:scale-110 transition-transform">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Smart Categorization</CardTitle>
              <CardDescription className="text-base">
                Kategorisasi otomatis pengeluaran Anda dengan AI yang cerdas dan akurat
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group card-hover border-0 shadow-lg bg-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit group-hover:scale-110 transition-transform">
                <PieChart className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-xl">Advanced Analytics</CardTitle>
              <CardDescription className="text-base">
                Dapatkan insight detail dengan laporan harian, mingguan, dan bulanan plus trend analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group card-hover border-0 shadow-lg bg-card sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-success/10 rounded-full w-fit group-hover:scale-110 transition-transform">
                <Bell className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-xl">Multi-Channel Reports</CardTitle>
              <CardDescription className="text-base">
                Terima laporan keuangan via email atau WhatsApp dengan penjadwalan otomatis
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="bg-gradient-to-br from-card to-primary/5 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Pilih Paket Anda</h2>
            <p className="text-lg text-muted-foreground">Mulai gratis, upgrade ketika butuh fitur lebih</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-hover border-0 shadow-lg bg-background">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-2xl">
                  Free Plan
                  <Badge variant="secondary" className="text-lg px-4 py-2 bg-muted">
                    Gratis
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base">Perfect untuk memulai tracking dasar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <span>Ringkasan pengeluaran bulanan</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <span>Tracking kategori dasar</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <span>Dashboard mobile responsive</span>
                </div>
                <div className="pt-4">
                  <Link href="/register">
                    <Button variant="outline" className="w-full bg-transparent hover:bg-primary/5">
                      Mulai Gratis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 card-hover shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg">
                  Paling Populer
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-2xl">
                  Pro Plan
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 text-lg px-4 py-2 shadow-lg">
                    Rp 150.000/bulan
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base">
                  Untuk tracking keuangan serius dan insight mendalam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <span>Laporan harian, mingguan & bulanan</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <span>Advanced spending insights & trends</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <span>Generate laporan otomatis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <span>Kirim via Email & WhatsApp</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <span>Priority support & konsultasi</span>
                </div>
                <div className="pt-4">
                  <Link href="/register">
                    <Button className="w-full btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      Mulai Pro Trial
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">FinanceTracker</span>
            </div>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              Memberdayakan individu dan bisnis untuk membuat keputusan keuangan yang lebih cerdas melalui tracking dan
              insight yang intelligent.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-green-200 mb-8">
              <span>© 2024 FinanceTracker. All rights reserved.</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
