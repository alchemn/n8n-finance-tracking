import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/database/connection"
import { Category } from "@/lib/database/models/Category"
import { User } from "@/lib/database/models/User"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const categories = await Category.find({ userId: session.user.id }).sort({ name: 1 })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { name, icon, color } = await request.json()

    if (!name || !icon || !color) {
      return NextResponse.json({ error: "Name, icon, and color are required" }, { status: 400 })
    }

    const category = await Category.create({
      name,
      icon,
      color,
      userId: session.user.id,
      isDefault: false,
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error: any) {
    console.error("Create category error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
