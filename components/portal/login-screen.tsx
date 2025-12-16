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
import { Eye, EyeOff } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showDemoDialog, setShowDemoDialog] = useState(false)
  const [demoPassword, setDemoPassword] = useState("")
  const [demoError, setDemoError] = useState<string | null>(null)
  const [captchaQuestion, setCaptchaQuestion] = useState("")
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [captchaExpected, setCaptchaExpected] = useState<string>("")

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false)
  const [showDemoPassword, setShowDemoPassword] = useState(false)
  
  // Forgot password state
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)

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
    const normalizedEmail = email.trim().toLowerCase()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
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
            approval_status: "pending",
          })
        } else if (userData) {
          // Check if user is approved (admins are always approved)
          const isAdmin = userData.role === "admin"
          const isApproved = userData.approval_status === "approved" || isAdmin
          
          if (!isApproved && !isAdmin) {
            await supabase.auth.signOut()
            setError("Your account is pending approval. Please contact an administrator.")
            setIsLoading(false)
            return
          }
        }

        // Small delay to ensure session is established
        await new Promise(resolve => setTimeout(resolve, 100))

        if (onLogin) {
          onLogin()
        } else {
          router.push("/portal")
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedEmail = forgotPasswordEmail.trim().toLowerCase()

    if (!normalizedEmail) {
      setError("Please enter your email address")
      return
    }

    setForgotPasswordLoading(true)
    setError(null)
    setForgotPasswordSuccess(false)

    try {
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/portal/reset-password`
        : '/portal/reset-password'

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setForgotPasswordSuccess(true)
      setForgotPasswordEmail("")
    } catch (err) {
      console.error("Password reset error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const normalizedEmail = email.trim().toLowerCase()

      if (!normalizedEmail || !password || !confirmPassword) {
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

      // Get the current origin (production URL or localhost for dev)
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/portal`
        : '/portal'

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user) {
        // Admins and mentors skip onboarding, so set it to complete
        // Students and parents need to complete onboarding
        const needsOnboarding = signupRole === "student" || signupRole === "parent"
        
        // Create a corresponding profile row with pending onboarding and approval
        const { data: insertData, error: insertError } = await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: normalizedEmail,
            role: signupRole,
            onboarding_status: needsOnboarding ? "pending" : "complete",
            approval_status: "pending",
          },
          { onConflict: "id" }
        )

        if (insertError) {
          // Log full error details
          console.error("Error creating user profile for signup:")
          console.error("Error message:", insertError.message)
          console.error("Error code:", insertError.code)
          console.error("Error details:", insertError.details)
          console.error("Error hint:", insertError.hint)
          console.error("Full error object:", JSON.stringify(insertError, null, 2))
          
          // Show user-friendly error
          setError(
            `Account created but profile setup failed: ${insertError.message || "Unknown error"}. ` +
            `Please contact support or try again. Error code: ${insertError.code || "N/A"}`
          )
          return
        }

        // Success - profile created
        console.log("User profile created successfully:", insertData)
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
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#0B1120] flex items-center justify-center px-4 py-6 sm:p-6">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-slate-700/50 rounded-2xl shadow-2xl border border-slate-700/30">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif text-[#D4AF37] tracking-widest mb-2 font-light">
              REGENT&apos;S CONSULTANCY
            </h1>
            <p className="text-sm text-slate-300 font-light">Private Client Portal</p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("login")
                setError(null)
                setSuccessMessage(null)
              }}
              className={`px-6 py-2.5 rounded-lg font-light transition-all ${
                mode === "login"
                  ? "bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup")
                setError(null)
                setSuccessMessage(null)
                generateCaptcha()
              }}
              className={`px-6 py-2.5 rounded-lg font-light transition-all ${
                mode === "signup"
                  ? "bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              Register
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
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                  placeholder="student@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-200 font-light text-sm">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordDialog(true)}
                      className="text-xs text-slate-400 hover:text-[#D4AF37] transition-colors font-light"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 pr-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
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
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 pr-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                      aria-label={showSignupPassword ? "Hide password" : "Show password"}
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-slate-200 font-light text-sm">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      type={showSignupConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 pr-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                      aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showSignupConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                    <SelectItem value="parent">Guardian</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 font-light">
                  Guardians can later be linked to one or more students by your Regent&apos;s consultant.
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
                    autoComplete="off"
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
              <div className="relative">
                <Input
                  id="demo-password"
                  type={showDemoPassword ? "text" : "password"}
                  autoComplete="off"
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
                  className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 pr-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                  placeholder="Enter demo password"
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowDemoPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                  aria-label={showDemoPassword ? "Hide password" : "Show password"}
                >
                  {showDemoPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="bg-[#0B1120] border-slate-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37] font-light text-xl">
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-slate-300 font-light">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          {forgotPasswordSuccess ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-emerald-900/30 border border-emerald-700/60 rounded-lg">
                <p className="text-sm text-emerald-200 font-light">
                  Password reset email sent! Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordDialog(false)
                    setForgotPasswordSuccess(false)
                    setForgotPasswordEmail("")
                  }}
                  className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium w-full"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg">
                  <p className="text-sm text-red-300 font-light">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="forgot-password-email" className="text-slate-200 font-light text-sm">
                  Email Address
                </Label>
                <Input
                  id="forgot-password-email"
                  type="email"
                  autoComplete="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                  placeholder="your.email@example.com"
                  required
                  disabled={forgotPasswordLoading}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPasswordDialog(false)
                    setForgotPasswordEmail("")
                    setError(null)
                    setForgotPasswordSuccess(false)
                  }}
                  className="border-slate-600/50 text-slate-200 hover:bg-white/10"
                  disabled={forgotPasswordLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium"
                  disabled={forgotPasswordLoading || !forgotPasswordEmail}
                >
                  {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
