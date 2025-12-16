"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Clock } from "lucide-react"
import { getMentorComments } from "@/lib/supabase/queries"
import type { MentorComment } from "@/lib/supabase/types"

interface CommentsFeedProps {
  studentId: string
}

export function CommentsFeed({ studentId }: CommentsFeedProps) {
  const [comments, setComments] = useState<(MentorComment & { mentor?: { full_name: string | null; email: string } })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [studentId])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      // Get all comments across all sections for the dashboard feed
      const data = await getMentorComments(studentId)
      setComments(data.slice(0, 10)) // Show latest 10 comments
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      dashboard: "Dashboard",
      profile: "Profile",
      portfolio: "Portfolio",
      ucat: "UCAT Tracker",
      strategy: "University Strategy",
      interview: "Interview Prep",
      work_experience: "Work Experience",
      volunteering: "Volunteering",
      supracurricular: "Supracurricular",
    }
    return labels[section] || section
  }

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200 rounded-lg">
        <CardContent className="p-4">
          <p className="text-sm text-slate-500 font-light">Loading comments...</p>
        </CardContent>
      </Card>
    )
  }

  if (comments.length === 0) {
    return (
      <Card className="bg-white border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
            Mentor Comments Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 font-light text-center py-4">
            No mentor comments yet. Check back later for feedback and suggestions.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-slate-200 rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
          Mentor Comments Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900">
                      {comment.mentor?.full_name || comment.mentor?.email || "Mentor"}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(comment.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{getSectionLabel(comment.section)}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        comment.comment_type === "plan"
                          ? "bg-blue-100 text-blue-700"
                          : comment.comment_type === "suggestion"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {comment.comment_type === "plan" ? "Plan" : comment.comment_type === "suggestion" ? "Suggestion" : "Feedback"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 font-light whitespace-pre-wrap">{comment.comment_text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


