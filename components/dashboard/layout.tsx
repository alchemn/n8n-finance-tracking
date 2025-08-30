"use client"

import type React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { DashboardSidebar } from "./sidebar"
import { Loader2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center animate-fade-in">
          <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Loading Dashboard</h3>
          <p className="text-muted-foreground">Memuat dashboard Anda...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null // Middleware will redirect to login
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50/30 via-background to-green-100/30 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile sidebar overlay */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed left-0 top-0 h-full w-64 transform transition-transform animate-slide-up">
          <DashboardSidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-primary/10 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-r from-primary to-accent rounded-lg">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold gradient-text">FinanceTracker</h1>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="animate-fade-in">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
