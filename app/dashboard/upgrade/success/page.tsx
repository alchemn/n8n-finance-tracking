"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, Loader2 } from "lucide-react"

export default function UpgradeSuccessPage() {
  const { status, update: updateSession } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      // The session might already be updated by the webhook, but an explicit update ensures UI consistency.
      updateSession({ subscriptionStatus: "pro" })
    }
  }, [status, updateSession])

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Finalizing Your Upgrade...</h1>
          <p className="text-gray-600">Activating your Pro features.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Pro!</h1>
          <p className="text-gray-600 mt-2">Your upgrade was successful and all Pro features are now active</p>
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Crown className="h-6 w-6 text-amber-500 mr-2" />
              Congratulations!
            </CardTitle>
            <CardDescription className="text-center">You now have access to all premium features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge className="bg-blue-600 text-white px-4 py-2">
                <Crown className="h-4 w-4 mr-1" />
                Pro Member
              </Badge>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">What's new for you:</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Daily and weekly analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Advanced spending insights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Automated report generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Email & WhatsApp report delivery</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Priority customer support</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => router.push("/dashboard")} className="flex-1">
                Explore Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/analytics")} className="flex-1">
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}