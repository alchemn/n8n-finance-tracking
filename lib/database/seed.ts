import connectDB from "./connection"
import { User } from "./models/User"
import { Category } from "./models/Category"
import { Transaction } from "./models/Transaction"
import bcrypt from "bcryptjs"

const defaultCategories = [
  { name: "Food & Dining", icon: "🍽️", color: "#FF6B6B" },
  { name: "Transportation", icon: "🚗", color: "#4ECDC4" },
  { name: "Shopping", icon: "🛍️", color: "#45B7D1" },
  { name: "Entertainment", icon: "🎬", color: "#96CEB4" },
  { name: "Bills & Utilities", icon: "💡", color: "#FFEAA7" },
  { name: "Healthcare", icon: "🏥", color: "#DDA0DD" },
  { name: "Education", icon: "📚", color: "#98D8C8" },
  { name: "Travel", icon: "✈️", color: "#F7DC6F" },
  { name: "Income", icon: "💰", color: "#58D68D" },
  { name: "Other", icon: "📦", color: "#AEB6BF" },
]

export async function seedDatabase() {
  try {
    await connectDB()

    // Create demo user
    const hashedPassword = await bcrypt.hash("demo123", 12)

    const demoUser = await User.findOneAndUpdate(
      { email: "demo@example.com" },
      {
        email: "demo@example.com",
        password: hashedPassword,
        name: "Demo User",
        subscriptionStatus: "pro",
        reportPreference: "email",
      },
      { upsert: true, new: true },
    )

    // Create default categories for demo user
    for (const categoryData of defaultCategories) {
      await Category.findOneAndUpdate(
        { userId: demoUser._id, name: categoryData.name },
        {
          ...categoryData,
          userId: demoUser._id,
          isDefault: true,
        },
        { upsert: true, new: true },
      )
    }

    // Create sample transactions
    const categories = await Category.find({ userId: demoUser._id })
    const sampleTransactions = [
      { categoryId: categories[0]._id, amount: 25.5, description: "Lunch at cafe", date: new Date("2024-01-15") },
      { categoryId: categories[1]._id, amount: 45.0, description: "Gas station", date: new Date("2024-01-14") },
      { categoryId: categories[2]._id, amount: 120.0, description: "Online shopping", date: new Date("2024-01-13") },
      { categoryId: categories[3]._id, amount: 15.0, description: "Movie ticket", date: new Date("2024-01-12") },
      { categoryId: categories[4]._id, amount: 85.0, description: "Electricity bill", date: new Date("2024-01-11") },
    ]

    for (const transactionData of sampleTransactions) {
      await Transaction.findOneAndUpdate(
        {
          userId: demoUser._id,
          description: transactionData.description,
        },
        {
          ...transactionData,
          userId: demoUser._id,
          type: "expense",
        },
        { upsert: true, new: true },
      )
    }

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}
