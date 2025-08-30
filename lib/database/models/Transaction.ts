import { Schema, model, models, type Document } from "mongoose"

export interface ITransaction extends Document {
  _id: string
  userId: string
  categoryId: string
  amount: number
  description: string
  date: Date
  type: "expense" | "income"
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient queries
TransactionSchema.index({ userId: 1, date: -1 })
TransactionSchema.index({ userId: 1, categoryId: 1 })
TransactionSchema.index({ date: -1 })

export const Transaction = models.Transaction || model<ITransaction>("Transaction", TransactionSchema)
