"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Crown, Loader2, Star, Zap, BarChart3, FileText, Smartphone } from "lucide-react"

export default function UpgradePage() {
  const { data: session, status } = useSession()
  const user = session?.user
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const handleUpgrade = async () => {
    if (user?.subscriptionStatus === "pro") {
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/payments/create-token", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment")
      }

      // Redirect to Midtrans payment page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setError("Could not get payment page URL. Please try again.")
        setLoading(false)
      }

    } catch (error: any) {
      setError(error.message || "Failed to initiate payment")
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (user?.subscriptionStatus === "pro") {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-12 w-12 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">You're Already Pro!</h1>
            <p className="text-gray-600 mt-2">You have access to all premium features</p>
          </div>

          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="p-6 text-center">
              <Badge className="bg-amber-500 text-white mb-4">
                <Crown className="h-3 w-3 mr-1" />
                Pro Member
              </Badge>
              <p className="text-gray-700">
                Thank you for being a Pro subscriber! You have access to all advanced features including daily and
                weekly analytics, automated reports, and priority support.
              </p>
              <Button className="mt-4" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Upgrade to Pro</h1>
          <p className="text-gray-600 mt-2">Unlock advanced features and take control of your finances</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pricing Card */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current Plan
                <Badge variant="secondary">Free</Badge>
              </CardTitle>
              <CardDescription>What you have now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                Gratis<span className="text-lg text-gray-500">/bulan</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Monthly spending summary</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Basic category tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Mobile responsive dashboard</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-4 py-1">
                <Star className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pro Plan
                <Badge className="bg-blue-600 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </CardTitle>
              <CardDescription>Everything you need for advanced financial tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-blue-600">
                Rp 150.000<span className="text-lg text-gray-500">/bulan</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Everything in Free, plus:</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span>Daily & weekly analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span>Advanced spending insights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Automated report generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  <span>Email & WhatsApp delivery</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-blue-600" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button
                onClick={handleUpgrade}
                disabled={loading || status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting to Payment...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
