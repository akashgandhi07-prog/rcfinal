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
import { Eye, EyeOff, X } from "lucide-react"
import { validatePasswordStrength } from "@/lib/utils/validation"
import { logLogin, logLoginAttempt, logActivity } from "@/lib/utils/activity-logger"

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
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof validatePasswordStrength> | null>(null)
  
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
        // Log failed login attempt
        await logLoginAttempt(normalizedEmail, false)
        
        // Don't expose detailed error messages that could help attackers
        if (authError.message.includes("Invalid login credentials") || authError.message.includes("Email not confirmed")) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (authError.message.includes("Too many requests")) {
          setError("Too many login attempts. Please wait a moment and try again.")
        } else {
          setError("Unable to sign in. Please check your credentials and try again.")
        }
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

        // Log successful login (both activity log and login attempts)
        await logLogin(normalizedEmail)
        await logLoginAttempt(normalizedEmail, true)

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

      // Validate password strength
      const strength = validatePasswordStrength(password)
      if (!strength.isValid) {
        setError(`Password is too weak. ${strength.feedback.join(" ")}`)
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
        // Sanitize error messages for security
        if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
          setError("An account with this email already exists. Please sign in instead.")
        } else if (signUpError.message.includes("Password")) {
          setError("Password does not meet requirements. Please use a stronger password.")
        } else if (signUpError.message.includes("email")) {
          setError("Please enter a valid email address.")
        } else {
          setError("Unable to create account. Please try again or contact support.")
        }
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
          // Log error details server-side only (not exposed to user)
          console.error("Error creating user profile for signup:", {
            code: insertError.code,
            message: insertError.message,
            // Don't log sensitive details
          })
          
          // Show user-friendly error without exposing technical details
          setError(
            "Account created but profile setup failed. Please contact support for assistance."
          )
          return
        }

        // Success - profile created
        console.log("User profile created successfully:", insertData)
        
        // Log account creation
        await logActivity('create', 'user', {
          resourceId: data.user.id,
          description: `New account created: ${normalizedEmail} (${signupRole})`,
          metadata: {
            role: signupRole,
            email: normalizedEmail,
          },
        })
      }

      setSuccessMessage(
        "Account created. An administrator will review and approve access shortly. You'll be able to complete onboarding once approved."
      )
      setMode("login")
      setPassword("")
      setConfirmPassword("")
      setCaptchaAnswer("")
      setPasswordStrength(null)
    } catch (err) {
      console.error("Signup error:", err)
      setError("An error occurred during signup. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoAccess = async () => {
    // Validate demo password from environment variable (fallback for development)
    const expectedPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || (process.env.NODE_ENV === "development" ? "demo" : "")
    
    if (!expectedPassword || demoPassword !== expectedPassword) {
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
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#0B1120] flex items-center justify-center px-4 py-4 sm:py-6 sm:p-6">
      <Card className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border-slate-700/50 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-700/30">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="absolute right-3 top-3 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <CardHeader className="text-center space-y-4 pb-4 sm:pb-6 px-4 sm:px-6 pt-6 sm:pt-8">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#D4AF37] tracking-widest mb-2 font-light">
              REGENT&apos;S CONSULTANCY
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-light">Private Client Portal</p>
          </div>
          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("login")
                setError(null)
                setSuccessMessage(null)
              }}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-light transition-all min-h-[44px] touch-manipulation text-sm sm:text-base ${
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
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-light transition-all min-h-[44px] touch-manipulation text-sm sm:text-base ${
                mode === "signup"
                  ? "bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              Register
            </button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-950/40 border border-red-800/50 rounded-lg backdrop-blur-sm">
              <p className="text-xs sm:text-sm text-red-300 font-light leading-relaxed">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 sm:p-4 bg-emerald-900/30 border border-emerald-700/60 rounded-lg backdrop-blur-sm">
              <p className="text-xs sm:text-sm text-emerald-200 font-light leading-relaxed">{successMessage}</p>
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 font-light text-xs sm:text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 sm:h-12 text-base focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                  placeholder="student@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-200 font-light text-xs sm:text-sm">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordDialog(true)}
                      className="text-xs sm:text-sm text-slate-400 hover:text-[#D4AF37] transition-colors font-light min-h-[44px] px-2 touch-manipulation"
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
                      className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 sm:h-12 pr-12 text-base focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 min-w-[44px] min-h-[44px] justify-center touch-manipulation"
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium rounded-lg h-12 sm:h-14 text-base shadow-lg shadow-[#D4AF37]/20 transition-all min-h-[44px] touch-manipulation"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Secure Login"}
                </Button>
                <Button
                  type="button"
                  onClick={handleBypass}
                  variant="outline"
                  className="w-full border-slate-600/50 text-slate-200 hover:bg-white/10 hover:border-slate-500 rounded-lg h-12 sm:h-14 font-light text-base min-h-[44px] touch-manipulation"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Continue as Demo User"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-200 font-light text-xs sm:text-sm">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 sm:h-12 text-base focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                  placeholder="parent.or.student@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-200 font-light text-xs sm:text-sm">
                    Create Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (e.target.value.length > 0) {
                          setPasswordStrength(validatePasswordStrength(e.target.value))
                        } else {
                          setPasswordStrength(null)
                        }
                      }}
                      className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 sm:h-12 pr-12 text-base focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      aria-describedby={passwordStrength ? "password-strength" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 min-w-[44px] min-h-[44px] justify-center touch-manipulation"
                      aria-label={showSignupPassword ? "Hide password" : "Show password"}
                    >
                      {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordStrength && password.length > 0 && (
                    <div id="password-strength" className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded ${
                              level <= passwordStrength.score
                                ? passwordStrength.score <= 1
                                  ? "bg-red-500"
                                  : passwordStrength.score <= 2
                                  ? "bg-orange-500"
                                  : passwordStrength.score <= 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-slate-700"
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <p className="text-xs text-slate-400 font-light">
                          {passwordStrength.feedback[0]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-slate-200 font-light text-xs sm:text-sm">
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
                      className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 sm:h-12 pr-12 text-base focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 min-w-[44px] min-h-[44px] justify-center touch-manipulation"
                      aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showSignupConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 font-light text-xs sm:text-sm">
                  Account Type
                </Label>
                <Select
                  value={signupRole}
                  onValueChange={(value) => setSignupRole(value as UserRole)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white rounded-lg h-11 sm:h-12 text-base focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 min-h-[44px]">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Guardian</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
                  Guardians can later be linked to one or more students by your Regent&apos;s consultant.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-captcha" className="text-slate-200 font-light text-xs sm:text-sm">
                  Human Check
                </Label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-slate-300 mb-1 font-light">{captchaQuestion}</div>
                    <Input
                      id="signup-captcha"
                      type="text"
                    autoComplete="off"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-10 sm:h-11 text-base focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                      placeholder="Enter your answer"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateCaptcha}
                    className="h-10 sm:h-11 min-h-[44px] border-slate-600/50 text-slate-200 hover:bg-white/10 touch-manipulation"
                    disabled={isLoading}
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium rounded-lg h-12 sm:h-14 text-base shadow-lg shadow-[#D4AF37]/20 transition-all min-h-[44px] touch-manipulation"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Request Access"}
                </Button>
                <p className="text-[10px] sm:text-[11px] text-slate-400 text-center font-light leading-relaxed px-2">
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
        <DialogContent className="bg-[#0B1120] border-slate-700/50 text-white max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37] font-light text-lg sm:text-xl">
              Demo Access
            </DialogTitle>
            <DialogDescription className="text-slate-300 font-light text-sm">
              Please enter the demo password to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {demoError && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg">
                <p className="text-xs sm:text-sm text-red-300 font-light leading-relaxed">{demoError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="demo-password" className="text-slate-200 font-light text-xs sm:text-sm">
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
                  className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 sm:h-12 pr-12 text-base focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                  placeholder="Enter demo password"
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowDemoPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 min-w-[44px] min-h-[44px] justify-center touch-manipulation"
                  aria-label={showDemoPassword ? "Hide password" : "Show password"}
                >
                  {showDemoPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDemoDialog(false)
                setDemoPassword("")
                setDemoError(null)
              }}
              className="border-slate-600/50 text-slate-200 hover:bg-white/10 w-full sm:w-auto min-h-[44px] touch-manipulation"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDemoAccess}
              className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium w-full sm:w-auto min-h-[44px] touch-manipulation"
              disabled={isLoading}
            >
              {isLoading ? "Accessing..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="bg-[#0B1120] border-slate-700/50 text-white max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37] font-light text-lg sm:text-xl">
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-slate-300 font-light text-sm">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          {forgotPasswordSuccess ? (
            <div className="space-y-4 py-4">
              <div className="p-3 sm:p-4 bg-emerald-900/30 border border-emerald-700/60 rounded-lg">
                <p className="text-xs sm:text-sm text-emerald-200 font-light leading-relaxed">
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
                  className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium w-full min-h-[44px] touch-manipulation"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-300 font-light leading-relaxed">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="forgot-password-email" className="text-slate-200 font-light text-xs sm:text-sm">
                  Email Address
                </Label>
                <Input
                  id="forgot-password-email"
                  type="email"
                  autoComplete="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 sm:h-12 text-base focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                  placeholder="your.email@example.com"
                  required
                  disabled={forgotPasswordLoading}
                  autoFocus
                />
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPasswordDialog(false)
                    setForgotPasswordEmail("")
                    setError(null)
                    setForgotPasswordSuccess(false)
                  }}
                  className="border-slate-600/50 text-slate-200 hover:bg-white/10 w-full sm:w-auto min-h-[44px] touch-manipulation"
                  disabled={forgotPasswordLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium w-full sm:w-auto min-h-[44px] touch-manipulation"
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
