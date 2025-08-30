"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, TrendingDown, PieChart, Calendar, Crown, ArrowUpRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const user = session?.user
  const router = useRouter()

  const [monthlyData, setMonthlyData] = useState<AnalyticsData | null>(null)
  const [weeklyData, setWeeklyData] = useState<AnalyticsData | null>(null)
  const [dailyData, setDailyData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalytics()
    }
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch monthly data (available for all users)
      const monthlyResponse = await fetch("/api/analytics?period=monthly")
      if (monthlyResponse.status === 401) {
        signOut({ callbackUrl: "/login" })
        return
      }
      const monthlyResult = await monthlyResponse.json()
      setMonthlyData(monthlyResult)

      // Fetch weekly and daily data (Pro only)
      if (user?.subscriptionStatus === "pro") {
        const [weeklyResponse, dailyResponse] = await Promise.all([
          fetch("/api/analytics?period=weekly"),
          fetch("/api/analytics?period=daily"),
        ])

        if (weeklyResponse.status === 401 || dailyResponse.status === 401) {
          signOut({ callbackUrl: "/login" })
          return
        }

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
    if (typeof amount !== 'number' || isNaN(amount)) {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(0)
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }
  
  if (!user) {
      return null // Or a redirect, or a message
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Detailed insights into your financial data</p>
          </div>
          <Badge variant={user?.subscriptionStatus === "pro" ? "default" : "secondary"}>
            {user?.subscriptionStatus === "pro" && <Crown className="h-3 w-3 mr-1" />}
            {user?.subscriptionStatus === "pro" ? "Pro Plan" : "Free Plan"}
          </Badge>
        </div>

        {/* Free Plan - Limited Analytics */}
        {user?.subscriptionStatus === "free" && monthlyData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Monthly Overview
                </CardTitle>
                <CardDescription>Your financial summary for this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyData.totalExpenses)}</div>
                    <div className="text-sm text-red-700 dark:text-red-400">Total Expenses</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyData.totalIncome)}</div>
                    <div className="text-sm text-green-700 dark:text-green-400">Total Income</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div
                      className={`text-2xl font-bold ${monthlyData.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(monthlyData.netAmount)}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">Net Amount</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade CTA */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Unlock Advanced Analytics
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Get comprehensive insights with daily, weekly, and monthly breakdowns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100 mb-2">Pro analytics include:</p>
                    <ul className="text-sm text-blue-100 space-y-1">
                      <li>• Daily & weekly analytics</li>
                      <li>• Category trend analysis</li>
                      <li>• Spending predictions</li>
                      <li>• Advanced insights & recommendations</li>
                    </ul>
                  </div>
                  <Link href="/dashboard/upgrade">
                    <Button variant="secondary" size="lg">
                      Upgrade to Pro
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
          <Tabs defaultValue="monthly" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Monthly
              </TabsTrigger>
            </TabsList>

            {/* Daily Analytics */}
            <TabsContent value="daily" className="space-y-6">
              {dailyData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Today's Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
                          <span className="font-semibold text-red-600">{formatCurrency(dailyData.totalExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
                          <span className="font-semibold text-green-600">{formatCurrency(dailyData.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm font-medium">Net Amount</span>
                          <span className={`font-bold ${dailyData.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(dailyData.netAmount)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Transaction Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">{dailyData.transactionCount}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Transactions Today</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Top Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dailyData.categoryBreakdown && dailyData.categoryBreakdown.length > 0 ? (
                          <div className="text-center">
                            <div className="text-2xl mb-2">{dailyData.categoryBreakdown[0].category.icon}</div>
                            <div className="font-semibold">{dailyData.categoryBreakdown[0].category.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatCurrency(dailyData.categoryBreakdown[0].total)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 dark:text-gray-400">No expenses today</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {dailyData.insights && dailyData.insights.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {dailyData.insights.map((insight, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300">{insight}</span>
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
            <TabsContent value="weekly" className="space-y-6">
              {weeklyData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Weekly Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</span>
                          <span className="font-semibold text-red-600">{formatCurrency(weeklyData.totalExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Income</span>
                          <span className="font-semibold text-green-600">{formatCurrency(weeklyData.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Transactions</span>
                          <span className="font-semibold">{weeklyData.transactionCount}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm font-medium">Net Amount</span>
                          <span
                            className={`font-bold ${weeklyData.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(weeklyData.netAmount)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {weeklyData.categoryBreakdown && weeklyData.categoryBreakdown.slice(0, 4).map((item) => {
                            const percentage =
                              weeklyData.totalExpenses > 0 ? (item.total / weeklyData.totalExpenses) * 100 : 0
                            return (
                              <div key={item.category.id} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span>{item.category.icon}</span>
                                    <span>{item.category.name}</span>
                                  </div>
                                  <span className="font-medium">{formatCurrency(item.total)}</span>
                                </div>
                                <Progress value={percentage} className="h-1" />
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Monthly Analytics */}
            <TabsContent value="monthly" className="space-y-6">
              {monthlyData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(monthlyData.totalExpenses)}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {monthlyData.transactionCount} transactions
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(monthlyData.totalIncome)}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">This month</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div
                          className={`text-2xl font-bold ${monthlyData.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(monthlyData.netAmount)}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {monthlyData.netAmount >= 0 ? "Saved" : "Overspent"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(monthlyData.totalExpenses / new Date().getDate())}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Daily spending</p>
                      </CardContent>
                    </Card>
                  </div>

                  {monthlyData.categoryBreakdown && monthlyData.categoryBreakdown.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <PieChart className="h-5 w-5 mr-2" />
                          Monthly Category Analysis
                        </CardTitle>
                        <CardDescription>Detailed breakdown of your spending by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {monthlyData.categoryBreakdown.map((item) => {
                            const percentage = (item.total / monthlyData.totalExpenses) * 100
                            return (
                              <div key={item.category.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-xl">{item.category.icon}</span>
                                    <div>
                                      <div className="font-medium">{item.category.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.count} transactions
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold">{formatCurrency(item.total)}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {percentage.toFixed(1)}%
                                    </div>
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

                  {monthlyData.insights && monthlyData.insights.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Insights & Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {monthlyData.insights.map((insight, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}