"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, PlusCircle, BarChart3, Settings, LogOut, Crown, FileText, TrendingUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tambah Transaksi", href: "/dashboard/add", icon: PlusCircle },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, proOnly: true },
  { name: "Laporan", href: "/dashboard/reports", icon: FileText, proOnly: true },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardSidebarProps {
  onClose?: () => void
}

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
    onClose?.()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar-background border-r border-sidebar-border shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold gradient-text">FinanceTracker</span>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
          </div>
          <Badge
            variant={user?.subscriptionStatus === "pro" ? "default" : "secondary"}
            className={cn(
              "flex items-center ml-2 shrink-0 shadow-sm",
              user?.subscriptionStatus === "pro"
                ? "bg-gradient-to-r from-primary to-accent text-white border-0"
                : "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            {user?.subscriptionStatus === "pro" && <Crown className="h-3 w-3 mr-1" />}
            {user?.subscriptionStatus === "pro" ? "Pro" : "Free"}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isProOnly = item.proOnly && user?.subscriptionStatus !== "pro"

          return (
            <Link
              key={item.name}
              href={isProOnly ? "/dashboard/upgrade" : item.href}
              onClick={onClose}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
                  : isProOnly
                    ? "text-sidebar-foreground/50 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              {isActive && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />}
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-all duration-200 group-hover:scale-110 relative z-10",
                  isActive && "text-sidebar-primary-foreground",
                )}
              />
              <span className="flex-1 relative z-10">{item.name}</span>
              {isProOnly && <Crown className="h-4 w-4 text-accent relative z-10" />}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade CTA for Free Users */}
      {user?.subscriptionStatus === "free" && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-gradient-to-br from-primary via-accent to-primary rounded-xl p-4 text-white relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="relative">
              <div className="flex items-center mb-2">
                <Crown className="h-5 w-5 mr-2 text-white" />
                <span className="font-semibold">Upgrade ke Pro</span>
              </div>
              <p className="text-sm text-white/90 mb-3 leading-relaxed">
                Unlock analytics advanced, laporan otomatis, dan premium insights.
              </p>
              <Link href="/dashboard/upgrade" onClick={onClose}>
                <Button
                  size="sm"
                  className="w-full bg-white text-primary hover:bg-white/90 font-medium shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Upgrade Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl transition-all duration-200 group"
        >
          <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
