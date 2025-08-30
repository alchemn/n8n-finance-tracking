import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database/connection";
import { Report } from "@/lib/database/models/Report";

export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const { reportId } = params;

  if (!reportId) {
    return NextResponse.json(
      { error: "Report ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Parse the JSON body
    const body = await request.json();
    const reportContent = body.content;

    if (typeof reportContent !== 'string' || reportContent.length === 0) {
      return NextResponse.json(
        { error: "Report content is missing or invalid" },
        { status: 400 }
      );
    }

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      {
        $set: {
          reportContent: reportContent,
          status: "generated",
          generatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Report uploaded successfully",
      report: updatedReport,
    });
  } catch (error: any) {
    console.error("[Report Upload]", error);
    if (error instanceof SyntaxError) {
      // Invalid JSON
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
