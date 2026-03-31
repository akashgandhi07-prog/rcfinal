"use client"

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser, clearUserCache } from "@/lib/supabase/queries"
import type { User } from "@/lib/supabase/types"
import { logger } from "@/lib/utils/logger"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const refreshInProgress = useRef(false)

  const refreshUser = async (forceRefresh = false) => {
    // Prevent concurrent refreshes
    if (refreshInProgress.current && !forceRefresh) {
      return
    }

    refreshInProgress.current = true
    try {
      const currentUser = await getCurrentUser(forceRefresh)
      setUser(currentUser)
      setIsAuthenticated(!!currentUser)
    } catch (error) {
      logger.error("Error refreshing user", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      refreshInProgress.current = false
    }
  }

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          // Check for refresh token errors - clear invalid session
          if (sessionError.message?.includes("Refresh Token") || sessionError.message?.includes("refresh_token")) {
            logger.warn("Invalid refresh token detected, clearing session", { error: sessionError.message })
            await supabase.auth.signOut()
          } else {
            logger.error("Session error", sessionError)
          }
          
          if (mounted) {
            setIsAuthenticated(false)
            setUser(null)
            setIsLoading(false)
          }
          return
        }

        if (session) {
          const currentUser = await getCurrentUser()
          if (mounted) {
            setUser(currentUser)
            setIsAuthenticated(!!currentUser)
          }
        } else {
          if (mounted) {
            setIsAuthenticated(false)
            setUser(null)
          }
        }
      } catch (error) {
        logger.error("Error checking auth", error)
        if (mounted) {
          setIsAuthenticated(false)
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        // Handle token refresh errors
        if (event === "TOKEN_REFRESHED" && !session) {
          // Token refresh failed, sign out
          logger.warn("Token refresh failed, signing out")
          await supabase.auth.signOut()
          clearUserCache()
          setUser(null)
          setIsAuthenticated(false)
          return
        }
        
        if (session) {
          // Clear cache on auth state change to force refresh
          clearUserCache()
          await refreshUser(true)
        } else {
          clearUserCache()
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}





