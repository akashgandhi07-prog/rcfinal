"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Plus, Trash2, Edit, UserPlus, Users, Network } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getAllStudents, createParentStudentLink, deleteParentStudentLink, getLinkedStudents, createMentorStudentLink, deleteMentorStudentLink, updateUser, getAllUserRelationships, getMentorsForStudent, getLinkedStudentsForMentor, getCurrentUser } from "@/lib/supabase/queries"
import { supabase } from "@/lib/supabase/client"
import type { ApprovalStatus, User, UserRole, TargetCourse, OnboardingStatus, FeeStatus } from "@/lib/supabase/types"
import { showNotification } from "@/components/ui/notification"
import { ActivityLogViewer } from "@/components/portal/activity-log-viewer"
import { AdminActivityDashboard } from "./admin-activity-dashboard"
import { AdminEmailSender } from "./admin-email-sender"
import { AdminChangesView } from "./admin-changes-view"
import { AdminResourceManager } from "./admin-resource-manager"
// Activity logging removed
import { logger } from "@/lib/utils/logger"

interface AdminViewProps {
  onImpersonate: (studentId: string) => void
}

interface UserRelationship {
  student: User
  parents: User[]
  mentors: User[]
}

export function AdminView({ onImpersonate }: AdminViewProps) {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [students, setStudents] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [relationships, setRelationships] = useState<UserRelationship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [selectedParent, setSelectedParent] = useState<string>("")
  const [selectedMentor, setSelectedMentor] = useState<string>("")
  const [linkedStudents, setLinkedStudents] = useState<User[]>([])
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showMentorLinkDialog, setShowMentorLinkDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<"users" | "relationships" | "activity-logs" | "activity-dashboard" | "email" | "changes" | "resources">("activity-dashboard")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  const [confirmMessage, setConfirmMessage] = useState("")

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setCurrentUser(user)
          // Verify user is actually an admin
          if (user.role !== "admin") {
            showNotification("You do not have permission to access this page.", "error")
            return
          }
          const email = user.email || ""
          // Primary admin with full access
          setIsSuperAdmin(email === "akashgandhi07@gmail.com")
        }
      } catch {
        setIsSuperAdmin(false)
      }
    }

    checkAdmin()
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [studentsData, usersData, relationshipsData] = await Promise.all([
        getAllStudents(),
        supabase.from("users").select("*").order("created_at", { ascending: false }),
        getAllUserRelationships(),
      ])
      
      setStudents(studentsData)
      if (usersData.data) {
        setAllUsers(usersData.data as User[])
      }
      setRelationships(relationshipsData)
    } catch (error) {
      logger.error("Error loading admin data", error)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyAdmin = (): boolean => {
    if (!currentUser || currentUser.role !== "admin") {
      showNotification("You do not have permission to perform this action.", "error")
      return false
    }
    return true
  }

  const handleLinkParent = async () => {
    if (!verifyAdmin()) return
    if (!selectedStudent || !selectedParent) return

    try {
      await createParentStudentLink(selectedParent, selectedStudent.id)
      await loadData()
      setShowLinkDialog(false)
      setSelectedStudent(null)
      setSelectedParent("")
      showNotification("Parent linked successfully!", "success")
    } catch (error) {
      logger.error("Error linking parent", error, { parentId: selectedParent, studentId: selectedStudent.id })
      showNotification("Failed to link parent. Please try again.", "error")
    }
  }

  const handleUnlinkParent = async (parentId: string, studentId: string) => {
    if (!verifyAdmin()) return
    
    setConfirmMessage("Are you sure you want to unlink this parent?")
    setConfirmAction(async () => {
      try {
        await deleteParentStudentLink(parentId, studentId)
        await loadData()
        showNotification("Parent unlinked successfully!", "success")
        setShowConfirmDialog(false)
      } catch (error) {
        logger.error("Error unlinking parent", error, { parentId, studentId })
        showNotification("Failed to unlink parent. Please try again.", "error")
        setShowConfirmDialog(false)
      }
    })
    setShowConfirmDialog(true)
  }

  const handleLinkMentor = async () => {
    if (!verifyAdmin()) return
    if (!selectedStudent || !selectedMentor) return

    try {
      await createMentorStudentLink(selectedMentor, selectedStudent.id)
      await loadData()
      setShowMentorLinkDialog(false)
      setSelectedStudent(null)
      setSelectedMentor("")
      showNotification("Mentor linked successfully!", "success")
    } catch (error) {
      logger.error("Error linking mentor", error, { mentorId: selectedMentor, studentId: selectedStudent.id })
      showNotification("Failed to link mentor. Please try again.", "error")
    }
  }

  const handleEditUser = async (updates: Partial<User>) => {
    if (!verifyAdmin()) return
    if (!editingUser) return

    try {
      // Track changes for logging
      const changes: Record<string, { old: unknown; new: unknown }> = {}
      Object.keys(updates).forEach((key) => {
        const typedKey = key as keyof User
        if (editingUser[typedKey] !== updates[typedKey as keyof typeof updates]) {
          changes[key] = {
            old: editingUser[typedKey],
            new: updates[typedKey as keyof typeof updates],
          }
        }
      })

      await updateUser(editingUser.id, updates)
      await loadData()
      setShowEditDialog(false)
      setEditingUser(null)
      showNotification("User updated successfully!", "success")
    } catch (error) {
      logger.error("Error updating user", error, { userId: editingUser.id })
      showNotification("Failed to update user. Please try again.", "error")
    }
  }

  const handleQuickUpdate = async (userId: string, updates: Partial<User>) => {
    if (!verifyAdmin()) return
    
    try {
      const user = allUsers.find(u => u.id === userId)
      await updateUser(userId, updates)
      await loadData()
      showNotification("User updated successfully!", "success")
    } catch (error) {
      logger.error("Error quick-updating user", error, { userId })
      showNotification("Failed to update user. Please try again.", "error")
    }
  }

  const [showCreateDemoDialog, setShowCreateDemoDialog] = useState(false)
  const [creatingDemo, setCreatingDemo] = useState(false)

  const parents = Array.isArray(allUsers) ? allUsers.filter(u => u && u.role === "parent") : []
  const mentors = Array.isArray(allUsers) ? allUsers.filter(u => u && u.role === "mentor") : []
  const studentsOnly = Array.isArray(allUsers) ? allUsers.filter(u => u && u.role === "student") : []
  const admins = Array.isArray(allUsers) ? allUsers.filter(u => u && u.role === "admin") : []
  const pendingApprovals = Array.isArray(allUsers) ? allUsers.filter((u) => u && (u.approval_status as ApprovalStatus | undefined) === "pending") : []

  const handleCreateDemoAccount = async (role: UserRole, email: string, name: string, targetCourse?: TargetCourse | null) => {
    setCreatingDemo(true)
    try {
      // Note: Creating auth users requires service role key
      // For now, we'll create the user profile and provide instructions
      // The user will need to create the auth account manually or use SQL
      
      // Generate a UUID for the user
      const userId = crypto.randomUUID()
      
      // Create user profile directly
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email,
        role,
        full_name: name,
        target_course: targetCourse || null,
        approval_status: "approved",
        onboarding_status: "complete",
        entry_year: targetCourse ? new Date().getFullYear() + 1 : null,
        country: "United Kingdom",
        fee_status: "home",
      })

      if (insertError) {
        // If user already exists, update it
        if (insertError.code === "23505") { // Unique violation
          const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single()
          
          if (existing) {
            await updateUser(existing.id, {
              role,
              full_name: name,
              target_course: targetCourse || null,
              approval_status: "approved",
              onboarding_status: "complete",
              entry_year: targetCourse ? new Date().getFullYear() + 1 : null,
              country: "United Kingdom",
              fee_status: "home",
            })
            showNotification(
              `Demo account profile updated: ${email}. You need to create the auth user manually in Supabase Dashboard.`,
              "info",
              10000
            )
            await loadData()
            return
          }
        }
        throw insertError
      }

      showNotification(
        `Demo account profile created: ${email}. Create the auth user manually in Supabase Dashboard or use the SQL script.`,
        "success",
        10000
      )
      await loadData()
    } catch (error) {
      logger.error("Error creating demo account", error, { email, role })
      showNotification(
        `Failed to create demo account: ${error instanceof Error ? error.message : "Unknown error"}. You can create demo accounts using the SQL script.`,
        "error",
        8000
      )
    } finally {
      setCreatingDemo(false)
      setShowCreateDemoDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-light text-slate-900 mb-1">Admin Dashboard</h2>
          <p className="text-sm text-slate-500 font-light">Approve accounts, edit roles, and manage parent/mentor links directly.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-light"
          >
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateDemoDialog(true)}
            className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
          >
            <Plus size={16} className="mr-2" />
            Create Demo Account
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200 rounded-lg">
        <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-light">Pending approvals</p>
            <p className="text-2xl font-light text-slate-900">{pendingApprovals.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-light">Students</p>
            <p className="text-2xl font-light text-slate-900">{studentsOnly.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-light">Mentors</p>
            <p className="text-2xl font-light text-slate-900">{mentors.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-light">Parents/Guardians</p>
            <p className="text-2xl font-light text-slate-900">{parents.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-light">Admins</p>
            <p className="text-2xl font-light text-slate-900">{admins.length}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="bg-slate-100 rounded-lg p-1 grid grid-cols-7 gap-1">
          <TabsTrigger value="activity-dashboard" className="rounded-md text-xs">
            Activity Dashboard
          </TabsTrigger>
          <TabsTrigger value="changes" className="rounded-md text-xs">
            Changes
          </TabsTrigger>
          <TabsTrigger value="email" className="rounded-md text-xs">
            Email
          </TabsTrigger>
          <TabsTrigger value="relationships" className="rounded-md text-xs">
            <Network size={14} className="mr-1" />
            Relationships
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-md text-xs">
            <Users size={14} className="mr-1" />
            Users
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-md text-xs">
            Resources
          </TabsTrigger>
          <TabsTrigger value="activity-logs" className="rounded-md text-xs">
            <Eye size={14} className="mr-1" />
            Logs
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="super" className="rounded-md text-xs col-span-6">
              <Eye size={14} className="mr-1" />
              Super Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="relationships" className="space-y-6 mt-6">
          {/* Comprehensive Relationship View */}
          <Card className="bg-white border-slate-200 rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-light text-slate-900">Student-Parent-Mentor Relationships</CardTitle>
              <p className="text-sm text-slate-500 font-light mt-1">Complete overview of all linked relationships</p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-slate-500 font-light">Loading relationships...</p>
              ) : relationships.length === 0 ? (
                <p className="text-sm text-slate-500 font-light">No relationships found.</p>
              ) : (
                <div className="space-y-6">
                  {relationships.map((rel) => (
                    <div key={rel.student.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-medium text-slate-900">
                              <a 
                                href={`mailto:${rel.student.email}`}
                                className="hover:text-[#D4AF37] hover:underline transition-colors"
                                title={`Email ${rel.student.full_name || rel.student.email}`}
                              >
                                {rel.student.full_name || rel.student.email}
                              </a>
                            </h3>
                            <span className="px-2 py-1 rounded-lg text-xs bg-green-100 text-green-700 capitalize">
                              {rel.student.role}
                            </span>
                            {rel.student.target_course && (
                              <span className="px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-700 capitalize">
                                {rel.student.target_course} {rel.student.entry_year || ''} Entry
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 font-light">
                            <a 
                              href={`mailto:${rel.student.email}`}
                              className="hover:text-[#D4AF37] hover:underline transition-colors"
                              title={`Email ${rel.student.email}`}
                            >
                              {rel.student.email}
                            </a>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onImpersonate(rel.student.id)}
                          className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Parents Section */}
                        <div className="border-l-2 border-orange-300 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-orange-600" />
                            <h4 className="text-sm font-medium text-slate-900">
                              Parents ({rel.parents.length})
                            </h4>
                          </div>
                          {rel.parents.length === 0 ? (
                            <p className="text-xs text-slate-500 font-light">No parents linked</p>
                          ) : (
                            <div className="space-y-2">
                              {rel.parents.map((parent) => (
                                <div key={parent.id} className="flex items-center justify-between bg-orange-50/50 rounded-md p-2">
                                  <div>
                                    <p className="text-sm text-slate-900 font-light">
                                      <a 
                                        href={`mailto:${parent.email}`}
                                        className="hover:text-[#D4AF37] hover:underline transition-colors"
                                      >
                                        {parent.full_name || parent.email}
                                      </a>
                                    </p>
                                    <p className="text-xs text-slate-500 font-light">
                                      <a 
                                        href={`mailto:${parent.email}`}
                                        className="hover:text-[#D4AF37] hover:underline transition-colors"
                                      >
                                        {parent.email}
                                      </a>
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (!verifyAdmin()) return
                                      setConfirmMessage(`Unlink ${parent.full_name || parent.email} from ${rel.student.full_name || rel.student.email}?`)
                                      setConfirmAction(async () => {
                                        try {
                                          await deleteParentStudentLink(parent.id, rel.student.id)
                                          await loadData()
                                          showNotification("Parent unlinked successfully!", "success")
                                          setShowConfirmDialog(false)
                                        } catch (error) {
                                          console.error("Error unlinking parent:", error)
                                          showNotification("Failed to unlink parent. Please try again.", "error")
                                          setShowConfirmDialog(false)
                                        }
                                      })
                                      setShowConfirmDialog(true)
                                    }}
                                    className="border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs h-7"
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(rel.student)
                              setShowLinkDialog(true)
                            }}
                            className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-50 rounded-lg text-xs h-7"
                          >
                            <Plus size={12} className="mr-1" />
                            Link Parent
                          </Button>
                        </div>

                        {/* Mentors Section */}
                        <div className="border-l-2 border-blue-300 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Network size={16} className="text-blue-600" />
                            <h4 className="text-sm font-medium text-slate-900">
                              Mentors ({rel.mentors.length})
                            </h4>
                          </div>
                          {rel.mentors.length === 0 ? (
                            <p className="text-xs text-slate-500 font-light">No mentors linked</p>
                          ) : (
                            <div className="space-y-2">
                              {rel.mentors.map((mentor) => (
                                <div key={mentor.id} className="flex items-center justify-between bg-blue-50/50 rounded-md p-2">
                                  <div>
                                    <p className="text-sm text-slate-900 font-light">
                                      <a 
                                        href={`mailto:${mentor.email}`}
                                        className="hover:text-[#D4AF37] hover:underline transition-colors"
                                      >
                                        {mentor.full_name || mentor.email}
                                      </a>
                                    </p>
                                    <p className="text-xs text-slate-500 font-light">
                                      <a 
                                        href={`mailto:${mentor.email}`}
                                        className="hover:text-[#D4AF37] hover:underline transition-colors"
                                      >
                                        {mentor.email}
                                      </a>
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (!verifyAdmin()) return
                                      setConfirmMessage(`Unlink ${mentor.full_name || mentor.email} from ${rel.student.full_name || rel.student.email}?`)
                                      setConfirmAction(async () => {
                                        try {
                                          await deleteMentorStudentLink(mentor.id, rel.student.id)
                                          await loadData()
                                          showNotification("Mentor unlinked successfully!", "success")
                                          setShowConfirmDialog(false)
                                        } catch (error) {
                                          logger.error("Error unlinking mentor", error, { mentorId: mentor.id, studentId: rel.student.id })
                                          showNotification("Failed to unlink mentor. Please try again.", "error")
                                          setShowConfirmDialog(false)
                                        }
                                      })
                                      setShowConfirmDialog(true)
                                    }}
                                    className="border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs h-7"
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(rel.student)
                              setShowMentorLinkDialog(true)
                            }}
                            className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg text-xs h-7"
                          >
                            <Plus size={12} className="mr-1" />
                            Link Mentor
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">

          {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="bg-white border-slate-200 rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-light text-slate-900">Accounts Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Name</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Email</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Role</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((user) => (
                  <TableRow key={user.id} className="border-slate-200 hover:bg-slate-50/50">
                    <TableCell className="text-sm text-slate-900 font-light">{user.full_name || "—"}</TableCell>
                    <TableCell className="text-sm text-slate-700 font-light">{user.email}</TableCell>
                    <TableCell className="text-sm text-slate-700 font-light capitalize">{user.role}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-lg font-light"
                          onClick={async () => {
                            await handleEditUser.call(null, { ...user, approval_status: "approved" as ApprovalStatus })
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50 rounded-lg font-light"
                          onClick={async () => {
                            await handleEditUser.call(null, { ...user, approval_status: "rejected" as ApprovalStatus })
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

          {/* All Users Table */}
      <Card className="bg-white border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500 font-light">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Name</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Email</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Role</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Course</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Status</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id} className="border-slate-200 hover:bg-slate-50/50">
                    <TableCell className="text-sm text-slate-900 font-light">
                      <a 
                        href={`mailto:${user.email}`}
                        className="hover:text-[#D4AF37] hover:underline transition-colors"
                        title={`Email ${user.full_name || user.email}`}
                      >
                        {user.full_name || "—"}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 font-light">
                      <a 
                        href={`mailto:${user.email}`}
                        className="hover:text-[#D4AF37] hover:underline transition-colors"
                        title={`Email ${user.email}`}
                      >
                        {user.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 font-light">
                      <span className={`px-2 py-1 rounded-lg text-xs capitalize ${
                        user.role === "admin" ? "bg-purple-100 text-purple-700" :
                        user.role === "mentor" ? "bg-blue-100 text-blue-700" :
                        user.role === "parent" ? "bg-orange-100 text-orange-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 font-light capitalize">{user.target_course || "—"}</TableCell>
                    <TableCell className="text-sm text-slate-600 font-light">
                      <span className={`px-2 py-1 rounded-lg text-xs ${
                        user.onboarding_status === "complete" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {user.onboarding_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingUser(user)
                            setShowEditDialog(true)
                          }}
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-light"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit Role
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

          {/* Students Table */}
      <Card className="bg-white border-slate-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900">All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500 font-light">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Name</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Email</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Course</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Status</TableHead>
                  <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="border-slate-200 hover:bg-slate-50/50">
                    <TableCell className="text-sm text-slate-900 font-light">{student.full_name || "—"}</TableCell>
                    <TableCell className="text-sm text-slate-700 font-light">{student.email}</TableCell>
                    <TableCell className="text-sm text-slate-700 font-light capitalize">{student.target_course || "—"}</TableCell>
                    <TableCell className="text-sm text-slate-600 font-light">
                      <span className={`px-2 py-1 rounded-lg text-xs ${
                        student.onboarding_status === "complete" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {student.onboarding_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student)
                            setShowLinkDialog(true)
                          }}
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-light"
                        >
                          <UserPlus size={14} className="mr-1" />
                          Link Parent
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student)
                            setShowMentorLinkDialog(true)
                          }}
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg font-light"
                        >
                          <UserPlus size={14} className="mr-1" />
                          Link Mentor
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingUser(student)
                            setShowEditDialog(true)
                          }}
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-light"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onImpersonate(student.id)}
                          className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

        </TabsContent>

        <TabsContent value="activity-dashboard" className="space-y-6 mt-6">
          <AdminActivityDashboard 
            onUserClick={(userId) => {
              const user = allUsers.find(u => u.id === userId)
              if (user) {
                setEditingUser(user)
                setShowEditDialog(true)
              }
            }}
          />
        </TabsContent>

        <TabsContent value="changes" className="space-y-6 mt-6">
          <AdminChangesView
            onUserClick={(userId) => {
              const user = allUsers.find(u => u.id === userId)
              if (user) {
                setEditingUser(user)
                setShowEditDialog(true)
              }
            }}
          />
        </TabsContent>

        <TabsContent value="email" className="space-y-6 mt-6">
          <AdminEmailSender onEmailSent={loadData} />
        </TabsContent>

        <TabsContent value="resources" className="space-y-6 mt-6">
          <AdminResourceManager />
        </TabsContent>

        <TabsContent value="activity-logs" className="space-y-6 mt-6">
          <ActivityLogViewer />
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="super" className="space-y-6 mt-6">
            <Card className="bg-white border-slate-200 rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg font-light text-slate-900">Super Admin: All Users</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-slate-500 font-light">Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Name</TableHead>
                        <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Email</TableHead>
                        <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Role</TableHead>
                        <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Status</TableHead>
                        <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((user) => (
                        <TableRow key={user.id} className="border-slate-200">
                          <TableCell className="text-sm text-slate-900 font-light">{user.full_name || "—"}</TableCell>
                          <TableCell className="text-sm text-slate-700 font-light">{user.email}</TableCell>
                          <TableCell className="text-sm text-slate-700 font-light">
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.role}
                                onValueChange={(value) => {
                                  setConfirmMessage(`Change ${user.full_name || user.email} role from ${user.role} to ${value}?`)
                                  setConfirmAction(async () => {
                                    await handleQuickUpdate(user.id, { role: value as UserRole })
                                    setShowConfirmDialog(false)
                                  })
                                  setShowConfirmDialog(true)
                                }}
                              >
                                <SelectTrigger className="rounded-lg h-9 text-xs min-w-[100px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="parent">Parent</SelectItem>
                                  <SelectItem value="mentor">Mentor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <a
                                href={`mailto:${user.email}`}
                                className="text-xs text-slate-500 hover:text-slate-700 underline"
                                title="Send email"
                              >
                                📧
                              </a>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-700 font-light">
                            <Select
                              value={(user.approval_status as ApprovalStatus) || "approved"}
                              onValueChange={(value) => handleQuickUpdate(user.id, { approval_status: value as ApprovalStatus })}
                            >
                              <SelectTrigger className="rounded-lg h-9 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-lg">
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm text-slate-700 font-light">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onImpersonate(user.id)}
                                className="rounded-lg text-xs"
                              >
                                Impersonate
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Link Parent Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="bg-white border-slate-200 rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="font-light text-slate-900">Link Parent to Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm text-slate-700 font-light mb-2 block">Student</Label>
              <Input value={selectedStudent?.full_name || selectedStudent?.email || ""} disabled className="rounded-lg" />
            </div>
            <div>
              <Label className="text-sm text-slate-700 font-light mb-2 block">Select Parent</Label>
              <Select value={selectedParent} onValueChange={setSelectedParent}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select a parent" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.full_name || parent.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLinkParent}
                disabled={!selectedParent}
                className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg"
              >
                Link Parent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Mentor Dialog */}
      <Dialog open={showMentorLinkDialog} onOpenChange={setShowMentorLinkDialog}>
        <DialogContent className="bg-white border-slate-200 rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="font-light text-slate-900">Link Mentor to Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm text-slate-700 font-light mb-2 block">Student</Label>
              <Input value={selectedStudent?.full_name || selectedStudent?.email || ""} disabled className="rounded-lg" />
            </div>
            <div>
              <Label className="text-sm text-slate-700 font-light mb-2 block">Select Mentor</Label>
              <Select value={selectedMentor} onValueChange={setSelectedMentor}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select a mentor" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {mentors.map((mentor) => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.full_name || mentor.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowMentorLinkDialog(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLinkMentor}
                disabled={!selectedMentor}
                className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg"
              >
                Link Mentor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Demo Account Dialog */}
      <Dialog open={showCreateDemoDialog} onOpenChange={setShowCreateDemoDialog}>
        <DialogContent className="bg-white border-slate-200 rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="font-light text-slate-900">Create Demo Account</DialogTitle>
          </DialogHeader>
          <CreateDemoAccountForm
            onCreate={handleCreateDemoAccount}
            onCancel={() => setShowCreateDemoDialog(false)}
            isLoading={creatingDemo}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white border-slate-200 rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="font-light text-slate-900">Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <EditUserForm
              user={editingUser}
              onSave={handleEditUser}
              onCancel={() => {
                setShowEditDialog(false)
                setEditingUser(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-light">Confirm Action</DialogTitle>
            <DialogDescription className="text-slate-600 font-light">
              {confirmMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false)
                setConfirmAction(null)
                setConfirmMessage("")
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-light"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmAction) {
                  confirmAction()
                }
              }}
              className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreateDemoAccountForm({ 
  onCreate, 
  onCancel, 
  isLoading 
}: { 
  onCreate: (role: UserRole, email: string, name: string, targetCourse?: TargetCourse | null) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [role, setRole] = useState<UserRole>("student")
  const [name, setName] = useState("")
  const [targetCourse, setTargetCourse] = useState<TargetCourse | "">("")

  const handleCreate = () => {
    if (!name.trim()) {
      showNotification("Please enter a name", "warning")
      return
    }

    const email = `${role}.${name.toLowerCase().replace(/\s+/g, ".")}@regents-demo.com`
    onCreate(role, email, name, targetCourse || null)
  }

  return (
    <div className="space-y-4 py-4">
      <div>
        <Label className="text-sm text-slate-700 font-light mb-2 block">Role *</Label>
        <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
          <SelectTrigger className="rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="parent">Parent</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm text-slate-700 font-light mb-2 block">Full Name *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Demo Student"
          className="rounded-lg"
        />
        <p className="text-xs text-slate-500 mt-1 font-light">
          Email will be auto-generated: {role}.{name.toLowerCase().replace(/\s+/g, ".") || "name"}@regents-demo.com
        </p>
      </div>
      {role === "student" && (
        <div>
          <Label className="text-sm text-slate-700 font-light mb-2 block">Target Course</Label>
          <Select value={targetCourse} onValueChange={(value) => setTargetCourse(value as TargetCourse | "")}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="">None</SelectItem>
              <SelectItem value="medicine">Medicine</SelectItem>
              <SelectItem value="dentistry">Dentistry</SelectItem>
              <SelectItem value="veterinary">Veterinary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600 font-light">
          <strong>Default Password:</strong> Demo123!
        </p>
        <p className="text-xs text-slate-500 mt-1 font-light">
          Users can change this after logging in.
        </p>
      </div>
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onCancel} className="rounded-lg" disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreate} 
          className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg"
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? "Creating..." : "Create Account"}
        </Button>
      </div>
    </div>
  )
}

function EditUserForm({ user, onSave, onCancel }: { user: User; onSave: (updates: Partial<User>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    role: user.role,
    full_name: user.full_name || "",
    email: user.email,
    target_course: user.target_course || "",
    entry_year: user.entry_year?.toString() || "",
    country: user.country || "",
    fee_status: user.fee_status || "",
    onboarding_status: user.onboarding_status,
    approval_status: user.approval_status,
    date_of_birth: user.date_of_birth || "",
    home_address: user.home_address || "",
    contact_number: user.contact_number || "",
    parent_name: user.parent_name || "",
    parent_phone: user.parent_phone || "",
    parent_email: user.parent_email || "",
    parent2_name: user.parent2_name || "",
    parent2_phone: user.parent2_phone || "",
    parent2_email: user.parent2_email || "",
    school_name: user.school_name || "",
    gcse_summary: user.gcse_summary || "",
    a_level_predictions: user.a_level_predictions || "",
    consultant_assigned: user.consultant_assigned || "",
    contract_status: user.contract_status || "",
    client_id: user.client_id || "",
  })

  const handleSave = () => {
    onSave({
      role: formData.role as UserRole,
      full_name: formData.full_name || null,
      target_course: formData.target_course ? (formData.target_course as TargetCourse) : null,
      entry_year: formData.entry_year ? parseInt(formData.entry_year) : null,
      country: formData.country || null,
      fee_status: formData.fee_status ? (formData.fee_status as FeeStatus) : null,
      onboarding_status: formData.onboarding_status,
      approval_status: formData.approval_status,
      date_of_birth: formData.date_of_birth || null,
      home_address: formData.home_address || null,
      contact_number: formData.contact_number || null,
      parent_name: formData.parent_name || null,
      parent_phone: formData.parent_phone || null,
      parent_email: formData.parent_email || null,
      parent2_name: formData.parent2_name || null,
      parent2_phone: formData.parent2_phone || null,
      parent2_email: formData.parent2_email || null,
      school_name: formData.school_name || null,
      gcse_summary: formData.gcse_summary || null,
      a_level_predictions: formData.a_level_predictions || null,
      consultant_assigned: formData.consultant_assigned || null,
      contract_status: formData.contract_status || null,
      client_id: formData.client_id || null,
    })
  }

  return (
    <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Basic Information</h3>
          
          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Email</Label>
            <Input value={formData.email} disabled className="bg-slate-100" />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as UserRole})}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="rounded-lg"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Date of Birth</Label>
            <Input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              className="rounded-lg"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Contact Number</Label>
            <Input
              value={formData.contact_number}
              onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
              className="rounded-lg"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Home Address</Label>
            <Textarea
              value={formData.home_address}
              onChange={(e) => setFormData({...formData, home_address: e.target.value})}
              className="rounded-lg min-h-20"
            />
          </div>
        </div>

        {/* Academic & Course Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Academic & Course</h3>
          
          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Target Course</Label>
            <Select value={formData.target_course} onValueChange={(value) => setFormData({...formData, target_course: value})}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="">None</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="dentistry">Dentistry</SelectItem>
                <SelectItem value="veterinary">Veterinary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Entry Year</Label>
            <Input
              type="number"
              value={formData.entry_year}
              onChange={(e) => setFormData({...formData, entry_year: e.target.value})}
              className="rounded-lg"
              placeholder="2025"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Country</Label>
            <Input
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="rounded-lg"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Fee Status</Label>
            <Select value={formData.fee_status} onValueChange={(value) => setFormData({...formData, fee_status: value})}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="">None</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="international">International</SelectItem>
                <SelectItem value="unsure">Unsure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">School Name</Label>
            <Input
              value={formData.school_name}
              onChange={(e) => setFormData({...formData, school_name: e.target.value})}
              className="rounded-lg"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">GCSE Summary</Label>
            <Textarea
              value={formData.gcse_summary}
              onChange={(e) => setFormData({...formData, gcse_summary: e.target.value})}
              className="rounded-lg min-h-20"
              placeholder="Enter GCSE results..."
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">A-Level Predictions</Label>
            <Textarea
              value={formData.a_level_predictions}
              onChange={(e) => setFormData({...formData, a_level_predictions: e.target.value})}
              className="rounded-lg min-h-20"
              placeholder="Enter A-Level predictions..."
            />
          </div>
        </div>
      </div>

      {/* Parent Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Parent 1 Information</h3>
          
          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Parent Name</Label>
            <Input
              value={formData.parent_name}
              onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
              className="rounded-lg"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Parent Phone</Label>
            <Input
              value={formData.parent_phone}
              onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
              className="rounded-lg"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Parent Email</Label>
            <Input
              type="email"
              value={formData.parent_email}
              onChange={(e) => setFormData({...formData, parent_email: e.target.value})}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Parent 2 Information</h3>
          
          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Parent 2 Name</Label>
            <Input
              value={formData.parent2_name}
              onChange={(e) => setFormData({...formData, parent2_name: e.target.value})}
              className="rounded-lg"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Parent 2 Phone</Label>
            <Input
              value={formData.parent2_phone}
              onChange={(e) => setFormData({...formData, parent2_phone: e.target.value})}
              className="rounded-lg"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Parent 2 Email</Label>
            <Input
              type="email"
              value={formData.parent2_email}
              onChange={(e) => setFormData({...formData, parent2_email: e.target.value})}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Admin & Status Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Status & Approval</h3>
          
          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Approval Status</Label>
            <Select
              value={formData.approval_status}
              onValueChange={(value) => setFormData({...formData, approval_status: value as ApprovalStatus})}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Onboarding Status</Label>
            <Select
              value={formData.onboarding_status}
              onValueChange={(value) => setFormData({...formData, onboarding_status: value as OnboardingStatus})}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Consultant & Contract</h3>
          
          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Consultant Assigned</Label>
            <Input
              value={formData.consultant_assigned}
              onChange={(e) => setFormData({...formData, consultant_assigned: e.target.value})}
              className="rounded-lg"
              placeholder="Consultant name"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Contract Status</Label>
            <Input
              value={formData.contract_status}
              onChange={(e) => setFormData({...formData, contract_status: e.target.value})}
              className="rounded-lg"
              placeholder="Active, Inactive, etc."
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-light mb-2 block">Client ID</Label>
            <Input
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              className="rounded-lg"
              placeholder="Client identifier"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onCancel} className="rounded-lg">
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg">
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
