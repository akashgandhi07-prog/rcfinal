"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-serif text-[#D4AF37] mb-4 font-light">Something went wrong</h1>
        <p className="text-slate-300 mb-8 font-light">
          We apologize for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg font-light"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}

