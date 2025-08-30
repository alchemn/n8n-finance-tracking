"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  BarChart3,
  DollarSign,
  Settings,
  LogOut,
  Shield,
  TrendingUp,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Revenue", href: "/admin/revenue", icon: DollarSign },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar-background border-r border-sidebar-border shadow-xl">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold gradient-text">Admin Panel</span>
        </div>
        <ThemeToggle />
      </div>

      {/* User Info */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
          </div>
          <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-sm ml-2 shrink-0">
            Admin
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
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
              <span className="relative z-10">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Back to Dashboard */}
      <div className="p-4 border-t border-sidebar-border">
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground rounded-xl transition-all duration-200 group"
          >
            <TrendingUp className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>

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
