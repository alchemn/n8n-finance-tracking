"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Calendar,
  PieChart,
  Crown,
  FileText,
  ArrowUpRight,
  Plus,
} from "lucide-react"
import Link from "next/link"

interface AnalyticsData {
  period: string
  totalExpenses: number
  totalIncome: number
  netAmount: number
  transactionCount: number
  categoryBreakdown: Array<{
    category: {
      id: string
      name: string
      icon: string
      color: string
    }
    total: number
    count: number
  }>
  insights: string[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [monthlyData, setMonthlyData] = useState<AnalyticsData | null>(null)
  const [weeklyData, setWeeklyData] = useState<AnalyticsData | null>(null)
  const [dailyData, setDailyData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [session])

  const fetchAnalytics = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        // NextAuth automatically handles authentication via cookies
      }

      // Fetch monthly data (available for all users)
      const monthlyResponse = await fetch("/api/analytics?period=monthly", { headers })
      const monthlyResult = await monthlyResponse.json()
      setMonthlyData(monthlyResult)

      // Fetch weekly and daily data (Pro only)
      if (user?.subscriptionStatus === "pro") {
        const [weeklyResponse, dailyResponse] = await Promise.all([
          fetch("/api/analytics?period=weekly", { headers }),
          fetch("/api/analytics?period=daily", { headers }),
        ])

        const weeklyResult = await weeklyResponse.json()
        const dailyResult = await dailyResponse.json()

        setWeeklyData(weeklyResult)
        setDailyData(dailyResult)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Selamat datang, {user?.name}!</h1>
            <p className="text-muted-foreground text-lg">Berikut ringkasan keuangan Anda</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={user?.subscriptionStatus === "pro" ? "default" : "secondary"}
              className={`px-3 py-1 ${user?.subscriptionStatus === "pro" ? "bg-gradient-to-r from-primary to-accent text-white" : ""}`}
            >
              {user?.subscriptionStatus === "pro" && <Crown className="h-3 w-3 mr-1" />}
              {user?.subscriptionStatus === "pro" ? "Pro Plan" : "Free Plan"}
            </Badge>
            <Link href="/dashboard/add">
              <Button className="btn-primary shadow-lg hover:shadow-xl">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
            </Link>
          </div>
        </div>

        {/* Free Plan - Monthly Summary Only */}
        {user?.subscriptionStatus === "free" && monthlyData && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="card-hover border-0 shadow-lg bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pengeluaran Bulanan</CardTitle>
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{formatCurrency(monthlyData.totalExpenses)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{monthlyData.transactionCount} transaksi</p>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-lg bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pemasukan Bulanan</CardTitle>
                  <div className="p-2 bg-success/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{formatCurrency(monthlyData.totalIncome)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-lg bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Bersih</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${monthlyData.netAmount >= 0 ? "text-success" : "text-destructive"}`}
                  >
                    {formatCurrency(monthlyData.netAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {monthlyData.netAmount >= 0 ? "Tersimpan" : "Defisit"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="card-hover border-0 shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <PieChart className="h-5 w-5 text-primary" />
                  </div>
                  Pengeluaran per Kategori (Bulan Ini)
                </CardTitle>
                <CardDescription>Breakdown pengeluaran Anda untuk bulan berjalan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {monthlyData.categoryBreakdown?.slice(0, 5).map((item, index) => {
                    const percentage = (item.total / monthlyData.totalExpenses) * 100
                    return (
                      <div key={item.category.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-muted rounded-lg">
                              <span className="text-lg">{item.category.icon}</span>
                            </div>
                            <span className="font-medium text-foreground">{item.category.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">{formatCurrency(item.total)}</div>
                            <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-xl bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg mr-3">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  Unlock Fitur Advanced
                </CardTitle>
                <CardDescription>
                  Dapatkan insight harian dan mingguan, laporan otomatis, dan prediksi pengeluaran
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Fitur Pro meliputi:</p>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                        Analytics harian & mingguan
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                        Generate laporan otomatis
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                        Advanced spending insights
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                        Laporan via Email & WhatsApp
                      </li>
                    </ul>
                  </div>
                  <Link href="/dashboard/upgrade">
                    <Button size="lg" className="btn-primary shadow-lg hover:shadow-xl">
                      Upgrade ke Pro
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pro Plan - Full Analytics */}
        {user?.subscriptionStatus === "pro" && (
          <div className="space-y-8">
            <Tabs defaultValue="monthly" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
                <TabsTrigger value="daily" className="flex items-center data-[state=active]:bg-background">
                  <Calendar className="h-4 w-4 mr-2" />
                  Harian
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center data-[state=active]:bg-background">
                  <Calendar className="h-4 w-4 mr-2" />
                  Mingguan
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center data-[state=active]:bg-background">
                  <Calendar className="h-4 w-4 mr-2" />
                  Bulanan
                </TabsTrigger>
              </TabsList>

              {/* Daily Analytics */}
              <TabsContent value="daily" className="space-y-6 animate-slide-up">
                {dailyData && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card className="card-hover border-0 shadow-lg bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pengeluaran Hari Ini
                          </CardTitle>
                          <div className="p-2 bg-destructive/10 rounded-lg">
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-destructive">
                            {formatCurrency(dailyData.totalExpenses)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{dailyData.transactionCount} transaksi</p>
                        </CardContent>
                      </Card>

                      <Card className="card-hover border-0 shadow-lg bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pemasukan Hari Ini
                          </CardTitle>
                          <div className="p-2 bg-success/10 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-success" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-success">{formatCurrency(dailyData.totalIncome)}</div>
                        </CardContent>
                      </Card>

                      <Card className="card-hover border-0 shadow-lg bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Hari Ini</CardTitle>
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <DollarSign className="h-4 w-4 text-primary" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div
                            className={`text-2xl font-bold ${dailyData.netAmount >= 0 ? "text-success" : "text-destructive"}`}
                          >
                            {formatCurrency(dailyData.netAmount)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-accent/5 to-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Generate Laporan</CardTitle>
                          <div className="p-2 bg-accent/10 rounded-lg">
                            <FileText className="h-4 w-4 text-accent" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Link href="/dashboard/reports">
                            <Button size="sm" className="w-full btn-primary">
                              Buat Laporan
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>

                    {dailyData.insights && dailyData.insights.length > 0 && (
                      <Card className="card-hover border-0 shadow-lg bg-card">
                        <CardHeader>
                          <CardTitle className="text-foreground">Insight Harian</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {dailyData.insights.map((insight, index) => (
                              <li key={index} className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-muted-foreground">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Weekly Analytics */}
              <TabsContent value="weekly" className="space-y-6 animate-slide-up">
                {weeklyData && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Weekly Expenses</CardTitle>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(weeklyData.totalExpenses)}
                          </div>
                          <p className="text-xs text-muted-foreground">{weeklyData.transactionCount} transactions</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Weekly Income</CardTitle>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(weeklyData.totalIncome)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Net This Week</CardTitle>
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                          <div
                            className={`text-2xl font-bold ${weeklyData.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(weeklyData.netAmount)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Generate Report</CardTitle>
                          <FileText className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                          <Link href="/dashboard/reports">
                            <Button size="sm" className="w-full btn-primary">
                              Create Report
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>

                    {weeklyData.categoryBreakdown && weeklyData.categoryBreakdown.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Weekly Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {weeklyData.categoryBreakdown.slice(0, 5).map((item) => {
                              const percentage = (item.total / weeklyData.totalExpenses) * 100
                              return (
                                <div key={item.category.id} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-lg">{item.category.icon}</span>
                                      <span className="font-medium">{item.category.name}</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">{formatCurrency(item.total)}</div>
                                      <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                                    </div>
                                  </div>
                                  <Progress value={percentage} className="h-2" />
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Monthly Analytics */}
              <TabsContent value="monthly" className="space-y-6 animate-slide-up">
                {monthlyData && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(monthlyData.totalExpenses)}
                          </div>
                          <p className="text-xs text-muted-foreground">{monthlyData.transactionCount} transactions</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(monthlyData.totalIncome)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Net This Month</CardTitle>
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                          <div
                            className={`text-2xl font-bold ${monthlyData.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(monthlyData.netAmount)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Generate Report</CardTitle>
                          <FileText className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                          <Link href="/dashboard/reports">
                            <Button size="sm" className="w-full btn-primary">
                              Create Report
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>

                    {monthlyData.insights && monthlyData.insights.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {monthlyData.insights.map((insight, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {monthlyData.categoryBreakdown && monthlyData.categoryBreakdown.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {monthlyData.categoryBreakdown.map((item) => {
                              const percentage = (item.total / monthlyData.totalExpenses) * 100
                              return (
                                <div key={item.category.id} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-lg">{item.category.icon}</span>
                                      <span className="font-medium">{item.category.name}</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">{formatCurrency(item.total)}</div>
                                      <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                                    </div>
                                  </div>
                                  <Progress value={percentage} className="h-2" />
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
