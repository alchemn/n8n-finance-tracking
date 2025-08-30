import { Schema, model, models, type Document } from "mongoose"

export interface ICategory extends Document {
  _id: string
  name: string
  icon: string
  color: string
  userId: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [30, "Category name cannot exceed 30 characters"],
    },
    icon: {
      type: String,
      required: [true, "Category icon is required"],
    },
    color: {
      type: String,
      required: [true, "Category color is required"],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for user-specific categories
CategorySchema.index({ userId: 1, name: 1 }, { unique: true })

export const Category = models.Category || model<ICategory>("Category", CategorySchema)
