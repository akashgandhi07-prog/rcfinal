"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/utils/logger"
import { clearUserCache } from "@/lib/supabase/queries"
import { supabase } from "@/lib/supabase/client"

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error
    logger.error("Portal error", error)
    
    // Clear user cache to prevent stale state
    clearUserCache()
    
    // Clear any problematic session state
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_access_granted")
      sessionStorage.removeItem("admin_access_timestamp")
    }
  }, [error])

  const handleReload = async () => {
    // Clear cache and reload
    clearUserCache()
    // Don't sign out - just reload to let user try again
    window.location.href = "/portal"
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-serif text-[#D4AF37] mb-4 font-light">Portal Error</h1>
        <p className="text-slate-300 mb-8 font-light">
          An error occurred in the portal. Please try again or contact support.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
          >
            Try again
          </Button>
          <Button
            onClick={handleReload}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg font-light"
          >
            Reload Portal
          </Button>
        </div>
      </div>
    </div>
  )
}




