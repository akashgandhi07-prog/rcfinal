"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Plus, Trash2, Edit, UserPlus } from "lucide-react"
import { getAllStudents, createParentStudentLink, deleteParentStudentLink, getLinkedStudents, updateUser } from "@/lib/supabase/queries"
import { supabase } from "@/lib/supabase/client"
import type { ApprovalStatus, User, UserRole, TargetCourse } from "@/lib/supabase/types"

interface AdminViewProps {
  onImpersonate: (studentId: string) => void
}

export function AdminView({ onImpersonate }: AdminViewProps) {
  const [students, setStudents] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [selectedParent, setSelectedParent] = useState<string>("")
  const [linkedStudents, setLinkedStudents] = useState<User[]>([])
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [studentsData, usersData] = await Promise.all([
        getAllStudents(),
        supabase.from("users").select("*").order("created_at", { ascending: false }),
      ])
      
      setStudents(studentsData)
      if (usersData.data) {
        setAllUsers(usersData.data as User[])
      }
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

  const parents = allUsers.filter(u => u.role === "parent")
  const pendingApprovals = allUsers.filter((u) => (u.approval_status as ApprovalStatus | undefined) === "pending")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-slate-900 mb-2">Consultant Access - User Management</h2>
        <p className="text-sm text-slate-500 font-light">View and manage all users, link parents to students, and edit user data</p>
      </div>

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
