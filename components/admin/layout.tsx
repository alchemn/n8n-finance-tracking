"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { AdminSidebar } from "./sidebar"
import { Loader2 } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center animate-fade-in">
          <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Loading Admin Panel</h3>
          <p className="text-muted-foreground">Memuat panel admin...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null // Middleware will redirect to login
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50/30 via-background to-green-100/30 dark:from-gray-900 dark:to-gray-800">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  )
}
