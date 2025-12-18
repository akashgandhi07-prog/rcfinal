"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, BookOpen, ShieldCheck, User as UserIcon, ClipboardCheck } from "lucide-react"
import { CommentsFeed } from "./comments-feed"
import { DashboardWidgets } from "./dashboard-widgets"
import { getCurrentUser, getUserById } from "@/lib/supabase/queries"
import { useEffect, useState } from "react"
import type { User } from "@/lib/supabase/types"
import { logger } from "@/lib/utils/logger"

interface DashboardViewProps {
  viewMode: "student" | "parent" | "mentor"
  studentId?: string
}

export function DashboardView({ viewMode, studentId }: DashboardViewProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [studentData, setStudentData] = useState<User | null>(null)

  useEffect(() => {
    let mounted = true
    
    // Use a small delay to let auth provider initialize first
    const loadUser = async () => {
      // Small delay to avoid race condition with auth provider
      await new Promise(resolve => setTimeout(resolve, 100))
      if (!mounted) return
      
      try {
        const user = await getCurrentUser()
        if (mounted && user) {
          setCurrentUserId(user.id)
        }
      } catch (error) {
        if (mounted) {
          logger.error("Error loading current user in dashboard view", error)
        }
      }
    }
    loadUser()
    
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    
    const loadStudentData = async () => {
      const displayId = studentId || currentUserId
      if (!displayId || !mounted) return
      
      try {
        const data = await getUserById(displayId)
        if (mounted) {
          setStudentData(data)
        }
      } catch (error) {
        if (mounted) {
          logger.error("Error loading student data", error, { studentId: displayId })
        }
      }
    }
    loadStudentData()
    
    return () => {
      mounted = false
    }
  }, [studentId, currentUserId])

  const displayStudentId = studentId || currentUserId
  
  const courseName = studentData?.target_course 
    ? studentData.target_course.charAt(0).toUpperCase() + studentData.target_course.slice(1)
    : "Not set"
  const currentYear = new Date().getFullYear()
  const entryYear = studentData?.entry_year || `${currentYear + 1}`
  const country = studentData?.country || "Not specified"
  const approval = studentData?.approval_status || "pending"
  const onboarding = studentData?.onboarding_status || "pending"
  const role = studentData?.role || "student"

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Dashboard Widgets */}
      {displayStudentId && (
        <DashboardWidgets studentId={displayStudentId} viewMode={viewMode} />
      )}

      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-light text-slate-900">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-start gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg bg-slate-50">
            <BookOpen size={18} className="text-[#D4AF37] flex-shrink-0" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">Course & Entry</p>
              <p className="text-sm sm:text-base text-slate-900 font-light break-words">{courseName} {entryYear} Entry</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg bg-slate-50">
            <MapPin size={18} className="text-[#D4AF37] flex-shrink-0" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">Location</p>
              <p className="text-sm sm:text-base text-slate-900 font-light break-words">{country}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg bg-slate-50">
            <UserIcon size={18} className="text-[#D4AF37] flex-shrink-0" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">Role</p>
              <p className="text-sm sm:text-base text-slate-900 font-light capitalize">{role}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg bg-slate-50">
            <ShieldCheck size={18} className="text-[#D4AF37] flex-shrink-0" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">Approval</p>
              <p className="text-sm sm:text-base text-slate-900 font-light capitalize">{approval}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg bg-slate-50">
            <ClipboardCheck size={18} className="text-[#D4AF37] flex-shrink-0" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">Onboarding</p>
              <p className="text-sm sm:text-base text-slate-900 font-light capitalize">{onboarding}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {displayStudentId && (
        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg font-light text-slate-900">Mentor & Admin Comments</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <CommentsFeed studentId={displayStudentId} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
