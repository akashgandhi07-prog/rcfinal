"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginScreen } from "@/components/portal/login-screen"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardView } from "@/components/portal/dashboard-view"
import { ProfileView } from "@/components/dashboard/views/profile-view"
import { PortfolioBuilder } from "@/components/portal/portfolio-builder"
import { UCATTracker } from "@/components/dashboard/views/ucat-tracker"
import { StrategyKanban } from "@/components/dashboard/views/strategy-kanban"
import { InterviewPrep } from "@/components/portal/interview-prep"
import { AdminView } from "@/components/portal/admin-view"
import { SettingsView } from "@/components/portal/settings-view"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser, updateUser, isFeatureEnabled, getLinkedStudents } from "@/lib/supabase/queries"
import type { ApprovalStatus, User } from "@/lib/supabase/types"
import { FeatureName } from "@/lib/supabase/types"
import type { OnboardingData } from "@/components/onboarding/onboarding-wizard"
import { ParentStudentSelector } from "@/components/portal/parent-student-selector"
import { getLinkedStudentsForMentor } from "@/lib/supabase/queries"

export type ViewMode = "student" | "parent" | "mentor"
export type ActiveView = "dashboard" | "profile" | "portfolio" | "ucat" | "strategy" | "interview" | "settings" | "admin"

export default function PortalPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [activeView, setActiveView] = useState<ActiveView>("dashboard")
  const [viewMode, setViewMode] = useState<ViewMode>("student")
  const [isAdmin, setIsAdmin] = useState(false)
  const [showUCAT, setShowUCAT] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      // Check if user is admin
      setIsAdmin(user.role === "admin")
      if (user.role === "admin" && activeView !== "admin") {
        setActiveView("admin")
      }

      // If user is a parent, set viewMode to parent and load linked students
      if (user.role === "parent") {
        setViewMode("parent")
        loadLinkedStudents()
      } else if (user.role === "mentor") {
        setViewMode("mentor")
        loadLinkedStudentsForMentor()
      } else {
        setViewMode("student")
        setSelectedStudent(user) // Students view their own data
      }

      // Check if UCAT should be shown based on target_course
      const targetUser = selectedStudent || user
      if (targetUser?.target_course === "veterinary") {
        setShowUCAT(false)
        // If currently viewing UCAT and it should be hidden, redirect to dashboard
        if (activeView === "ucat") {
          setActiveView("dashboard")
        }
      } else {
        setShowUCAT(true)
      }

      // Check feature toggles
      checkFeatureToggles()
    }
  }, [user, selectedStudent, activeView])

  const loadLinkedStudents = async () => {
    if (!user || user.role !== "parent") return
    
    try {
      const students = await getLinkedStudents(user.id)
      if (students.length > 0) {
        setSelectedStudent(students[0]) // Auto-select first student
      }
    } catch (error) {
      console.error("Error loading linked students:", error)
    }
  }

  const loadLinkedStudentsForMentor = async () => {
    if (!user || user.role !== "mentor") return
    
    try {
      const students = await getLinkedStudentsForMentor(user.id)
      if (students.length > 0) {
        setSelectedStudent(students[0]) // Auto-select first student
      }
    } catch (error) {
      console.error("Error loading linked students for mentor:", error)
    }
  }

  const checkAuth = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        return
      }

      // Single user fetch with 3s guard
      const userFetch = getCurrentUser()
      const timeout = new Promise<User | null>((resolve) =>
        setTimeout(() => resolve(null), 3000)
      )
      const currentUser = await Promise.race([userFetch, timeout])

      if (!currentUser) {
        // If we cannot load profile quickly, fall back to login
        await supabase.auth.signOut()
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        return
      }

      const isAdmin = currentUser.role === "admin"
      const isApproved = currentUser.approval_status === "approved" || isAdmin

      if (!isApproved) {
        await supabase.auth.signOut()
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        return
      }

      setIsAuthenticated(true)
      setUser(currentUser)
    } catch (error) {
      console.error("Auth check error:", error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const checkFeatureToggles = async () => {
    if (!user) return

    const ucatEnabled = await isFeatureEnabled(user.id, FeatureName.UCAT_TRACKER)
    if (!ucatEnabled) {
      setShowUCAT(false)
    }
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) return

    const updates: {
      full_name: string | null
      date_of_birth: string | null
      home_address: string | null
      contact_number: string | null
      country: string | null
      fee_status: "home" | "international" | "unsure" | null
      entry_year: number | null
      parent_name: string | null
      parent_phone: string | null
      parent_email: string | null
      parent2_name: string | null
      parent2_phone: string | null
      parent2_email: string | null
      school_name: string | null
      gcse_summary: string | null
      a_level_predictions: string | null
      target_course: "medicine" | "dentistry" | "veterinary" | null
      onboarding_status: "complete"
    } = {
      full_name: data.full_name || null,
      date_of_birth: data.date_of_birth || null,
      home_address: data.home_address || null,
      contact_number: data.contact_number || null,
      country: data.country || null,
      fee_status: data.fee_status || null,
      entry_year: data.entry_year || null,
      parent_name: data.parent_name || null,
      parent_phone: data.parent_phone || null,
      parent_email: data.parent_email || null,
      parent2_name: data.parent2_name || null,
      parent2_phone: data.parent2_phone || null,
      parent2_email: data.parent2_email || null,
      school_name: data.school_name || null,
      gcse_summary: data.gcse_grades && data.gcse_grades.length > 0
        ? data.gcse_grades
            .filter(g => g.subject && g.grade)
            .map(g => `${g.subject}: ${g.grade}`)
            .join(", ")
        : null,
      a_level_predictions: data.a_level_grades && data.a_level_grades.length > 0
        ? data.a_level_grades
            .filter(g => g.subject && g.grade)
            .map(g => `${g.subject}: ${g.grade}`)
            .join(", ")
        : null,
      target_course: data.target_course || null,
      onboarding_status: "complete",
    }

    const updatedUser = await updateUser(user.id, updates)
    if (updatedUser) {
      setUser(updatedUser)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      setUser(null)
      router.push("/portal")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
      alert("Failed to logout. Please try again.")
    }
  }

  const handleResetOnboarding = async () => {
    if (!user) return
    
    try {
      await updateUser(user.id, { onboarding_status: "pending" })
      const updatedUser = await getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
    } catch (error) {
      console.error("Error resetting onboarding:", error)
    }
  }

  const handleImpersonate = (studentId: string) => {
    // This would be implemented with admin context
    // For now, just a placeholder
    router.push(`/portal?student=${studentId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-slate-300 font-light">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />
  }

  const approvalStatus = (user?.approval_status as ApprovalStatus | undefined) || "approved"

  // If account is not yet approved by admin, show holding screen instead of onboarding/dashboard
  if (approvalStatus === "pending") {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-serif text-[#D4AF37] tracking-wide">
            Your portal is almost ready
          </h1>
          <p className="text-sm md:text-base text-slate-200 font-light">
            Thank you for registering with The Regent&apos;s Consultancy. A senior consultant will now review your
            details and activate your private client portal. You&apos;ll receive an email once approval is complete.
          </p>
          <p className="text-xs text-slate-400 font-light">
            If you believe this is taking too long, please contact your Regent&apos;s liaison or email the office and
            quote the email address you used to register.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 text-xs border border-slate-600/60 text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  if (approvalStatus === "rejected") {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-serif text-red-200 tracking-wide">
            Access request not approved
          </h1>
          <p className="text-sm md:text-base text-slate-200 font-light">
            Your request for portal access has not been approved at this time. For clarification or to discuss this
            decision, please contact The Regent&apos;s Consultancy directly.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 text-xs border border-slate-600/60 text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
          >
            Return to main site
          </button>
        </div>
      </div>
    )
  }

  // Show onboarding if pending (and account is approved) - only for students and parents
  // Admins and mentors skip onboarding
  if (user?.onboarding_status === "pending" && (user.role === "student" || user.role === "parent")) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }


  // Filter out UCAT from sidebar if not applicable
  const availableViews: ActiveView[] = showUCAT
    ? ["dashboard", "profile", "portfolio", "ucat", "strategy", "interview", "settings"]
    : ["dashboard", "profile", "portfolio", "strategy", "interview", "settings"]

  if (isAdmin) {
    availableViews.push("admin")
  }

  // Determine which user's data to show
  const displayUser = selectedStudent || user
  const studentName = displayUser?.full_name || "Student"

  return (
    <DashboardShell
      studentName={studentName}
      viewMode={viewMode}
      isAdmin={isAdmin}
      activeView={activeView}
      onViewChange={setActiveView}
      onViewModeChange={setViewMode}
      onLogout={handleLogout}
      showUCAT={showUCAT}
    >
      {/* Parent/Mentor Student Selector */}
      {(user?.role === "parent" || user?.role === "mentor") && (
        <div className="mb-6">
          <ParentStudentSelector
            currentUserId={user.id}
            onStudentSelect={setSelectedStudent}
          />
        </div>
      )}

      {activeView === "dashboard" && (
        <DashboardView 
          viewMode={viewMode} 
          studentId={displayUser?.id}
        />
      )}
      {activeView === "profile" && <ProfileView viewMode={viewMode} userData={displayUser} />}
      {activeView === "portfolio" && (
        <PortfolioBuilder 
          viewMode={viewMode} 
          studentId={displayUser?.id}
        />
      )}
      {activeView === "ucat" && showUCAT && (
        <UCATTracker 
          viewMode={viewMode} 
          studentId={displayUser?.id}
        />
      )}
      {activeView === "strategy" && <StrategyKanban viewMode={viewMode} userData={displayUser} />}
      {activeView === "interview" && <InterviewPrep viewMode={viewMode} />}
      {activeView === "admin" && isAdmin && <AdminView onImpersonate={handleImpersonate} />}
      {activeView === "settings" && (
        <SettingsView 
          viewMode={viewMode} 
          onResetOnboarding={handleResetOnboarding}
          onLogout={handleLogout}
        />
      )}
    </DashboardShell>
  )
}
