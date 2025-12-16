"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Plus, Trash2, Edit, UserPlus, Users, Network } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getAllStudents, createParentStudentLink, deleteParentStudentLink, getLinkedStudents, createMentorStudentLink, deleteMentorStudentLink, updateUser, getAllUserRelationships, getMentorsForStudent, getLinkedStudentsForMentor } from "@/lib/supabase/queries"
import { supabase } from "@/lib/supabase/client"
import type { ApprovalStatus, User, UserRole, TargetCourse } from "@/lib/supabase/types"

interface AdminViewProps {
  onImpersonate: (studentId: string) => void
}

interface UserRelationship {
  student: User
  parents: User[]
  mentors: User[]
}

export function AdminView({ onImpersonate }: AdminViewProps) {
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
  const [activeTab, setActiveTab] = useState<"users" | "relationships">("relationships")

  useEffect(() => {
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
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkParent = async () => {
    if (!selectedStudent || !selectedParent) return

    try {
      await createParentStudentLink(selectedParent, selectedStudent.id)
      await loadData()
      setShowLinkDialog(false)
      setSelectedStudent(null)
      setSelectedParent("")
      alert("Parent linked successfully!")
    } catch (error) {
      console.error("Error linking parent:", error)
      alert("Failed to link parent. Please try again.")
    }
  }

  const handleUnlinkParent = async (parentId: string, studentId: string) => {
    if (!confirm("Are you sure you want to unlink this parent?")) return

    try {
      await deleteParentStudentLink(parentId, studentId)
      await loadData()
      alert("Parent unlinked successfully!")
    } catch (error) {
      console.error("Error unlinking parent:", error)
      alert("Failed to unlink parent. Please try again.")
    }
  }

  const handleLinkMentor = async () => {
    if (!selectedStudent || !selectedMentor) return

    try {
      await createMentorStudentLink(selectedMentor, selectedStudent.id)
      await loadData()
      setShowMentorLinkDialog(false)
      setSelectedStudent(null)
      setSelectedMentor("")
      alert("Mentor linked successfully!")
    } catch (error) {
      console.error("Error linking mentor:", error)
      alert("Failed to link mentor. Please try again.")
    }
  }

  const handleEditUser = async (updates: Partial<User>) => {
    if (!editingUser) return

    try {
      await updateUser(editingUser.id, updates)
      await loadData()
      setShowEditDialog(false)
      setEditingUser(null)
      alert("User updated successfully!")
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Failed to update user. Please try again.")
    }
  }

  const [showCreateDemoDialog, setShowCreateDemoDialog] = useState(false)
  const [creatingDemo, setCreatingDemo] = useState(false)

  const parents = allUsers.filter(u => u.role === "parent")
  const mentors = allUsers.filter(u => u.role === "mentor")
  const pendingApprovals = allUsers.filter((u) => (u.approval_status as ApprovalStatus | undefined) === "pending")

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
            alert(`Demo account profile updated: ${email}\n\nIMPORTANT: You need to create the auth user manually:\n1. Go to Supabase Dashboard > Authentication > Users\n2. Click "Add User"\n3. Email: ${email}\n4. Password: Demo123!\n5. Auto Confirm: ON`)
            await loadData()
            return
          }
        }
        throw insertError
      }

      alert(`Demo account profile created: ${email}\n\nIMPORTANT: You need to create the auth user manually:\n1. Go to Supabase Dashboard > Authentication > Users\n2. Click "Add User"\n3. Email: ${email}\n4. Password: Demo123!\n5. Auto Confirm: ON\n\nOr use the SQL script in supabase/create-demo-accounts.sql`)
      await loadData()
    } catch (error) {
      console.error("Error creating demo account:", error)
      alert(`Failed to create demo account: ${error instanceof Error ? error.message : "Unknown error"}\n\nYou can create demo accounts using the SQL script in supabase/create-demo-accounts.sql`)
    } finally {
      setCreatingDemo(false)
      setShowCreateDemoDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-slate-900 mb-2">Consultant Access - User Management</h2>
          <p className="text-sm text-slate-500 font-light">View and manage all users, link parents to students, and edit user data</p>
        </div>
        <Button
          onClick={() => setShowCreateDemoDialog(true)}
          className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
        >
          <Plus size={16} className="mr-2" />
          Create Demo Account
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "users" | "relationships")} className="w-full">
        <TabsList className="bg-slate-100 rounded-lg p-1">
          <TabsTrigger value="relationships" className="rounded-md">
            <Network size={16} className="mr-2" />
            All Relationships
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-md">
            <Users size={16} className="mr-2" />
            All Users
          </TabsTrigger>
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
                            <h3 className="text-base font-medium text-slate-900">{rel.student.full_name || rel.student.email}</h3>
                            <span className="px-2 py-1 rounded-lg text-xs bg-green-100 text-green-700 capitalize">
                              {rel.student.role}
                            </span>
                            {rel.student.target_course && (
                              <span className="px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-700 capitalize">
                                {rel.student.target_course} {rel.student.entry_year || ''} Entry
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 font-light">{rel.student.email}</p>
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
                                    <p className="text-sm text-slate-900 font-light">{parent.full_name || parent.email}</p>
                                    <p className="text-xs text-slate-500 font-light">{parent.email}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      if (confirm(`Unlink ${parent.full_name || parent.email} from ${rel.student.full_name || rel.student.email}?`)) {
                                        await deleteParentStudentLink(parent.id, rel.student.id)
                                        await loadData()
                                      }
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
                                    <p className="text-sm text-slate-900 font-light">{mentor.full_name || mentor.email}</p>
                                    <p className="text-xs text-slate-500 font-light">{mentor.email}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      if (confirm(`Unlink ${mentor.full_name || mentor.email} from ${rel.student.full_name || rel.student.email}?`)) {
                                        await deleteMentorStudentLink(mentor.id, rel.student.id)
                                        await loadData()
                                      }
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
                    <TableCell className="text-sm text-slate-900 font-light">{user.full_name || "—"}</TableCell>
                    <TableCell className="text-sm text-slate-700 font-light">{user.email}</TableCell>
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
      alert("Please enter a name")
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
  const [role, setRole] = useState(user.role)
  const [targetCourse, setTargetCourse] = useState(user.target_course || "")
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | "">(user.approval_status || "approved")

  const handleSave = () => {
    onSave({
      role: role as UserRole,
      target_course: targetCourse ? (targetCourse as TargetCourse) : null,
      approval_status: (approvalStatus || "approved") as ApprovalStatus,
    })
  }

  return (
    <div className="space-y-4 py-4">
      <div>
        <Label className="text-sm text-slate-700 font-light mb-2 block">Role</Label>
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
        <Label className="text-sm text-slate-700 font-light mb-2 block">Target Course</Label>
        <Select value={targetCourse} onValueChange={setTargetCourse}>
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
        <Label className="text-sm text-slate-700 font-light mb-2 block">Approval Status</Label>
        <Select
          value={approvalStatus}
          onValueChange={(value) => setApprovalStatus(value as ApprovalStatus)}
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
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onCancel} className="rounded-lg">
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
