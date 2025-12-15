// Environment variable validation

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const

const optionalEnvVars = [
  "RESEND_API_KEY",
] as const

export function validateEnvVars(): void {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      "Please check your .env.local file."
    )
  }

  // Warn about optional but recommended vars
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Optional environment variable not set: ${envVar}`)
    }
  }
}

// Validate on import (server-side only)
if (typeof window === "undefined") {
  try {
    validateEnvVars()
  } catch (error) {
    console.error("Environment validation failed:", error)
    // Don't throw in development to allow for gradual setup
    if (process.env.NODE_ENV === "production") {
      throw error
    }
  }
}

