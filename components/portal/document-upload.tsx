"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { uploadFile } from "@/lib/utils/file-upload"
import { createStudentDocument, getCurrentUser } from "@/lib/supabase/queries"
import { showNotification } from "@/components/ui/notification"
import { logger } from "@/lib/utils/logger"
import type { StudentDocument } from "@/lib/supabase/types"

interface DocumentUploadProps {
  userId: string
  category?: 'personal_statement' | 'cv' | 'grades' | 'other'
  onUploadComplete?: () => void
}

export function DocumentUpload({ userId, category: initialCategory, onUploadComplete }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState<'personal_statement' | 'cv' | 'grades' | 'other'>(initialCategory || 'personal_statement')
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [customTitle, setCustomTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Load current user for upload tracking (only once)
  useEffect(() => {
    let mounted = true
    getCurrentUser().then(user => {
      if (mounted && user) setCurrentUserId(user.id)
    }).catch(() => {
      // Silently fail - user ID is optional for uploads
    })
    return () => { mounted = false }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-set title if not set
      if (!title || category !== 'other') {
        if (category === 'personal_statement') {
          setTitle('Personal Statement')
        } else if (category === 'cv') {
          setTitle('CV')
        } else if (category === 'grades') {
          setTitle('Grades')
        } else if (category === 'other' && !customTitle) {
          setCustomTitle(file.name.replace(/\.[^/.]+$/, "")) // Remove extension
        }
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      if (category === 'other' && !customTitle) {
        setCustomTitle(file.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !currentUserId) {
      showNotification("Please select a file", "error")
      return
    }

    // Validate title for "other" category
    if (category === 'other' && !customTitle.trim()) {
      showNotification("Please provide a title for this document", "error")
      return
    }

    const finalTitle = category === 'other' ? customTitle.trim() : title || getDefaultTitle(category)

    setIsUploading(true)
    try {
      // Upload file to storage
      const uploadResult = await uploadFile(selectedFile, userId, category)
      
      if (!uploadResult.success || !uploadResult.filePath) {
        showNotification(uploadResult.error || "Failed to upload file", "error")
        return
      }

      // Create document record
      const document = await createStudentDocument(userId, currentUserId, {
        category,
        title: finalTitle,
        description: description.trim() || null,
        file_path: uploadResult.filePath,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
      })

      if (document) {
        showNotification("Document uploaded successfully", "success")
        // Reset form
        setSelectedFile(null)
        setTitle("")
        setDescription("")
        setCustomTitle("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        onUploadComplete?.()
      } else {
        showNotification("Failed to save document record", "error")
        // Clean up uploaded file if document creation failed
        // (In production, you might want to implement cleanup)
      }
    } catch (error) {
      logger.error("Error uploading document", error, { userId, category })
      showNotification("Failed to upload document", "error")
    } finally {
      setIsUploading(false)
    }
  }

  const getDefaultTitle = (cat: string) => {
    switch (cat) {
      case 'personal_statement':
        return 'Personal Statement'
      case 'cv':
        return 'CV'
      case 'grades':
        return 'Grades'
      default:
        return 'Document'
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="bg-slate-50 border-slate-200 rounded-lg">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Category Selector */}
          {!initialCategory && (
            <div className="space-y-2">
              <Label className="text-sm text-slate-700 font-light">Document Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger className="rounded-lg bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal_statement">Personal Statement</SelectItem>
                  <SelectItem value="cv">CV</SelectItem>
                  <SelectItem value="grades">Grades</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title Input - Custom for "other", auto-filled for others */}
          {category === 'other' ? (
            <div className="space-y-2">
              <Label className="text-sm text-slate-700 font-light">Document Title *</Label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g., Reference Letter, Certificate, etc."
                className="rounded-lg bg-white"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm text-slate-700 font-light">Document Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={getDefaultTitle(category)}
                className="rounded-lg bg-white"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-700 font-light">Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any notes or comments about this document..."
              rows={2}
              className="rounded-lg bg-white"
            />
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-700 font-light">File *</Label>
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#D4AF37] transition-colors cursor-pointer bg-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 font-light mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 font-light">
                  PDF, Word documents, or images (max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg p-3 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText size={20} className="text-slate-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 font-light">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-slate-600 hover:text-red-600 rounded-lg"
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || (category === 'other' && !customTitle.trim())}
            className="w-full bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

