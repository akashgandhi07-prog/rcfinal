"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Plus, CheckCircle2, Briefcase, Heart, BookOpen, Dumbbell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MentorComments } from "./mentor-comments"
import { getCurrentUser, getPortfolioActivities, createPortfolioActivity, updatePortfolioActivity, deletePortfolioActivity } from "@/lib/supabase/queries"
import type { User } from "@/lib/supabase/types"
import type { PortfolioActivity as DBPortfolioActivity } from "@/lib/supabase/types"
import { useUndoRedo } from "@/lib/hooks/use-undo-redo"
import { useAutoSave } from "@/lib/hooks/use-auto-save"
import { SaveStatusIndicator } from "@/components/ui/save-status"
import { UndoRedoButtons } from "@/components/ui/undo-redo-buttons"
import { exportToCSV, exportToJSON } from "@/lib/utils/export"
import { Download } from "lucide-react"

interface Activity {
  id: string
  organization: string
  role: string
  startDate: string
  endDate: string
  notes: string
  verified: boolean
}

interface PortfolioBuilderProps {
  viewMode: "student" | "parent" | "mentor"
  studentId?: string
}

// Helper function to format date as DD-MM-YYYY
const formatDate = (dateString: string): string => {
  if (!dateString) return ""
  const date = new Date(dateString + "-01") // Add day for month-only dates
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

// Helper function to format month range
const formatDateRange = (startDate: string, endDate: string): string => {
  if (!startDate) return ""
  const start = formatDate(startDate)
  if (!endDate || endDate === "Present") {
    return `${start} - Present`
  }
  const end = formatDate(endDate)
  return `${start} - ${end}`
}

export function PortfolioBuilder({ viewMode, studentId }: PortfolioBuilderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("work")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    organization: "",
    role: "",
    startDate: "",
    endDate: "",
    notes: "",
  })

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    loadUser()
  }, [])

  const displayStudentId = studentId || currentUserId
  const canEdit = viewMode === "student" || viewMode === "mentor"
  const [activities, setActivities] = useState<Record<string, Activity[]>>({
    work: [],
    volunteering: [],
    reading: [],
    extracurricular: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  // Helper function to convert DB format to component format
  const dbActivityToComponent = (dbActivity: DBPortfolioActivity): Activity => ({
    id: dbActivity.id,
    organization: dbActivity.organization,
    role: dbActivity.role,
    startDate: dbActivity.start_date,
    endDate: dbActivity.end_date || "Present",
    notes: dbActivity.notes || "",
    verified: dbActivity.verified,
  })

  // Helper function to convert component format to DB format
  const componentActivityToDB = (activity: Activity, category: string): Omit<DBPortfolioActivity, 'id' | 'user_id' | 'created_at' | 'updated_at'> => ({
    category: category as 'work' | 'volunteering' | 'reading' | 'extracurricular',
    organization: activity.organization,
    role: activity.role,
    start_date: activity.startDate,
    end_date: activity.endDate === "Present" ? null : activity.endDate,
    notes: activity.notes || null,
    verified: activity.verified,
  })

  // Load activities from Supabase
  useEffect(() => {
    const loadActivities = async () => {
      const targetStudentId = studentId || currentUserId
      if (!targetStudentId) {
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      try {
        const dbActivities = await getPortfolioActivities(targetStudentId)
        const groupedActivities: Record<string, Activity[]> = {
          work: [],
          volunteering: [],
          reading: [],
          extracurricular: [],
        }
        
        dbActivities.forEach(dbActivity => {
          const componentActivity = dbActivityToComponent(dbActivity)
          groupedActivities[dbActivity.category].push(componentActivity)
        })
        
        setActivities(groupedActivities)
        setActivitiesState(groupedActivities)
      } catch (error) {
        console.error("Error loading portfolio activities:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadActivities()
  }, [studentId, currentUserId])

  const [todos, setTodos] = useState<Record<string, { id: string; text: string; done: boolean }[]>>({
    work: [],
    volunteering: [],
    reading: [],
    extracurricular: [],
  })
  const [newTodo, setNewTodo] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayStudentId) return

    const newActivity: Activity = {
      id: Date.now().toString(), // Temporary ID
      organization: formData.organization,
      role: formData.role,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
      verified: false,
    }

    // Optimistically update UI
    setActivities({
      ...activities,
      [activeTab]: [...activities[activeTab], newActivity],
    })

    setIsDialogOpen(false)
    setFormData({ organization: "", role: "", startDate: "", endDate: "", notes: "" })
    
    // Auto-save will handle the save
  }

  const tabs = [
    { id: "work", label: "Work Experience", icon: Briefcase },
    { id: "volunteering", label: "Volunteering", icon: Heart },
    { id: "reading", label: "Reading/Research", icon: BookOpen },
    { id: "extracurricular", label: "Extracurriculars", icon: Dumbbell },
  ]

  const addTodo = () => {
    if (!newTodo.trim()) return
    const todo = { id: crypto.randomUUID(), text: newTodo.trim(), done: false }
    setTodos({ ...todos, [activeTab]: [...todos[activeTab], todo] })
    setNewTodo("")
  }

  const toggleTodo = (id: string) => {
    setTodos({
      ...todos,
      [activeTab]: todos[activeTab].map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    })
  }

  const deleteTodo = (id: string) => {
    setTodos({
      ...todos,
      [activeTab]: todos[activeTab].filter((t) => t.id !== id),
    })
  }

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    if (!canEdit) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        if (canRedo) redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canEdit, canUndo, canRedo, undo, redo])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-slate-600 font-light">Loading portfolio activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-slate-900 mb-1 font-light">Supracurricular Portfolio</h2>
          <p className="text-sm text-slate-700 font-light">Document your experiences and reflections</p>
          {canEdit && (
            <div className="flex items-center gap-3 mt-2">
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
              <UndoRedoButtons 
                onUndo={undo} 
                onRedo={redo} 
                canUndo={canUndo} 
                canRedo={canRedo} 
              />
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const allActivities = Object.entries(activities).flatMap(([category, acts]) =>
                  acts.map(act => ({
                    Category: category,
                    Organization: act.organization,
                    Role: act.role,
                    'Start Date': act.startDate,
                    'End Date': act.endDate,
                    Notes: act.notes,
                    Verified: act.verified ? 'Yes' : 'No',
                  }))
                )
                if (allActivities.length > 0) {
                  exportToCSV(allActivities, 'portfolio-activities')
                } else {
                  alert('No activities to export')
                }
              }}
              className="border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
              disabled={Object.values(activities).flat().length === 0}
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light px-6 shadow-lg shadow-[#D4AF37]/20">
                  <Plus size={16} className="mr-2" />
                  Add Activity
                </Button>
              </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 max-w-2xl rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-slate-900 font-serif text-xl font-light">Add New Activity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-sm text-slate-900 font-light">
                    {activeTab === "reading" ? "Book Title/Research Topic" : "Organization Name"}
                  </Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="border-slate-300 text-slate-900 rounded-lg bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm text-slate-900 font-light">
                    {activeTab === "reading" ? "Author/Source" : "Role/Position"}
                  </Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="border-slate-300 text-slate-900 rounded-lg bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm text-slate-900 font-light">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="month"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="border-slate-300 text-slate-900 rounded-lg bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm text-slate-900 font-light">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="month"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="border-slate-300 text-slate-900 rounded-lg bg-white"
                      placeholder="Leave empty if ongoing"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm text-slate-900 font-light">
                    Reflective Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="border-slate-300 text-slate-900 min-h-32 rounded-lg bg-white"
                    placeholder="What did you learn? How did this experience shape your understanding of medicine?"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-light"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light">
                    Save Activity
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-slate-200 rounded-lg h-auto p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-slate-950 data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-slate-900 rounded-lg font-light px-4 py-2"
              >
                <Icon size={16} className="mr-2" strokeWidth={1.5} />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Overall comments for the active section */}
        {displayStudentId && (
          <div className="mt-6">
            <Card className="bg-white border-slate-200 rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-light text-slate-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#D4AF37]" />
                  Overall Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MentorComments
                  studentId={displayStudentId}
                  section={
                    activeTab === "work"
                      ? "work_experience"
                      : activeTab === "volunteering"
                      ? "volunteering"
                      : activeTab === "extracurricular"
                      ? "supracurricular"
                      : "portfolio"
                  }
                  sectionItemId={null}
                  viewMode={viewMode}
                  currentUserId={currentUserId || undefined}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* To-Do list for the active section */}
        <div className="mt-4">
          <Card className="bg-white border-slate-200 rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-light text-slate-700 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#D4AF37]" />
                To-Do
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canEdit && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a task..."
                    className="h-9"
                  />
                  <Button size="sm" onClick={addTodo} className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90">
                    Add
                  </Button>
                </div>
              )}
              {todos[activeTab].length === 0 ? (
                <p className="text-xs text-slate-500 font-light">No tasks yet.</p>
              ) : (
                <div className="space-y-2">
                  {todos[activeTab].map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                    >
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={todo.done}
                          onChange={() => toggleTodo(todo.id)}
                          className="h-4 w-4"
                          disabled={!canEdit}
                        />
                        <span className={todo.done ? "line-through text-slate-400" : ""}>{todo.text}</span>
                      </label>
                      {canEdit && (
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                          aria-label="Delete task"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <TabsContent key={activeTab} value={activeTab} className="mt-6">
          {activities[activeTab].length === 0 ? (
            <Card className="bg-white border-slate-200 border-dashed rounded-lg">
              <CardContent className="py-12 text-center">
                {(() => {
                  const TabIcon = tabs.find((t) => t.id === activeTab)?.icon
                  return TabIcon ? <TabIcon size={48} className="mx-auto text-slate-400 mb-4" strokeWidth={1} /> : null
                })()}
                <p className="text-slate-700 font-light">No activities added yet</p>
                {canEdit && (
                  <p className="text-sm text-slate-600 mt-2 font-light">Click "Add Activity" to get started</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activities[activeTab].map((activity) => (
                <Card key={activity.id} className="bg-white border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg font-serif text-slate-900 font-medium">
                            {activity.organization}
                          </CardTitle>
                          {activity.verified && (
                            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" strokeWidth={2} />
                          )}
                        </div>
                        <p className="text-[#D4AF37] font-serif text-base font-medium mb-2">{activity.role}</p>
                        <p className="text-sm text-slate-600 font-light">
                          {formatDateRange(activity.startDate, activity.endDate)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-slate-700 leading-relaxed font-light mb-4">{activity.notes}</p>
                    {activity.verified && (
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-200 mb-4">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <p className="text-xs text-green-700 font-light">Verified by Consultant</p>
                      </div>
                    )}
                    {/* Mentor Comments for this activity */}
                    {displayStudentId && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <MentorComments
                          studentId={displayStudentId}
                          section={activeTab === "work" ? "work_experience" : activeTab === "volunteering" ? "volunteering" : activeTab === "extracurricular" ? "supracurricular" : "portfolio"}
                          sectionItemId={activity.id}
                          viewMode={viewMode}
                          currentUserId={currentUserId || undefined}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
