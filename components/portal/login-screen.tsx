"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole } from "@/lib/supabase/types"

interface LoginScreenProps {
  onLogin?: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [signupRole, setSignupRole] = useState<UserRole>("student")
  const [twoFA, setTwoFA] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showDemoDialog, setShowDemoDialog] = useState(false)
  const [demoPassword, setDemoPassword] = useState("")
  const [demoError, setDemoError] = useState<string | null>(null)
  const [captchaQuestion, setCaptchaQuestion] = useState("")
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [captchaExpected, setCaptchaExpected] = useState<string>("")

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 5) + 3
    const b = Math.floor(Math.random() * 5) + 2
    setCaptchaQuestion(`What is ${a} + ${b}?`)
    setCaptchaExpected(String(a + b))
    setCaptchaAnswer("")
  }

  useEffect(() => {
    if (mode === "signup") {
      generateCaptcha()
    }
  }, [mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode !== "login") return
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (!email || !password || !confirmPassword) {
        setError("Please complete all required fields.")
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        return
      }

      if (captchaAnswer.trim() !== captchaExpected) {
        setError("Captcha answer is incorrect. Please try again.")
        generateCaptcha()
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user) {
        // Create a corresponding profile row with pending onboarding and approval
        const { error: insertError } = await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: data.user.email,
            role: signupRole,
            onboarding_status: "pending",
            approval_status: "pending",
          },
          { onConflict: "id" }
        )

        if (insertError) {
          console.error("Error creating user profile for signup:", insertError)
        }
      }

      setSuccessMessage(
        "Account created. An administrator will review and approve access shortly. You’ll be able to complete onboarding once approved."
      )
      setMode("login")
      setPassword("")
      setConfirmPassword("")
      setCaptchaAnswer("")
    } catch (err) {
      console.error("Signup error:", err)
      setError("An error occurred during signup. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
              REGENT&apos;S CONSULTANCY
            </h1>
            <p className="text-sm text-slate-300 font-light">Private Client Portal</p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 font-light">
            <button
              type="button"
              onClick={() => {
                setMode("login")
                setError(null)
                setSuccessMessage(null)
              }}
              className={`px-3 py-1 border-b ${
                mode === "login"
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent hover:text-white/80"
              }`}
            >
              Existing client login
            </button>
            <span className="text-slate-600">/</span>
            <button
              type="button"
              onClick={() => {
                setMode("signup")
                setError(null)
                setSuccessMessage(null)
                generateCaptcha()
              }}
              className={`px-3 py-1 border-b ${
                mode === "signup"
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent hover:text-white/80"
              }`}
            >
              New family registration
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-950/40 border border-red-800/50 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-red-300 font-light">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-emerald-900/30 border border-emerald-700/60 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-emerald-200 font-light">{successMessage}</p>
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleSubmit} className="space-y-5">
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
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-200 font-light text-sm">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                  placeholder="parent.or.student@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-200 font-light text-sm">
                    Create Password
                  </Label>
                  <Input
                    id="signup-password"
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
                  <Label htmlFor="signup-confirm-password" className="text-slate-200 font-light text-sm">
                    Confirm Password
                  </Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 font-light text-sm">
                  Account Type
                </Label>
                <Select
                  value={signupRole}
                  onValueChange={(value) => setSignupRole(value as UserRole)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white rounded-lg h-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 font-light">
                  Parents can later be linked to one or more students by your Regent&apos;s consultant.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-captcha" className="text-slate-200 font-light text-sm">
                  Human Check
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-slate-300 mb-1 font-light">{captchaQuestion}</div>
                    <Input
                      id="signup-captcha"
                      type="text"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-10 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                      placeholder="Enter your answer"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateCaptcha}
                    className="h-10 border-slate-600/50 text-slate-200 hover:bg-white/10"
                    disabled={isLoading}
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium rounded-lg h-11 shadow-lg shadow-[#D4AF37]/20 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Request Access"}
                </Button>
                <p className="text-[11px] text-slate-400 text-center font-light">
                  Your request will be reviewed by The Regent&apos;s Consultancy. Once approved, you&apos;ll be invited
                  to complete a detailed onboarding questionnaire for your child&apos;s application.
                </p>
              </div>
            </form>
          )}
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
