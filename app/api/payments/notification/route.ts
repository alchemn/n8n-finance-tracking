import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database/connection"
import { User } from "@/lib/database/models/User"
import { midtransClient } from "@/lib/midtrans/client"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const notification = await request.json()

    const { order_id, status_code, gross_amount, signature_key, transaction_status, payment_type } = notification

    // Verify signature
    const isValidSignature = midtransClient.verifySignature(order_id, status_code, gross_amount, signature_key)

    if (!isValidSignature) {
      console.error("Invalid signature for order:", order_id)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Extract user ID from order ID
    const userIdMatch = order_id.match(/PRO-([a-f\d]{24})-\d+/)
    if (!userIdMatch) {
      console.error("Invalid order ID format:", order_id)
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const userId = userIdMatch[1]

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      console.error("User not found for order:", order_id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Handle different transaction statuses
    switch (transaction_status) {
      case "capture":
      case "settlement":
        // Payment successful - upgrade user to pro
        await User.findByIdAndUpdate(userId, {
          $set: {
            subscriptionStatus: "pro",
            subscriptionId: order_id,
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
          $unset: {
            pendingOrderId: 1,
          },
        })

        console.log(`User ${userId} upgraded to Pro with order ${order_id}`)
        break

      case "pending":
        // Payment pending - keep user as free but store pending order
        console.log(`Payment pending for order ${order_id}`)
        break

      case "deny":
      case "cancel":
      case "expire":
      case "failure":
        // Payment failed - remove pending order
        await User.findByIdAndUpdate(userId, {
          $unset: {
            pendingOrderId: 1,
          },
        })

        console.log(`Payment failed for order ${order_id}: ${transaction_status}`)
        break

      default:
        console.log(`Unknown transaction status for order ${order_id}: ${transaction_status}`)
    }

    return NextResponse.json({ status: "OK" })
  } catch (error) {
    console.error("Payment notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
