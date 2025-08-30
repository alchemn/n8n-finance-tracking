import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/database/connection"
import { User } from "@/lib/database/models/User"
import { midtransClient } from "@/lib/midtrans/client"

export async function POST() {
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

    if (user.subscriptionStatus === "pro") {
      return NextResponse.json({ error: "User is already a Pro subscriber" }, { status: 400 })
    }

    const orderId = `PRO-${user._id}-${Date.now()}`

    const paymentRequest = {
      orderId,
      grossAmount: 150000,
      customerDetails: {
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ").slice(1).join(" "),
        email: user.email,
        phone: user.phoneNumber,
      },
      itemDetails: [
        {
          id: "pro-subscription",
          price: 150000,
          quantity: 1,
          name: "FinanceTracker Pro - Langganan Bulanan",
        },
      ],
    }

    const paymentResponse = await midtransClient.createPaymentToken(paymentRequest)

    // This part might need adjustment depending on your exact webhook logic
    // For now, we assume a webhook will handle the final subscription update.

    return NextResponse.json({
      token: paymentResponse.token,
      redirectUrl: paymentResponse.redirectUrl,
      orderId,
      clientKey: midtransClient.getClientKey(),
      snapUrl: midtransClient.getSnapUrl(),
    })
  } catch (error: any) {
    console.error("Create payment token error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}