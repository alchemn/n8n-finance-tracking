import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/database/connection"
import { Transaction } from "@/lib/database/models/Transaction"
import { Category } from "@/lib/database/models/Category"

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("Authorization")
  const n8nSecret = process.env.N8N_SECRET_TOKEN

  let isN8nRequest = false
  if (authorization) {
    const token = authorization.split(" ")[1]
    if (token === n8nSecret) {
      isN8nRequest = true
    }
  }

  const session = await getServerSession(authOptions)

  if (!isN8nRequest && (!session || !session.user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const categoryId = searchParams.get("categoryId")

    let userId: string | null = null

    if (isN8nRequest) {
      userId = searchParams.get("userId")
    } else if (session && session.user) {
      // @ts-ignore
      userId = session.user.id
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const query: any = { userId: userId }

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate)
      const parsedEndDate = new Date(endDate)

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return NextResponse.json({ error: "Invalid date format. Please use ISO 8601 format." }, { status: 400 })
      }

      query.date = {
        $gte: parsedStartDate,
        $lte: parsedEndDate,
      }
    }

    if (categoryId) {
      query.categoryId = categoryId
    }

    const transactions = await Transaction.find(query)
      .populate("categoryId", "name icon color")
      .sort({ date: -1 })
      .limit(100)

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Get transactions error:", error)
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

    const { categoryId, amount, description, date, type } = await request.json()

    if (!categoryId || !amount || !description) {
      return NextResponse.json({ error: "Category, amount, and description are required" }, { status: 400 })
    }

    const category = await Category.findOne({ _id: categoryId, userId: session.user.id })
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const transaction = await Transaction.create({
      userId: session.user.id,
      categoryId,
      amount: Number.parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
      type: type || "expense",
    })

    const populatedTransaction = await Transaction.findById(transaction._id).populate("categoryId", "name icon color")

    return NextResponse.json({ transaction: populatedTransaction }, { status: 201 })
  } catch (error: any) {
    console.error("Create transaction error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}