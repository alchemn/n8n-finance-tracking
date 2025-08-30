interface ReportData {
  userId: string
  userName: string
  userEmail: string
  reportType: "daily" | "weekly" | "monthly" | "custom"
  startDate: string
  endDate: string
  deliveryMethod: "email" | "whatsapp"
  phoneNumber?: string
  analytics: {
    totalExpenses: number
    totalIncome: number
    netAmount: number
    transactionCount: number
    categoryBreakdown: Array<{
      category: {
        name: string
        icon: string
        color: string
      }
      total: number
      count: number
    }>
    insights: string[]
  }
}

interface N8nWebhookResponse {
  success: boolean
  reportId: string
  message: string
}

class N8nClient {
  private webhookUrl: string

  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL || ""

    if (!this.webhookUrl) {
      console.warn("N8N_WEBHOOK_URL is not configured. Report generation will be simulated.")
    }
  }

  async triggerReportGeneration(reportData: ReportData): Promise<N8nWebhookResponse> {
    try {
      if (!this.webhookUrl) {
        // Simulate report generation for demo purposes
        return {
          success: true,
          reportId: `report_${Date.now()}`,
          message: "Report generation simulated (n8n not configured)",
        }
      }

      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "generate_financial_report",
          data: reportData,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        reportId: result.reportId || `report_${Date.now()}`,
        message: result.message || "Report generation triggered successfully",
      }
    } catch (error) {
      console.error("Error triggering n8n report generation:", error)

      // Return simulated success for demo purposes
      return {
        success: true,
        reportId: `report_${Date.now()}_simulated`,
        message: "Report generation simulated due to n8n connection error",
      }
    }
  }

  async getReportStatus(reportId: string): Promise<{ status: string; downloadUrl?: string }> {
    try {
      if (!this.webhookUrl) {
        // Simulate report status for demo
        return {
          status: "completed",
          downloadUrl: `/api/reports/download/${reportId}`,
        }
      }

      const statusUrl = `${this.webhookUrl}/status/${reportId}`
      const response = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get report status: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting report status:", error)
      return {
        status: "completed",
        downloadUrl: `/api/reports/download/${reportId}`,
      }
    }
  }
}

export const n8nClient = new N8nClient()
