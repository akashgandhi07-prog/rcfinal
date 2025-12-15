"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface LoginScreenProps {
  onLogin?: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twoFA, setTwoFA] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDemoDialog, setShowDemoDialog] = useState(false)
  const [demoPassword, setDemoPassword] = useState("")
  const [demoError, setDemoError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (data.user) {
        // Create user record in database if doesn't exist
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (userError && userError.code === "PGRST116") {
          // User doesn't exist, create them
          await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email,
            role: "student",
            onboarding_status: "pending",
          })
        }

        if (onLogin) {
          onLogin()
        } else {
          router.push("/portal")
          router.refresh()
        }
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBypass = () => {
    // Open demo password dialog instead of directly proceeding
    setShowDemoDialog(true)
    setDemoPassword("")
    setDemoError(null)
  }

  const handleDemoAccess = async () => {
    // Validate demo password
    if (demoPassword !== "Junojuno") {
      setDemoError("Incorrect demo password. Please try again.")
      return
    }

    setDemoError(null)
    setIsLoading(true)
    setShowDemoDialog(false)

    try {
      // Try anonymous auth first
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
      
      if (authError) {
        console.error("Anonymous auth error:", authError)
        // Fallback: create demo user with email/password
        const demoEmail = `demo-${Date.now()}@regents.com`
        const demoPassword = "demo123456"
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
        })
        
        if (signUpData?.user) {
          // Create user record
          await supabase.from("users").upsert({
            id: signUpData.user.id,
            email: demoEmail,
            role: "student",
            onboarding_status: "pending",
          }, { onConflict: "id" })
          
          // Sign in with the created account
          await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword,
          })
        }
      } else if (authData?.user) {
        // Ensure user record exists with pending onboarding
        await supabase.from("users").upsert({
          id: authData.user.id,
          email: authData.user.email || "demo@regents.com",
          role: "student",
          onboarding_status: "pending",
        }, { onConflict: "id" })
      }

      if (onLogin) {
        onLogin()
      } else {
        router.push("/portal")
        router.refresh()
      }
    } catch (err) {
      console.error("Bypass error:", err)
      // Fail gracefully and surface an error instead of silently redirecting
      setError("Failed to access demo. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#0B1120] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-slate-700/50 rounded-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif text-[#D4AF37] tracking-widest mb-2 font-light">
              THE REGENT&apos;S CONSULTANCY
            </h1>
            <p className="text-sm text-slate-300 font-light">Private Client Portal</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-red-300 font-light">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 font-light text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                placeholder="student@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 font-light text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="2fa" className="text-slate-200 font-light text-sm">
                2FA Code (Optional)
              </Label>
              <Input
                id="2fa"
                type="text"
                value={twoFA}
                onChange={(e) => setTwoFA(e.target.value)}
                className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium rounded-lg h-11 shadow-lg shadow-[#D4AF37]/20 transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Secure Login"}
              </Button>
              <Button
                type="button"
                onClick={handleBypass}
                variant="outline"
                className="w-full border-slate-600/50 text-slate-200 hover:bg-white/10 hover:border-slate-500 rounded-lg h-11 font-light"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Continue as Demo User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Demo Password Dialog */}
      <Dialog open={showDemoDialog} onOpenChange={setShowDemoDialog}>
        <DialogContent className="bg-[#0B1120] border-slate-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37] font-light text-xl">
              Demo Access
            </DialogTitle>
            <DialogDescription className="text-slate-300 font-light">
              Please enter the demo password to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {demoError && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg">
                <p className="text-sm text-red-300 font-light">{demoError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="demo-password" className="text-slate-200 font-light text-sm">
                Demo Password
              </Label>
              <Input
                id="demo-password"
                type="password"
                value={demoPassword}
                onChange={(e) => {
                  setDemoPassword(e.target.value)
                  setDemoError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleDemoAccess()
                  }
                }}
                className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                placeholder="Enter demo password"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDemoDialog(false)
                setDemoPassword("")
                setDemoError(null)
              }}
              className="border-slate-600/50 text-slate-200 hover:bg-white/10"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDemoAccess}
              className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Accessing..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
