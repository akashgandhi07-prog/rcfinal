"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidLink, setIsValidLink] = useState(false)

  useEffect(() => {
    // Supabase password reset links automatically establish a session when clicked
    // The link contains tokens that Supabase processes automatically
    const verifyResetLink = async () => {
      setIsVerifying(true)
      setError(null)

      try {
        // Wait briefly for Supabase to process the URL token if present
        await new Promise(resolve => setTimeout(resolve, 300))

        // Check if user has a valid session (Supabase auto-establishes session from reset link)
        const verifyPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ data: { user: null } }), 3000))
        const { data: { user } } = (await Promise.race([verifyPromise, timeoutPromise])) as any
        
        // Check for URL parameters/fragments that indicate a reset link
        const accessToken = searchParams.get("access_token")
        const type = searchParams.get("type")
        const hash = typeof window !== 'undefined' ? window.location.hash : ''
        const hasTokenInUrl = accessToken || type === "recovery" || (hash && hash.includes("access_token"))
        
        // If we have a user session OR token in URL, the link is valid
        // Supabase automatically handles token exchange, so we just need to allow the form
        if (user || hasTokenInUrl) {
          setIsValidLink(true)
        } else {
          // No session and no token - might be a direct visit or expired link
          // Allow user to try anyway, but show a warning
          setIsValidLink(true) // Allow them to try - updateUser will fail if no valid session
        }
      } catch (err) {
        console.error("Error verifying reset link:", err)
        // Allow user to proceed - the actual password update will validate
        setIsValidLink(true)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyResetLink()
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || !confirmPassword) {
      setError("Please enter both password fields")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const updatePromise = supabase.auth.updateUser({ password })
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Reset timed out. Please try again or request a new reset email.")), 8000)
      )

      const { error: updateError } = (await Promise.race([updatePromise, timeoutPromise])) as any

      if (updateError) {
        setError(updateError.message || "Reset link may be invalid or expired. Please request a new reset email.")
        return
      }

      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/portal")
      }, 2000)
    } catch (err: any) {
      console.error("Password reset error:", err)
      setError(err?.message || "An error occurred. Please try again or request a new reset email.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-6 py-12">
      <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 text-white max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif text-[#D4AF37] font-light tracking-wide">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isVerifying ? (
            <div className="space-y-4 text-center py-8">
              <p className="text-sm text-slate-300 font-light">Verifying reset link...</p>
            </div>
          ) : success ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-900/30 border border-emerald-700/60 rounded-lg">
                <p className="text-sm text-emerald-200 font-light">
                  Password reset successfully! Redirecting to login...
                </p>
              </div>
            </div>
          ) : !isValidLink ? (
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-lg">
                  <p className="text-sm text-red-300 font-light">{error}</p>
                </div>
              )}
              <div className="text-center py-4">
                <Button
                  type="button"
                  onClick={() => router.push("/portal")}
                  className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium rounded-lg h-11 px-6 shadow-lg shadow-[#D4AF37]/20"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-lg">
                  <p className="text-sm text-red-300 font-light">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-slate-200 font-light text-sm">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 pr-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                    placeholder="Enter new password"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-light">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password" className="text-slate-200 font-light text-sm">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/5 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg h-11 pr-11 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 font-medium rounded-lg h-11 shadow-lg shadow-[#D4AF37]/20 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push("/portal")}
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-slate-200 hover:bg-slate-700/50 hover:border-slate-500/50 rounded-lg h-11 font-light transition-all"
                  disabled={isLoading}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

