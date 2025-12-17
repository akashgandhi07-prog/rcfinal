"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, X, Edit2, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { createMentorComment, getMentorComments, updateMentorComment, deleteMentorComment, getCurrentUser, getUserById } from "@/lib/supabase/queries"
import type { MentorComment, CommentType, CommentSection } from "@/lib/supabase/types"
import type { User } from "@/lib/supabase/types"

interface MentorCommentsProps {
  studentId: string
  section: CommentSection
  sectionItemId?: string | null
  viewMode: "student" | "parent" | "mentor"
  currentUserId?: string
}

export function MentorComments({ studentId, section, sectionItemId, viewMode, currentUserId }: MentorCommentsProps) {
  const [comments, setComments] = useState<MentorComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddComment, setShowAddComment] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [commentType, setCommentType] = useState<CommentType>("feedback")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [impersonateUserId, setImpersonateUserId] = useState<string>("")
  const [allMentors, setAllMentors] = useState<User[]>([])

  useEffect(() => {
    loadComments()
    loadCurrentUser()
  }, [studentId, section, sectionItemId, currentUserId])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const data = await getMentorComments(studentId, section, sectionItemId || null)
      setComments(data)
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCurrentUser = async () => {
    try {
      if (currentUserId) {
        const user = await getUserById(currentUserId)
        setCurrentUser(user)
        return
      }
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      console.error("Error loading current user for comments:", error)
    }
  }

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        // Reuse getAllUsers through supabase directly to keep dependency light
        const { data, error } = await supabase.from("users").select("*").in("role", ["mentor", "admin"])
        if (error) {
          console.error("Error loading mentors for impersonation:", error)
          return
        }
        setAllMentors((data || []) as User[])
      } catch (err) {
        console.error("Error loading mentors for impersonation:", err)
      }
    }
    fetchMentors()
  }, [])

  const handleAddComment = async () => {
    const authorId = impersonateUserId || currentUser?.id
    const authorRole = impersonateUserId
      ? allMentors.find((m) => m.id === impersonateUserId)?.role
      : currentUser?.role

    if (!commentText.trim() || !authorId || !authorRole) return
    if (authorRole !== "mentor" && authorRole !== "admin") return

    try {
      await createMentorComment(
        authorId,
        studentId,
        section,
        commentText,
        commentType,
        sectionItemId || null
      )
      setCommentText("")
      setCommentType("feedback")
      setShowAddComment(false)
      await loadComments()
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Failed to add comment. Please try again.")
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return

    try {
      await updateMentorComment(commentId, editText)
      setEditingComment(null)
      setEditText("")
      await loadComments()
    } catch (error) {
      console.error("Error updating comment:", error)
      alert("Failed to update comment. Please try again.")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await deleteMentorComment(commentId)
      await loadComments()
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Failed to delete comment. Please try again.")
    }
  }

  const canEdit = currentUser?.role === "mentor" || currentUser?.role === "admin"
  const isMentor = currentUser?.role === "mentor" || currentUser?.role === "admin"

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200 rounded-lg">
        <CardContent className="p-4">
          <p className="text-sm text-slate-500 font-light">Loading comments...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-slate-200 rounded-lg">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
              <h3 className="text-sm font-light text-slate-700">Mentor Comments</h3>
            </div>
            {isMentor && !showAddComment && (
              <Button
                size="sm"
                onClick={() => setShowAddComment(true)}
                className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light text-xs"
              >
                <MessageSquare size={12} className="mr-1" />
                Add Comment
              </Button>
            )}
          </div>

          {showAddComment && isMentor && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              {currentUser?.role === "admin" && (
                <div className="space-y-2">
                  <Label className="text-xs text-slate-600 font-light">Act as (mentor/admin)</Label>
                  <Select
                    value={impersonateUserId}
                    onValueChange={(value) => setImpersonateUserId(value)}
                  >
                    <SelectTrigger className="rounded-lg h-8 text-xs">
                      <SelectValue placeholder="Self" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="">Self</SelectItem>
                      {allMentors.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.full_name || m.email} ({m.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-light">Comment Type</Label>
                <Select value={commentType} onValueChange={(value) => setCommentType(value as CommentType)}>
                  <SelectTrigger className="rounded-lg h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="plan">Plan / Action Items</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add your comment..."
                  className="rounded-lg text-sm min-h-[80px] resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddComment(false)
                    setCommentText("")
                  }}
                  className="rounded-lg text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg text-xs"
                >
                  <Send size={12} className="mr-1" />
                  Post
                </Button>
              </div>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 font-light text-center py-4">
              No comments yet. {isMentor && "Be the first to add feedback!"}
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-900">
                          {(comment as any).mentor?.full_name || (comment as any).mentor?.email || "Mentor"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(comment.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
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
                      {editingComment === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="rounded-lg text-sm min-h-[60px] resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditComment(comment.id)}
                              className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingComment(null)
                                setEditText("")
                              }}
                              className="rounded-lg text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-700 font-light whitespace-pre-wrap">{comment.comment_text}</p>
                      )}
                    </div>
                    {canEdit && editingComment !== comment.id && (
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => {
                            setEditingComment(comment.id)
                            setEditText(comment.comment_text)
                          }}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <Edit2 size={12} className="text-slate-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


