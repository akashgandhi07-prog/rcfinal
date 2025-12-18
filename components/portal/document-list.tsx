"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, Download, Trash2, Eye, Calendar, File, 
  MessageSquare, Upload
} from "lucide-react"
import { getStudentDocuments, deleteStudentDocument, getCurrentUser } from "@/lib/supabase/queries"
import { getFileDownloadUrl, formatFileSize, getFileIcon } from "@/lib/utils/file-upload"
import type { StudentDocument } from "@/lib/supabase/types"
import { showNotification } from "@/components/ui/notification"
import { logger } from "@/lib/utils/logger"
import { formatDistanceToNow } from "date-fns"
import { MentorComments } from "./mentor-comments"

interface DocumentListProps {
  userId: string
  category: 'personal_statement' | 'cv' | 'grades' | 'other'
  viewMode: "student" | "parent" | "mentor" | "admin"
  canEdit: boolean
  onDocumentDeleted?: () => void
}

export function DocumentList({ userId, category, viewMode, canEdit, onDocumentDeleted }: DocumentListProps) {
  const [documents, setDocuments] = useState<StudentDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    getCurrentUser().then(user => {
      if (mounted && user) setCurrentUserId(user.id)
    }).catch(() => {
      // Silently fail - user ID is optional
    })
    return () => { mounted = false }
  }, [])

  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const docs = await getStudentDocuments(userId, category)
      setDocuments(docs)
    } catch (error) {
      logger.error("Error loading documents", error, { userId, category })
      showNotification("Failed to load documents", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [userId, category])

  const handleDownload = async (doc: StudentDocument) => {
    setDownloadingId(doc.id)
    try {
      const url = await getFileDownloadUrl(doc.file_path)
      if (url) {
        const link = document.createElement('a')
        link.href = url
        link.download = doc.file_name
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        setTimeout(() => {
          document.body.removeChild(link)
        }, 100)
        showNotification("Document downloaded", "success")
      } else {
        showNotification("Failed to generate download link", "error")
      }
    } catch (error) {
      logger.error("Error downloading document", error, { documentId: doc.id })
      showNotification("Failed to download document", "error")
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (doc: StudentDocument) => {
    if (!confirm(`Are you sure you want to delete "${document.title}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(doc.id)
    try {
      const success = await deleteStudentDocument(doc.id)
      if (success) {
        showNotification("Document deleted successfully", "success")
        await loadDocuments()
        onDocumentDeleted?.()
      } else {
        showNotification("Failed to delete document", "error")
      }
    } catch (error) {
      logger.error("Error deleting document", error, { documentId: doc.id })
      showNotification("Failed to delete document", "error")
    } finally {
      setDeletingId(null)
    }
  }

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'personal_statement':
        return 'Personal Statement'
      case 'cv':
        return 'CV'
      case 'grades':
        return 'Grades'
      case 'other':
        return 'Other'
      default:
        return cat
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-slate-500 font-light">Loading documents...</p>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText size={32} className="mx-auto text-slate-300 mb-2" />
        <p className="text-sm text-slate-500 font-light">No {getCategoryLabel(category)} documents uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="bg-white border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{getFileIcon(doc.mime_type)}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate">{doc.title}</h4>
                    {doc.description && (
                      <p className="text-xs text-slate-600 font-light mt-1 line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg h-8 w-8 p-0 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-light">
                  <span className="flex items-center gap-1">
                    <File size={12} />
                    {doc.file_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                  </span>
                  <span>{formatFileSize(doc.file_size)}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                    className="rounded-lg text-xs h-8"
                  >
                    <Download size={14} className="mr-1" />
                    {downloadingId === doc.id ? "Downloading..." : "Download"}
                  </Button>
                </div>

                {/* Mentor Comments Section */}
                {(viewMode === "mentor" || viewMode === "admin") && currentUserId && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <MentorComments
                      studentId={userId}
                      section="documents"
                      sectionItemId={doc.id}
                      viewMode={viewMode === "admin" ? "mentor" : viewMode}
                      currentUserId={currentUserId}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

