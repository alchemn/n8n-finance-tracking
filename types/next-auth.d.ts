declare module "next-auth" {
  interface User {
    subscriptionStatus?: "free" | "pro"
    reportPreference?: "email" | "whatsapp"
    phoneNumber?: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      subscriptionStatus?: "free" | "pro"
      reportPreference?: "email" | "whatsapp"
      phoneNumber?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    subscriptionStatus?: "free" | "pro"
    reportPreference?: "email" | "whatsapp"
    phoneNumber?: string
  }
}
