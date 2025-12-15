"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Bell, Eye, RotateCcw, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SettingsViewProps {
  viewMode: "student" | "parent"
  onResetOnboarding?: () => void
  onLogout: () => void
}

export function SettingsView({ viewMode, onResetOnboarding, onLogout }: SettingsViewProps) {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleResetOnboarding = async () => {
    if (!confirm("Are you sure you want to reset your onboarding? You'll need to complete it again.")) {
      return
    }

    setIsResetting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from("users")
          .update({ onboarding_status: "pending" })
          .eq("id", user.id)
        
        if (onResetOnboarding) {
          onResetOnboarding()
        } else {
          router.refresh()
        }
      }
    } catch (error) {
      console.error("Error resetting onboarding:", error)
      alert("Failed to reset onboarding. Please try again.")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
            <Lock size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-200">
            <div>
              <p className="text-sm text-slate-900 font-light">Two-Factor Authentication</p>
              <p className="text-xs text-green-700 mt-1 font-light">Enabled</p>
            </div>
            <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-light">
              Active
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-slate-900 font-light">End-to-End Encryption</p>
              <p className="text-xs text-slate-600 mt-1 font-light">All data is encrypted</p>
            </div>
            <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-light">
              Active
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
            <Bell size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 font-light">Email notifications for important updates</p>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
            <Eye size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
            Privacy & Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-900 mb-3 font-light">
              Current Access Level: <span className="text-[#D4AF37] capitalize">{viewMode}</span>
            </p>
            <p className="text-xs text-slate-600 font-light">
              {viewMode === "parent"
                ? "You have read-only access to view your child's progress and data."
                : "You can view and edit all your data. Parents have read-only access to your information."}
            </p>
          </div>
        </CardContent>
      </Card>

      {viewMode === "student" && (
        <Card className="bg-white border-slate-200 rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
              <RotateCcw size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
              Account Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-900 mb-2 font-light">Reset Onboarding</p>
              <p className="text-xs text-slate-600 mb-4 font-light">
                Restart the onboarding process to update your profile information.
              </p>
              <Button
                onClick={handleResetOnboarding}
                disabled={isResetting}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {isResetting ? "Resetting..." : "Reset Onboarding"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border-red-50 border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-light text-red-900 flex items-center gap-2">
            <LogOut size={20} className="text-red-600" strokeWidth={1.5} />
            Logout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 mb-4 font-light">
            Sign out of your account. You'll need to log in again to access the portal.
          </p>
          <Button
            onClick={onLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={16} className="mr-2" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
