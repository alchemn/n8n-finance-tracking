import { Schema, model, models, type Document } from "mongoose"

export interface IUser extends Document {
  _id: string
  email: string
  password?: string // Password may not exist for OAuth users
  name: string
  subscriptionStatus: "free" | "pro"
  subscriptionId?: string
  subscriptionStartDate?: Date
  subscriptionEndDate?: Date
  createdAt: Date
  updatedAt: Date
  reportPreference: "email" | "whatsapp"
  phoneNumber?: string
  timezone?: string
  currency?: string
  notifications?: {
    email: boolean
    whatsapp: boolean
    reports: boolean
  }
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      // Not required for OAuth users
      minlength: [6, "Password must be at least 6 characters"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    subscriptionStatus: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    subscriptionId: {
      type: String,
      sparse: true,
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    reportPreference: {
      type: String,
      enum: ["email", "whatsapp"],
      default: "email",
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: (v: string) => !v || /^\+?[\d\s-()]+$/.test(v),
        message: "Please enter a valid phone number",
      },
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    currency: {
      type: String,
      default: "IDR",
    },
    notifications: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      reports: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
UserSchema.index({ subscriptionStatus: 1 })

export const User = models.User || model<IUser>("User", UserSchema)