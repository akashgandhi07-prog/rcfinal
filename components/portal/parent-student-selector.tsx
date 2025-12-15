"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getLinkedStudents } from "@/lib/supabase/queries"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@/lib/supabase/types"
import { User as UserIcon } from "lucide-react"

interface ParentStudentSelectorProps {
  currentUserId: string
  onStudentSelect: (student: User | null) => void
}

export function ParentStudentSelector({ currentUserId, onStudentSelect }: ParentStudentSelectorProps) {
  const [linkedStudents, setLinkedStudents] = useState<User[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLinkedStudents()
  }, [currentUserId])

  const loadLinkedStudents = async () => {
    setIsLoading(true)
    try {
      const students = await getLinkedStudents(currentUserId)
      setLinkedStudents(students)
      
      // Auto-select first student if available
      if (students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id)
        onStudentSelect(students[0])
      } else if (students.length === 0) {
        onStudentSelect(null)
      }
    } catch (error) {
      console.error("Error loading linked students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId)
    const student = linkedStudents.find(s => s.id === studentId) || null
    onStudentSelect(student)
  }

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200 rounded-lg">
        <CardContent className="p-4">
          <p className="text-sm text-slate-500 font-light">Loading students...</p>
        </CardContent>
      </Card>
    )
  }

  if (linkedStudents.length === 0) {
    return (
      <Card className="bg-blue-50 border-blue-200 rounded-lg">
        <CardContent className="p-4">
          <p className="text-sm text-blue-700 font-light">
            No students linked to your account. Please contact your consultant to link a student.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-slate-200 rounded-lg">
      <CardContent className="p-4">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase tracking-wider font-light flex items-center gap-2">
            <UserIcon size={14} />
            Viewing Student
          </Label>
          <Select value={selectedStudentId} onValueChange={handleStudentChange}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              {linkedStudents.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.full_name || student.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

