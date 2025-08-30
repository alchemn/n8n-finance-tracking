import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database/connection"
import { Report } from "@/lib/database/models/Report"

export async function POST(request: NextRequest, { params }: { params: { reportId: string } }) {
  const authorization = request.headers.get("Authorization")
  const n8nSecret = process.env.N8N_SECRET_TOKEN

  if (!authorization || authorization.split(" ")[1] !== n8nSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { reportId } = params

  if (!reportId) {
    return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
  }

  try {
    await connectDB()

    const { status, downloadUrl } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      {
        $set: {
          status: status,
          reportUrl: downloadUrl,
          sentAt: new Date(),
        },
      },
      { new: true },
    )

    if (!updatedReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Report status updated successfully", report: updatedReport })
  } catch (error) {
    console.error("[Report Status Update]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
