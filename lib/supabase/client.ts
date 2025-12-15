import { createClient } from '@supabase/supabase-js'
import { validateEnvVars } from '@/lib/utils/env'

// Validate environment variables
if (typeof window === "undefined") {
  try {
    validateEnvVars()
  } catch (error) {
    // In development, allow missing vars for gradual setup
    if (process.env.NODE_ENV === "production") {
      throw error
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

