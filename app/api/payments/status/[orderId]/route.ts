import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/database/connection"
import { User } from "@/lib/database/models/User"
import { midtransClient } from "@/lib/midtrans/client"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { orderId } = params

    const userIdMatch = orderId.match(/PRO-([a-f\d]{24})-\d+/)
    if (!userIdMatch || userIdMatch[1] !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const transactionStatus = await midtransClient.getTransactionStatus(orderId)

    const user = await User.findById(session.user.id).select("-password")

    return NextResponse.json({
      orderId,
      transactionStatus: transactionStatus.transaction_status,
      paymentType: transactionStatus.payment_type,
      grossAmount: transactionStatus.gross_amount,
      transactionTime: transactionStatus.transaction_time,
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        subscriptionStatus: user?.subscriptionStatus,
        subscriptionStartDate: user?.subscriptionStartDate,
        subscriptionEndDate: user?.subscriptionEndDate,
      },
    })
  } catch (error: any) {
    console.error("Get payment status error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}