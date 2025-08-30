import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/database/connection"
import { User } from "@/lib/database/models/User"
import { Transaction } from "@/lib/database/models/Transaction"
import { Report } from "@/lib/database/models/Report"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // In a real application, you would check for admin role here
  // if (session.user.role !== 'admin') {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  try {
    await connectDB()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const totalUsers = await User.countDocuments()
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    })
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    })

    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: "$subscriptionStatus",
          count: { $sum: 1 },
        },
      },
    ])

    const proUsers = subscriptionStats.find((s) => s._id === "pro")?.count || 0
    const freeUsers = subscriptionStats.find((s) => s._id === "free")?.count || 0

    const monthlyRevenue = proUsers * 9.99
    const annualRevenue = monthlyRevenue * 12

    const totalTransactions = await Transaction.countDocuments()
    const transactionsThisMonth = await Transaction.countDocuments({
      date: { $gte: startOfMonth },
    })

    const volumeStats = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ])

    const totalExpenses = volumeStats.find((s) => s._id === "expense")?.total || 0
    const totalIncome = volumeStats.find((s) => s._id === "income")?.total || 0

    const totalReports = await Report.countDocuments()
    const reportsThisMonth = await Report.countDocuments({
      createdAt: { $gte: startOfMonth },
    })

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    const topCategories = await Transaction.aggregate([
      {
        $match: { type: "expense" },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$category.name",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          icon: { $first: "$category.icon" },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $limit: 10,
      },
    ])

    return NextResponse.json({
      overview: {
        totalUsers,
        proUsers,
        freeUsers,
        proPercentage: totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : "0",
        newUsersThisMonth,
        newUsersLastMonth,
        userGrowthRate:
          newUsersLastMonth > 0
            ? (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1)
            : "0",
      },
      revenue: {
        monthlyRevenue,
        annualRevenue,
        averageRevenuePerUser: totalUsers > 0 ? (monthlyRevenue / totalUsers).toFixed(2) : "0",
      },
      transactions: {
        totalTransactions,
        transactionsThisMonth,
        totalExpenses,
        totalIncome,
        totalVolume: totalExpenses + totalIncome,
      },
      reports: {
        totalReports,
        reportsThisMonth,
      },
      userGrowth,
      topCategories,
    })
  } catch (error) {
    console.error("Get admin analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}