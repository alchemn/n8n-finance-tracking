import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/database/connection"
import { User } from "@/lib/database/models/User"

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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const subscriptionStatus = searchParams.get("subscriptionStatus")

    const query: any = {}
    if (subscriptionStatus && subscriptionStatus !== "all") {
      query.subscriptionStatus = subscriptionStatus
    }

    const skip = (page - 1) * limit
    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const totalUsers = await User.countDocuments(query)
    const totalPages = Math.ceil(totalUsers / limit)

    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$subscriptionStatus",
          count: { $sum: 1 },
        },
      },
    ])

    const stats = {
      total: totalUsers,
      free: userStats.find((s) => s._id === "free")?.count || 0,
      pro: userStats.find((s) => s._id === "pro")?.count || 0,
    }

    const monthlyRevenue = stats.pro * 9.99
    const annualRevenue = monthlyRevenue * 12

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: {
        ...stats,
        proPercentage: totalUsers > 0 ? ((stats.pro / totalUsers) * 100).toFixed(1) : "0",
        monthlyRevenue,
        annualRevenue,
      },
    })
  } catch (error) {
    console.error("Get admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}