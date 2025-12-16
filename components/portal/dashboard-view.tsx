"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, BookOpen, ShieldCheck, User as UserIcon, ClipboardCheck } from "lucide-react"
import { CommentsFeed } from "./comments-feed"
import { getCurrentUser, getUserById } from "@/lib/supabase/queries"
import { useEffect, useState } from "react"
import type { User } from "@/lib/supabase/types"

interface DashboardViewProps {
  viewMode: "student" | "parent" | "mentor"
  studentId?: string
}

export function DashboardView({ viewMode, studentId }: DashboardViewProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [studentData, setStudentData] = useState<User | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    const loadStudentData = async () => {
      const displayId = studentId || currentUserId
      if (displayId) {
        const data = await getUserById(displayId)
        setStudentData(data)
      }
    }
    loadStudentData()
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
    <div className="space-y-6">
      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
            <BookOpen size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">Course & Entry</p>
              <p className="text-sm text-slate-900 font-light">{courseName} {entryYear} Entry</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
            <MapPin size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">Location</p>
              <p className="text-sm text-slate-900 font-light">{country}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
            <UserIcon size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">Role</p>
              <p className="text-sm text-slate-900 font-light capitalize">{role}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
            <ShieldCheck size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">Approval</p>
              <p className="text-sm text-slate-900 font-light capitalize">{approval}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
            <ClipboardCheck size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">Onboarding</p>
              <p className="text-sm text-slate-900 font-light capitalize">{onboarding}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {displayStudentId && (
        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-lg font-light text-slate-900">Mentor & Admin Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentsFeed studentId={displayStudentId} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
