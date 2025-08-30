import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/database/connection"
import { User } from "@/lib/database/models/User"
import { Report } from "@/lib/database/models/Report"
import { Transaction } from "@/lib/database/models/Transaction"
import { n8nClient } from "@/lib/n8n/client"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.subscriptionStatus !== "pro") {
      return NextResponse.json({ error: "Report generation is only for Pro users" }, { status: 403 })
    }

    const { reportType, startDate, endDate, deliveryMethod } = await request.json()

    if (!reportType || !deliveryMethod || (reportType === 'custom' && (!startDate || !endDate))) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Determine date range
    let finalStartDate: Date, finalEndDate: Date
    const now = new Date();

    if (reportType === 'custom') {
        finalStartDate = new Date(startDate)
        finalEndDate = new Date(endDate)
    } else {
        finalEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        switch(reportType) {
            case 'daily':
                finalStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                break;
            case 'weekly':
                const dayOfWeek = now.getDay();
                finalStartDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
                finalStartDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                finalStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                break;
        }
    }

    const transactions = await Transaction.find({
      userId: session.user.id,
      date: { $gte: finalStartDate, $lte: finalEndDate },
    }).populate("categoryId", "name icon color")

    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const report = await Report.create({
      userId: session.user.id,
      reportType,
      startDate: finalStartDate,
      endDate: finalEndDate,
      status: "pending",
      sentVia: deliveryMethod,
    })

    const reportData = {
      reportId: report._id.toString(),
      user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          reportPreference: user.reportPreference
      },
      reportType,
      startDate: finalStartDate.toISOString(),
      endDate: finalEndDate.toISOString(),
      deliveryMethod,
      analytics: { // This can be simplified if n8n recalculates it
        totalExpenses,
        totalIncome,
        netAmount: totalIncome - totalExpenses,
        transactionCount: transactions.length,
        // You might want to pass more data here
      },
    }

    // Trigger n8n webhook asynchronously
    n8nClient.triggerReportGeneration(reportData).catch(console.error)

    return NextResponse.json({
      message: "Report generation initiated successfully. It will be delivered shortly.",
      reportId: report._id,
    })

  } catch (error: any) {
    console.error("Generate report error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}