"use client"

import type React from "react"

import { useState } from "react"
import { Plus, CheckCircle2, Briefcase, Heart, BookOpen, Dumbbell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  viewMode: "student" | "parent"
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

export function PortfolioBuilder({ viewMode }: PortfolioBuilderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("work")
  const [formData, setFormData] = useState({
    organization: "",
    role: "",
    startDate: "",
    endDate: "",
    notes: "",
  })

  const [activities, setActivities] = useState<Record<string, Activity[]>>({
    work: [
      {
        id: "1",
        organization: "Royal London Hospital",
        role: "Healthcare Assistant Shadowing",
        startDate: "2026-01",
        endDate: "2026-02",
        notes:
          "Observed patient care in A&E department. Learned about triage processes and multidisciplinary team collaboration.",
        verified: true,
      },
    ],
    volunteering: [
      {
        id: "2",
        organization: "St. John Ambulance",
        role: "Volunteer First Aider",
        startDate: "2025-09",
        endDate: "Present",
        notes: "Providing first aid support at community events. Completed advanced first aid training.",
        verified: true,
      },
    ],
    reading: [
      {
        id: "3",
        organization: "Medical Literature",
        role: "Being Mortal by Atul Gawande",
        startDate: "2026-01",
        endDate: "2026-02",
        notes:
          "Eye-opening exploration of end-of-life care and how medicine approaches mortality. Changed my perspective on patient autonomy.",
        verified: false,
      },
    ],
    extracurricular: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newActivity: Activity = {
      id: Date.now().toString(),
      organization: formData.organization,
      role: formData.role,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
      verified: false,
    }

    setActivities({
      ...activities,
      [activeTab]: [...activities[activeTab], newActivity],
    })

    setIsDialogOpen(false)
    setFormData({ organization: "", role: "", startDate: "", endDate: "", notes: "" })
  }

  const tabs = [
    { id: "work", label: "Work Experience", icon: Briefcase },
    { id: "volunteering", label: "Volunteering", icon: Heart },
    { id: "reading", label: "Reading/Research", icon: BookOpen },
    { id: "extracurricular", label: "Extracurriculars", icon: Dumbbell },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-slate-900 mb-1 font-light">Supracurricular Portfolio</h2>
          <p className="text-sm text-slate-700 font-light">Document your experiences and reflections</p>
        </div>

        {viewMode === "student" && (
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

        <TabsContent key={activeTab} value={activeTab} className="mt-6">
          {activities[activeTab].length === 0 ? (
            <Card className="bg-white border-slate-200 border-dashed rounded-lg">
              <CardContent className="py-12 text-center">
                {(() => {
                  const TabIcon = tabs.find((t) => t.id === activeTab)?.icon
                  return TabIcon ? <TabIcon size={48} className="mx-auto text-slate-400 mb-4" strokeWidth={1} /> : null
                })()}
                <p className="text-slate-700 font-light">No activities added yet</p>
                {viewMode === "student" && (
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
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <p className="text-xs text-green-700 font-light">Verified by Consultant</p>
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
