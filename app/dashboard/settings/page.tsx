"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, CreditCard, Crown, Save, Loader2, CheckCircle, AlertTriangle, Trash2 } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession()
  const user = session?.user
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    timezone: "",
    currency: "",
    reportPreference: "email" as "email" | "whatsapp",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: false,
    reports: true,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (status === "authenticated" && user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        timezone: user.timezone || "UTC",
        currency: user.currency || "IDR",
        reportPreference: user.reportPreference || "email",
      })
      setNotifications(user.notifications || { email: true, whatsapp: false, reports: true })
    }
  }, [status, user, router])

  const handleProfileUpdate = async () => {
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profileForm, notifications }),
      })

      if (response.status === 401) {
        signOut({ callbackUrl: "/login" })
        return
      }

      const data = await response.json()

      if (response.ok) {
        setSuccess("Profile updated successfully!")
        await updateSession()
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async () => {
    setError("")
    setSuccess("")

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setError("New passwords don't match")
    }
    if (passwordForm.newPassword.length < 6) {
      return setError("New password must be at least 6 characters")
    }

    setSaving(true)
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      })

      if (response.status === 401) {
        signOut({ callbackUrl: "/login" })
        return
      }

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password updated successfully!")
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        setError(data.error || "Failed to update password")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>

        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert className="border-green-200"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription>{success}</AlertDescription></Alert>}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
            <TabsTrigger value="security"><Lock className="h-4 w-4 mr-2" />Security</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />Notifications</TabsTrigger>
            <TabsTrigger value="subscription"><CreditCard className="h-4 w-4 mr-2" />Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>Profile Information</CardTitle><CardDescription>Update your personal details.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={profileForm.name} onChange={(e) => setProfileForm(p => ({...p, name: e.target.value}))} /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={profileForm.email} onChange={(e) => setProfileForm(p => ({...p, email: e.target.value}))} /></div>
                    <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={profileForm.phoneNumber} onChange={(e) => setProfileForm(p => ({...p, phoneNumber: e.target.value}))} /></div>
                </div>
                <Button onClick={handleProfileUpdate} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>Ensure your account is secure.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="currentPassword">Current Password</Label><Input id="currentPassword" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(p => ({...p, currentPassword: e.target.value}))} /></div>
                <div className="space-y-2"><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(p => ({...p, newPassword: e.target.value}))} /></div>
                <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm New Password</Label><Input id="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(p => ({...p, confirmPassword: e.target.value}))} /></div>
                <Button onClick={handlePasswordUpdate} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />} Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>How you want to be notified.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between"><Label>Email Notifications</Label><Switch checked={notifications.email} onCheckedChange={(c) => setNotifications(p => ({...p, email: c}))} /></div>
                <div className="flex items-center justify-between"><Label>WhatsApp Notifications</Label><Switch checked={notifications.whatsapp} onCheckedChange={(c) => setNotifications(p => ({...p, whatsapp: c}))} disabled={!profileForm.phoneNumber} /></div>
                <div className="flex items-center justify-between"><Label>Report Notifications</Label><Switch checked={notifications.reports} onCheckedChange={(c) => setNotifications(p => ({...p, reports: c}))} /></div>
                <Button onClick={handleProfileUpdate} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader><CardTitle>Subscription</CardTitle><CardDescription>Manage your plan.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">{user?.subscriptionStatus === "pro" ? "Pro Plan" : "Free Plan"}</h3>
                        <p className="text-sm text-gray-600">{user?.subscriptionStatus === "pro" ? "You have access to all premium features." : "Upgrade to unlock more features."}</p>
                    </div>
                    {user?.subscriptionStatus === "free" && <Link href="/dashboard/upgrade"><Button>Upgrade</Button></Link>}
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
