"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Calendar, Award, MapPin, BookOpen } from "lucide-react"
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
  
  // Format course name
  const courseName = studentData?.target_course 
    ? studentData.target_course.charAt(0).toUpperCase() + studentData.target_course.slice(1)
    : "Course"
  
  // Calculate entry year (assuming current year + 1 for typical application cycle)
  const currentYear = new Date().getFullYear()
  const entryYear = studentData?.entry_year || currentYear + 1
  
  // Get country from home_address or country field
  const country = studentData?.country || "Not specified"

  return (
    <div className="space-y-6">
      {/* Student Info Header */}
      <Card className="bg-white border-slate-200 rounded-none">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-light">Target Course</p>
                <p className="text-lg font-light text-slate-900">{courseName} {entryYear} Entry</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-light">Location</p>
                <p className="text-lg font-light text-slate-900">{country}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-light text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
              Latest UCAT Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-light text-slate-900">3020</div>
            <p className="text-sm text-green-600 mt-2 font-light">+120 from previous</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-light text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Target size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
              Target Universities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-light text-slate-900">8</div>
            <p className="text-sm text-slate-500 mt-2 font-light">Shortlisted institutions</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-light text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
              Next Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light text-slate-900">UCAT Exam</div>
                <p className="text-sm text-slate-500 mt-2 font-light">15th June 2026</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-light text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Award size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
              Portfolio Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-light text-slate-900">12</div>
            <p className="text-sm text-slate-500 mt-2 font-light">Verified experiences</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Logged Mock UCAT", detail: "Official UCAT - Score: 3020", time: "2 hours ago" },
              { action: "Added Work Experience", detail: "Royal London Hospital shadowing", time: "1 day ago" },
              { action: "Updated Personal Statement", detail: "Draft revision 3", time: "3 days ago" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                <div>
                  <p className="text-sm text-slate-900 font-light">{item.action}</p>
                  <p className="text-xs text-slate-600 mt-1 font-light">{item.detail}</p>
                </div>
                <span className="text-xs text-slate-500 font-light">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mentor Comments Feed */}
      {displayStudentId && (
        <CommentsFeed studentId={displayStudentId} />
      )}
    </div>
  )
}
