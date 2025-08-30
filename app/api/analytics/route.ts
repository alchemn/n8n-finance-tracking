import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/database/connection"
import { Transaction } from "@/lib/database/models/Transaction"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "monthly" // daily, weekly, monthly

    const now = new Date()
    let startDate: Date
    const endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        break
      case "weekly":
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
        startDate.setHours(0, 0, 0, 0)
        break
      case "monthly":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
        break
    }

    const transactions = await Transaction.find({
      userId: session.user.id,
      date: { $gte: startDate, $lte: endDate },
    }).populate("categoryId", "name icon color")

    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const categoryTotals = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc: any, transaction) => {
        const categoryId = transaction.categoryId._id.toString()
        const category = transaction.categoryId

        if (!acc[categoryId]) {
          acc[categoryId] = {
            category: {
              id: category._id,
              name: category.name,
              icon: category.icon,
              color: category.color,
            },
            total: 0,
            count: 0,
          }
        }

        acc[categoryId].total += transaction.amount
        acc[categoryId].count += 1

        return acc
      }, {})

    const categoryBreakdown = Object.values(categoryTotals).sort((a: any, b: any) => b.total - a.total)

    const insights = []
    if (categoryBreakdown.length > 0) {
      const topCategory = categoryBreakdown[0] as any
      insights.push(
        `Your highest spending category is ${topCategory.category.name} at $${topCategory.total.toFixed(2)}`,
      )

      if (period === "monthly" && totalExpenses > 0) {
        const dailyAverage = totalExpenses / now.getDate()
        insights.push(`Your daily average spending this month is $${dailyAverage.toFixed(2)}`)
      }

      if (totalIncome > totalExpenses) {
        const savings = totalIncome - totalExpenses
        insights.push(`Great job! You saved $${savings.toFixed(2)} this ${period.replace("ly", "")}`)
      } else if (totalExpenses > totalIncome) {
        const overspend = totalExpenses - totalIncome
        insights.push(`You spent $${overspend.toFixed(2)} more than your income this ${period.replace("ly", "")}`)
      }
    }

    return NextResponse.json({
      period,
      startDate,
      endDate,
      totalExpenses,
      totalIncome,
      netAmount: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      categoryBreakdown,
      insights,
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}