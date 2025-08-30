"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react"

export default function UpgradeFailedPage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Failed Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Failed</h1>
          <p className="text-gray-600 mt-2">We couldn't process your payment. Please try again.</p>
        </div>

        {/* Error Alert */}
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Your payment could not be processed. This might be due to insufficient funds, an expired card, or a
            temporary issue with your payment method.
          </AlertDescription>
        </Alert>

        {/* Failed Card */}
        <Card>
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
            <CardDescription>Common reasons for payment failure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Insufficient funds in your account</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Expired or invalid payment method</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Bank security restrictions</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Temporary payment processing issue</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => router.push("/dashboard/upgrade")} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Need Help?</CardTitle>
            <CardDescription className="text-blue-700">We're here to assist you</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">
              If you continue to experience issues with your payment, please contact our support team. We'll help you
              resolve the issue quickly.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-blue-700">
                <strong>Email:</strong> support@financetracker.com
              </p>
              <p className="text-sm text-blue-700">
                <strong>Response time:</strong> Usually within 2 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
