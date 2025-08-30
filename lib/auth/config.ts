import type { NextAuthOptions, User as NextAuthUser } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { User, IUser } from "@/lib/database/models/User"
import { Category } from "@/lib/database/models/Category"
import connectDB from "@/lib/database/connection"

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = client.connect()

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

// Helper function to populate token with user data
const populateToken = (token: any, user: IUser) => {
    token.name = user.name;
    token.email = user.email;
    token.subscriptionStatus = user.subscriptionStatus;
    token.reportPreference = user.reportPreference;
    token.phoneNumber = user.phoneNumber;
    token.timezone = user.timezone;
    token.currency = user.currency;
    token.notifications = user.notifications;
    return token;
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        await connectDB()
        const user = await User.findOne({ email: credentials.email.toLowerCase() })
        if (!user || !user.password) return null
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) return null
        return user
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB()
          const existingUser = await User.findOne({ email: user.email?.toLowerCase() })
          if (!existingUser) {
            const newUser = await User.create({
              name: user.name,
              email: user.email?.toLowerCase(),
              subscriptionStatus: "free",
              reportPreference: "email",
            })
            const categoryPromises = defaultCategories.map((categoryData) =>
              Category.create({ ...categoryData, userId: newUser._id, isDefault: true }),
            )
            await Promise.all(categoryPromises)
          }
        } catch (error) {
          console.error("Google sign-in error:", error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, trigger }) {
      // On initial sign-in, populate token with user data
      if (user) {
        token = populateToken(token, user as IUser);
      }

      // On subsequent session updates (like after a profile change), refetch from DB
      if (trigger === "update") {
        await connectDB();
        const dbUser = await User.findById(token.sub);
        if (dbUser) {
          token = populateToken(token, dbUser);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.subscriptionStatus = token.subscriptionStatus as "free" | "pro";
        session.user.reportPreference = token.reportPreference as "email" | "whatsapp";
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.timezone = token.timezone as string;
        session.user.currency = token.currency as string;
        session.user.notifications = token.notifications as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}