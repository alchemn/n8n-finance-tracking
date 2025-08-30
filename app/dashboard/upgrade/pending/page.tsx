"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, RefreshCw, ArrowLeft } from "lucide-react"

export default function UpgradePendingPage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Pending Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-yellow-100 rounded-full p-3">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Pending</h1>
          <p className="text-gray-600 mt-2">Your payment is being processed. Please wait for confirmation.</p>
        </div>

        {/* Pending Alert */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Your payment is currently being processed. This usually takes a few minutes, but can take up to 24 hours
            depending on your payment method.
          </AlertDescription>
        </Alert>

        {/* Pending Card */}
        <Card>
          <CardHeader>
            <CardTitle>What's happening?</CardTitle>
            <CardDescription>Your payment is being verified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1">
                  <span className="block w-6 h-6 text-center text-sm font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Payment Submitted</h4>
                  <p className="text-sm text-gray-600">Your payment has been submitted successfully.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 rounded-full p-1">
                  <span className="block w-6 h-6 text-center text-sm font-bold text-yellow-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Processing Payment</h4>
                  <p className="text-sm text-gray-600">Your bank or payment provider is verifying the transaction.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-gray-100 rounded-full p-1">
                  <span className="block w-6 h-6 text-center text-sm font-bold text-gray-400">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-400">Upgrade Account</h4>
                  <p className="text-sm text-gray-400">Once confirmed, your account will be upgraded to Pro.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">What to expect:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• You'll receive an email confirmation once payment is processed</li>
                <li>• Your account will be automatically upgraded to Pro</li>
                <li>• All Pro features will become available immediately</li>
                <li>• If payment fails, you'll be notified and can try again</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => router.push("/dashboard")} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Questions?</CardTitle>
            <CardDescription className="text-blue-700">We're here to help</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">
              If your payment has been pending for more than 24 hours, please contact our support team.
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
