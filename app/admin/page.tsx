"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { AdminLayout } from "@/components/admin/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Crown, DollarSign, TrendingUp, TrendingDown, BarChart3, FileText, Activity } from "lucide-react"

interface AdminAnalytics {
  overview: {
    totalUsers: number
    proUsers: number
    freeUsers: number
    proPercentage: string
    newUsersThisMonth: number
    newUsersLastMonth: number
    userGrowthRate: string
  }
  revenue: {
    monthlyRevenue: number
    annualRevenue: number
    averageRevenuePerUser: string
  }
  transactions: {
    totalTransactions: number
    transactionsThisMonth: number
    totalExpenses: number
    totalIncome: number
    totalVolume: number
  }
  reports: {
    totalReports: number
    reportsThisMonth: number
  }
  topCategories: Array<{
    _id: string
    total: number
    count: number
    icon: string
  }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [session])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics", {
        headers: {
          "Content-Type": "application/json",
          // NextAuth automatically handles authentication via cookies
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching admin analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">Overview platform FinanceTracker Pro Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover border-0 shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analytics.overview.totalUsers.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                {Number.parseFloat(analytics.overview.userGrowthRate) >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span>{analytics.overview.userGrowthRate}% dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pro Users</CardTitle>
              <div className="p-2 bg-accent/10 rounded-lg">
                <Crown className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{analytics.overview.proUsers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {analytics.overview.proPercentage}% dari total users
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Bulanan</CardTitle>
              <div className="p-2 bg-success/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(analytics.revenue.monthlyRevenue)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(analytics.revenue.annualRevenue)} tahunan
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transaksi</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analytics.transactions.totalTransactions.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {analytics.transactions.transactionsThisMonth} bulan ini
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-hover border-0 shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                Breakdown Subscription User
              </CardTitle>
              <CardDescription>Distribusi free vs pro users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Crown className="h-4 w-4 text-accent" />
                    </div>
                    <span className="font-medium text-foreground">Pro Users</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{analytics.overview.proUsers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{analytics.overview.proPercentage}%</div>
                  </div>
                </div>
                <Progress value={Number.parseFloat(analytics.overview.proPercentage)} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">Free Users</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{analytics.overview.freeUsers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {(100 - Number.parseFloat(analytics.overview.proPercentage)).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <Progress value={100 - Number.parseFloat(analytics.overview.proPercentage)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <div className="p-2 bg-success/10 rounded-lg mr-3">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                Metrik Revenue
              </CardTitle>
              <CardDescription>Overview performa finansial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {formatCurrency(analytics.revenue.monthlyRevenue)}
                  </div>
                  <div className="text-sm text-success/80 mt-1">Revenue Bulanan</div>
                </div>
                <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{analytics.revenue.averageRevenuePerUser}</div>
                  <div className="text-sm text-primary/80 mt-1">ARPU</div>
                </div>
              </div>
              <div className="text-center p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <div className="text-2xl font-bold text-accent">{formatCurrency(analytics.revenue.annualRevenue)}</div>
                <div className="text-sm text-accent/80 mt-1">Proyeksi Revenue Tahunan</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-hover border-0 shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              Top Kategori Pengeluaran
            </CardTitle>
            <CardDescription>Kategori pengeluaran paling populer di semua users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCategories.slice(0, 8).map((category, index) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{category._id}</div>
                      <div className="text-sm text-muted-foreground">{category.count} transaksi</div>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <div>
                      <div className="font-semibold text-foreground">{formatCurrency(category.total)}</div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${index < 3 ? "bg-primary/10 text-primary" : "bg-muted"}`}
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-hover border-0 shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volume Transaksi</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(analytics.transactions.totalVolume)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total diproses</div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Laporan Dibuat</CardTitle>
              <div className="p-2 bg-accent/10 rounded-lg">
                <FileText className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analytics.reports.totalReports.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{analytics.reports.reportsThisMonth} bulan ini</div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">User Baru</CardTitle>
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analytics.overview.newUsersThisMonth}</div>
              <div className="text-xs text-muted-foreground mt-1">Bulan ini</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
