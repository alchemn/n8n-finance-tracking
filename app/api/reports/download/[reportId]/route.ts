import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/database/connection"
import { Report } from "@/lib/database/models/Report"
import { User } from "@/lib/database/models/User"
import { Transaction } from "@/lib/database/models/Transaction"

export async function GET(request: NextRequest, { params }: { params: { reportId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { reportId } = params

    const report = await Report.findById(reportId)
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    if (report.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await User.findById(session.user.id)
    const transactions = await Transaction.find({
      userId: session.user.id,
      date: { $gte: report.startDate, $lte: report.endDate },
    }).populate("categoryId", "name icon color")

    const reportHtml = generateReportHtml(user, report, transactions)

    return new NextResponse(reportHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="financial-report-${reportId}.html"`,
      },
    })
  } catch (error) {
    console.error("Download report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateReportHtml(user: any, report: any, transactions: any[]): string {
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const netAmount = totalIncome - totalExpenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Financial Report - ${user.name}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
            .summary-table td { padding: 10px; border: 1px solid #ddd; }
            .summary-table .label { font-weight: bold; background-color: #f8f9fa; }
            .transactions-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .transactions-table th, .transactions-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .transactions-table th { background-color: #f2f2f2; }
            .expense { color: #dc3545; }
            .income { color: #28a745; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Financial Report</h1>
            <h2>${user.name}</h2>
            <p>${formatDate(report.startDate)} - ${formatDate(report.endDate)}</p>
        </div>

        <h3>Ringkasan Keuangan</h3>
        <table class="summary-table">
            <tr><td class="label">Total Pemasukan</td><td class="income">${formatCurrency(totalIncome)}</td></tr>
            <tr><td class="label">Total Pengeluaran</td><td class="expense">${formatCurrency(totalExpenses)}</td></tr>
            <tr><td class="label">Saldo Bersih</td><td class="${netAmount >= 0 ? "income" : "expense"}">${formatCurrency(netAmount)}</td></tr>
            <tr><td class="label">Total Transaksi</td><td>${transactions.length}</td></tr>
        </table>

        <h3>Detail Transaksi</h3>
        <table class="transactions-table">
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Deskripsi</th>
                    <th>Kategori</th>
                    <th>Jumlah</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.map((t) => `
                    <tr>
                        <td>${formatDate(t.date)}</td>
                        <td>${t.description}</td>
                        <td>${t.categoryId.icon} ${t.categoryId.name}</td>
                        <td class="${t.type}">${t.type === "expense" ? "-" : "+"}${formatCurrency(t.amount)}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <div style="margin-top: 30px; text-align: center; color: #777; font-size: 12px;">
            <p>Laporan dibuat pada ${new Date().toLocaleDateString()}</p>
        </div>
    </body>
    </html>
  `
}