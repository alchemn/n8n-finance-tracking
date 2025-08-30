import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/database/connection"
import { User } from "@/lib/database/models/User"

const USER_PROFILE_FIELDS =
  "name email phoneNumber subscriptionStatus reportPreference timezone currency notifications createdAt _id"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const user = await User.findById(session.user.id).select(USER_PROFILE_FIELDS)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()
    const body = await request.json()

    const updatePayload: { [key: string]: any } = {}

    // Explicitly build the update payload to be 100% safe
    if (body.name !== undefined) updatePayload.name = body.name
    if (body.email !== undefined) updatePayload.email = body.email
    if (body.phoneNumber !== undefined) updatePayload.phoneNumber = body.phoneNumber
    if (body.timezone !== undefined) updatePayload.timezone = body.timezone
    if (body.currency !== undefined) updatePayload.currency = body.currency
    if (body.reportPreference !== undefined) updatePayload.reportPreference = body.reportPreference
    if (body.notifications !== undefined) updatePayload.notifications = body.notifications

    // Do not proceed if there's nothing to update
    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updatePayload },
      { new: true, runValidators: true, select: USER_PROFILE_FIELDS },
    )

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found during update" }, { status: 404 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error("Update user profile error:", error)
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already in use." }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
