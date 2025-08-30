"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileText,
  Plus,
  Download,
  Mail,
  Smartphone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Crown,
} from "lucide-react"
import Link from "next/link"

interface Report {
  _id: string
  reportType: "daily" | "weekly" | "monthly" | "custom"
  startDate: string
  endDate: string
  status: "pending" | "generated" | "sent" | "failed"
  sentVia: "email" | "whatsapp"
  reportUrl?: string
  createdAt: string
  generatedAt?: string
  sentAt?: string
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const user = session?.user
  const router = useRouter()

  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    reportType: "monthly" as "daily" | "weekly" | "monthly" | "custom",
    startDate: "",
    endDate: "",
    deliveryMethod: "email" as "email" | "whatsapp",
  })

  useEffect(() => {
    if (status === "authenticated" && user?.subscriptionStatus === "pro") {
      fetchReports()
    }
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (status !== "loading") {
        setLoading(false)
    }
  }, [status, user])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports")
      if (response.status === 401) {
        signOut({ callbackUrl: "/login" })
        return
      }
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const handleGenerateReport = async () => {
    setError("")
    setSuccess("")
    setGenerating(true)

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.status === 401) {
        signOut({ callbackUrl: "/login" })
        return
      }

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Report generation initiated! ${data.message}`)
        setDialogOpen(false)
        fetchReports()
        setFormData({
          reportType: "monthly",
          startDate: "",
          endDate: "",
          deliveryMethod: "email",
        })
      } else {
        setError(data.error || "Failed to generate report")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/download/${reportId}`)
      if (response.status === 401) {
        signOut({ callbackUrl: "/login" })
        return
      }

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `financial-report-${reportId}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error downloading report:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "generated":
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "generated":
      case "sent":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (user?.subscriptionStatus !== "pro") {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Pro Feature</h1>
            <p className="text-gray-600 mt-2">Report generation is available for Pro subscribers only</p>
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
              <p className="text-gray-700 mb-4">
                Get automated financial reports delivered to your email or WhatsApp with detailed insights and
                analytics.
              </p>
              <Link href="/dashboard/upgrade">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">Generate and manage your automated financial reports</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>Create a financial report with your preferred settings</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select
                    value={formData.reportType}
                    onValueChange={(value: "daily" | "weekly" | "monthly" | "custom") =>
                      setFormData((prev) => ({ ...prev, reportType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Report</SelectItem>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                      <SelectItem value="custom">Custom Date Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.reportType === "custom" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="deliveryMethod">Delivery Method</Label>
                  <Select
                    value={formData.deliveryMethod}
                    onValueChange={(value: "email" | "whatsapp") =>
                      setFormData((prev) => ({ ...prev, deliveryMethod: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center">
                          <Smartphone className="h-4 w-4 mr-2" />
                          WhatsApp
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.deliveryMethod === "whatsapp" && !user?.phoneNumber && (
                  <Alert>
                    <AlertDescription>
                      Please add a phone number in your profile settings to receive WhatsApp reports.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={generating || (formData.deliveryMethod === "whatsapp" && !user?.phoneNumber)}
                    className="flex-1"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={generating}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Your Reports
            </CardTitle>
            <CardDescription>View and download your generated financial reports</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                <p className="text-gray-600 mb-4">Generate your first financial report to get started</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Type</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="capitalize">{report.reportType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(report.startDate)} - {formatDate(report.endDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {report.sentVia === "email" ? (
                              <Mail className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Smartphone className="h-4 w-4 text-green-600" />
                            )}
                            <span className="capitalize">{report.sentVia}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(report.status)}
                              <span className="capitalize">{report.status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(report.createdAt)}</TableCell>
                        <TableCell>
                          {(report.status === "generated" || report.status === "sent") && (
                            <Button variant="outline" size="sm" onClick={() => handleDownload(report._id)}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">About Financial Reports</h3>
                <p className="text-blue-800 text-sm mb-3">
                  Our automated reports provide comprehensive insights into your spending patterns, category breakdowns,
                  and financial trends. Reports are generated using n8n workflows and delivered to your preferred
                  channel.
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Detailed spending analysis and category breakdowns</li>
                  <li>• Personalized insights and recommendations</li>
                  <li>• Delivery via email or WhatsApp</li>
                  <li>• Downloadable HTML format for offline viewing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}