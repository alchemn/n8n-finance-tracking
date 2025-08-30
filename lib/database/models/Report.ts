import { Schema, model, models, type Document } from "mongoose"

export interface IReport extends Document {
  _id: string
  userId: string
  reportType: "monthly" | "weekly" | "custom"
  startDate: Date
  endDate: Date
  status: "pending" | "generated" | "sent" | "failed"
  reportUrl?: string
  reportContent?: string
  sentVia: "email" | "whatsapp"
  generatedAt?: Date
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReportSchema = new Schema<IReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    reportType: {
      type: String,
      enum: ["monthly", "weekly", "custom"],
      required: [true, "Report type is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "generated", "sent", "failed"],
      default: "pending",
    },
    reportUrl: {
      type: String,
    },
    reportContent: {
      type: String,
    },
    sentVia: {
      type: String,
      enum: ["email", "whatsapp"],
      required: [true, "Delivery method is required"],
    },
    generatedAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient queries
ReportSchema.index({ userId: 1, createdAt: -1 })
ReportSchema.index({ status: 1 })

export const Report = models.Report || model<IReport>("Report", ReportSchema)
