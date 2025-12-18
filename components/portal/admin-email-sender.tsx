"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Send, Users, FileText, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser } from "@/lib/supabase/queries"
import type { User } from "@/lib/supabase/types"
import { showNotification } from "@/components/ui/notification"
import { logger } from "@/lib/utils/logger"
// Activity logging removed

interface AdminEmailSenderProps {
  onEmailSent?: () => void
}

export function AdminEmailSender({ onEmailSent }: AdminEmailSenderProps) {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [isLoading, setIsLoading] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filterRole, setFilterRole] = useState<string>("")
  const [filterCourse, setFilterCourse] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  
  // Single email state
  const [singleRecipient, setSingleRecipient] = useState("")
  const [singleSubject, setSingleSubject] = useState("")
  const [singleContent, setSingleContent] = useState("")
  const [singleTemplate, setSingleTemplate] = useState<string>("custom")
  
  // Bulk email state
  const [bulkSubject, setBulkSubject] = useState("")
  const [bulkContent, setBulkContent] = useState("")
  const [bulkTemplate, setBulkTemplate] = useState<string>("custom")
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('email', { ascending: true })

      if (error) throw error
      setAllUsers((data || []) as User[])
    } catch (error) {
      logger.error("Error loading users", error)
      showNotification("Failed to load users", "error")
    }
  }

  // Filter users based on criteria
  const filteredUsers = allUsers.filter(user => {
    if (filterRole && user.role !== filterRole) return false
    if (filterCourse && user.target_course !== filterCourse) return false
    if (filterStatus && user.approval_status !== filterStatus) return false
    return true
  })

  // Email templates
  const templates: Record<string, { subject: string; content: string }> = {
    welcome: {
      subject: "Welcome to Regent's Consultancy",
      content: `Dear {name},

Welcome to Regent's Consultancy! We're delighted to have you join our program.

Your account has been approved and you can now access your private client portal at [portal URL].

If you have any questions, please don't hesitate to reach out.

Best regards,
The Regent's Consultancy Team`,
    },
    feedback_request: {
      subject: "Feedback Request - Regent's Consultancy",
      content: `Dear {name},

We'd like to request your feedback on your experience with Regent's Consultancy.

Please take a moment to share your thoughts via your client portal.

Thank you for your time.

Best regards,
The Regent's Consultancy Team`,
    },
    reminder: {
      subject: "Reminder: Upcoming Deadline",
      content: `Dear {name},

This is a friendly reminder about an upcoming deadline related to your application.

Please check your client portal for more details.

Best regards,
The Regent's Consultancy Team`,
    },
    update: {
      subject: "Important Update - Regent's Consultancy",
      content: `Dear {name},

We have an important update regarding your application and portfolio.

Please log into your client portal to view the latest information.

Best regards,
The Regent's Consultancy Team`,
    },
  }

  const applyTemplate = (templateName: string, isBulk: boolean) => {
    const template = templates[templateName]
    if (!template) return

    if (isBulk) {
      setBulkSubject(template.subject)
      setBulkContent(template.content)
      setBulkTemplate(templateName)
    } else {
      setSingleSubject(template.subject)
      setSingleContent(template.content)
      setSingleTemplate(templateName)
    }
  }

  const replaceTokens = (content: string, user: User): string => {
    return content
      .replace(/{name}/g, user.full_name || user.email.split('@')[0])
      .replace(/{email}/g, user.email)
      .replace(/{course}/g, user.target_course ? user.target_course.charAt(0).toUpperCase() + user.target_course.slice(1) : 'Not set')
      .replace(/{entryYear}/g, user.entry_year?.toString() || 'Not set')
  }

  const handleSendSingle = async () => {
    if (!singleRecipient || !singleSubject || !singleContent) {
      showNotification("Please fill in all required fields", "error")
      return
    }

    setIsLoading(true)
    let recipientEmail = "unknown"
    try {
      const user = allUsers.find(u => u.id === singleRecipient || u.email === singleRecipient)
      if (!user) {
        showNotification("Recipient not found", "error")
        setIsLoading(false)
        return
      }

      recipientEmail = user.email

      const personalizedContent = replaceTokens(singleContent, user)
      const personalizedSubject = replaceTokens(singleSubject, user)

      const response = await fetch('/api/send-admin-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: [user.email],
          subject: personalizedSubject,
          htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
              ${escapeHtml(personalizedSubject)}
            </h2>
            <div style="margin-top: 20px; line-height: 1.6; color: #333;">
              ${personalizedContent.replace(/\n/g, '<br>')}
            </div>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Regent's Consultancy<br/>
              Private Client Portal
            </p>
          </div>`,
          textContent: personalizedContent,
          fromName: "Regent's Consultancy",
        }),
      })

      const result = await response.json()

      if (result.success) {
        showNotification(`Email sent to ${user.email}`, "success")
        setSingleRecipient("")
        setSingleSubject("")
        setSingleContent("")
        setSingleTemplate("custom")
        onEmailSent?.()
      } else {
        showNotification(result.error || "Failed to send email", "error")
        
        // Activity logging removed
      }
    } catch (error) {
      logger.error("Error sending email", error, { recipient: recipientEmail })
      showNotification("Failed to send email", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendBulk = async () => {
    if (!bulkSubject || !bulkContent) {
      showNotification("Please fill in subject and content", "error")
      return
    }

    if (selectedUsers.length === 0) {
      showNotification("Please select at least one recipient", "error")
      return
    }

    setIsLoading(true)
    try {
      const recipients = allUsers
        .filter(u => selectedUsers.includes(u.id))
        .map(u => u.email)

      // Send emails in batches to avoid overwhelming the API
      const batchSize = 10
      const results = []
      const errors = []

      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize)
        
        for (const email of batch) {
          const user = allUsers.find(u => u.email === email)
          if (!user) continue

          const personalizedContent = replaceTokens(bulkContent, user)
          const personalizedSubject = replaceTokens(bulkSubject, user)

          try {
            const response = await fetch('/api/send-admin-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipients: [email],
                subject: personalizedSubject,
                htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
                    ${escapeHtml(personalizedSubject)}
                  </h2>
                  <div style="margin-top: 20px; line-height: 1.6; color: #333;">
                    ${personalizedContent.replace(/\n/g, '<br>')}
                  </div>
                  <p style="margin-top: 30px; color: #666; font-size: 12px;">
                    Regent's Consultancy<br/>
                    Private Client Portal
                  </p>
                </div>`,
                textContent: personalizedContent,
                fromName: "Regent's Consultancy",
              }),
            })

            const result = await response.json()
            if (result.success) {
              results.push(email)
            } else {
              errors.push({ email, error: result.error })
            }
          } catch (error) {
            errors.push({ email, error: error instanceof Error ? error.message : 'Unknown error' })
          }
        }

        // Small delay between batches
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Activity logging removed

      if (errors.length === 0) {
        showNotification(`Successfully sent ${results.length} email(s)`, "success")
      } else {
        showNotification(`Sent ${results.length} email(s), ${errors.length} failed`, "warning")
      }

      // Reset form
      setBulkSubject("")
      setBulkContent("")
      setBulkTemplate("custom")
      setSelectedUsers([])
      onEmailSent?.()
    } catch (error) {
      const recipientCount = Array.isArray(allUsers) ? allUsers.filter(u => selectedUsers.includes(u.id)).length : 0
      logger.error("Error sending bulk emails", error, { recipientCount })
      showNotification("Failed to send emails", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  return (
    <Card className="bg-white border-slate-200 rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
          <Mail className="h-5 w-5 text-[#D4AF37]" />
          Send Email
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "single" | "bulk")}>
          <TabsList className="grid w-full grid-cols-2 rounded-lg">
            <TabsTrigger value="single" className="rounded-lg">Single Email</TabsTrigger>
            <TabsTrigger value="bulk" className="rounded-lg">Bulk Email</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={singleTemplate} onValueChange={(v) => applyTemplate(v, false)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="feedback_request">Feedback Request</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recipient *</Label>
              <Select value={singleRecipient} onValueChange={setSingleRecipient}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={singleSubject}
                onChange={(e) => setSingleSubject(e.target.value)}
                placeholder="Email subject"
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={singleContent}
                onChange={(e) => setSingleContent(e.target.value)}
                placeholder="Email content (use {name}, {email}, {course}, {entryYear} for personalization)"
                rows={8}
                className="rounded-lg"
              />
              <p className="text-xs text-slate-500 font-light">
                Available tokens: {"{name}"}, {"{email}"}, {"{course}"}, {"{entryYear}"}
              </p>
            </div>

            <Button
              onClick={handleSendSingle}
              disabled={isLoading || !singleRecipient || !singleSubject || !singleContent}
              className="w-full bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
            >
              <Send size={16} className="mr-2" />
              {isLoading ? "Sending..." : "Send Email"}
            </Button>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Filter by Role</Label>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Roles</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Filter by Course</Label>
                  <Select value={filterCourse} onValueChange={setFilterCourse}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="All courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Courses</SelectItem>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="dentistry">Dentistry</SelectItem>
                      <SelectItem value="veterinary">Veterinary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Filter by Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* User Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Recipients ({selectedUsers.length} selected)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="rounded-lg text-xs"
                  >
                    {selectedUsers.length === filteredUsers.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-sm text-slate-500 font-light text-center py-2">No users match filters</p>
                  ) : (
                    filteredUsers.map(user => (
                      <div key={user.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id])
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                            }
                          }}
                        />
                        <label className="text-sm text-slate-700 font-light cursor-pointer flex-1">
                          {user.full_name || user.email} ({user.role})
                          {user.target_course && ` - ${user.target_course}`}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Template */}
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={bulkTemplate} onValueChange={(v) => applyTemplate(v, true)}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="feedback_request">Feedback Request</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Content */}
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  placeholder="Email subject (use tokens for personalization)"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Content *</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="rounded-lg text-xs"
                  >
                    {previewMode ? "Edit" : "Preview"}
                  </Button>
                </div>
                {previewMode ? (
                  <div className="border rounded-lg p-4 bg-slate-50 min-h-[200px]">
                    {selectedUsers.length > 0 && filteredUsers.find(u => selectedUsers.includes(u.id)) ? (
                      <div className="space-y-4">
                        {selectedUsers.slice(0, 3).map(userId => {
                          const user = allUsers.find(u => u.id === userId)
                          if (!user) return null
                          return (
                            <div key={userId} className="border-b pb-3 last:border-0">
                              <p className="text-xs text-slate-500 mb-2">Preview for {user.full_name || user.email}:</p>
                              <div className="text-sm text-slate-700">
                                <p className="font-medium mb-2">{replaceTokens(bulkSubject, user)}</p>
                                <p className="whitespace-pre-wrap">{replaceTokens(bulkContent, user)}</p>
                              </div>
                            </div>
                          )
                        })}
                        {selectedUsers.length > 3 && (
                          <p className="text-xs text-slate-500 italic">...and {selectedUsers.length - 3} more</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 font-light text-center py-8">Select recipients to preview</p>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={bulkContent}
                    onChange={(e) => setBulkContent(e.target.value)}
                    placeholder="Email content (use {name}, {email}, {course}, {entryYear} for personalization)"
                    rows={8}
                    className="rounded-lg"
                  />
                )}
                <p className="text-xs text-slate-500 font-light">
                  Available tokens: {"{name}"}, {"{email}"}, {"{course}"}, {"{entryYear}"}
                </p>
              </div>

              <Button
                onClick={handleSendBulk}
                disabled={isLoading || !bulkSubject || !bulkContent || selectedUsers.length === 0}
                className="w-full bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
              >
                <Send size={16} className="mr-2" />
                {isLoading ? "Sending..." : `Send to ${selectedUsers.length} recipient(s)`}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

