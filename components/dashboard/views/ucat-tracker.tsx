"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, TrendingUp, Award, ClipboardList, Pencil, Trash2, Calendar, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts"
import { MentorComments } from "@/components/portal/mentor-comments"
import { getCurrentUser, getUCATMocks, createUCATMock, updateUCATMock, deleteUCATMock } from "@/lib/supabase/queries"
import type { User } from "@/lib/supabase/types"
import type { UCATMock as DBUCATMock } from "@/lib/supabase/types"
// Auto-save and undo/redo removed - using manual save
import { exportToCSV, exportToJSON } from "@/lib/utils/export"
import { Download, FileText } from "lucide-react"
import { generateUCATReport } from "@/lib/utils/pdf-generator"
import { getUserById } from "@/lib/supabase/queries"
import { logger } from "@/lib/utils/logger"
import { showNotification } from "@/components/ui/notification"

interface UCATMock {
  id: string
  date: string
  provider: string
  vr: number
  dm: number
  qr: number
  sjt: string
  total: number
}

interface UCATTrackerProps {
  viewMode: "student" | "parent" | "mentor"
  studentId?: string
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-3 shadow-lg">
        <p className="text-white text-sm font-light mb-2">{payload[0]?.payload?.date}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white text-sm font-light" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function UCATTracker({ viewMode, studentId }: UCATTrackerProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

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
  const [mocks, setMocks] = useState<UCATMock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [studentData, setStudentData] = useState<User | null>(null)

  // Manual save functionality
  const [isSaving, setIsSaving] = useState(false)
  
  const handleSave = async () => {
    if (!displayStudentId || !canEdit) return
    
    setIsSaving(true)
    try {
      // Get current mocks from DB to check for conflicts
      const dbMocks = await getUCATMocks(displayStudentId)
      const dbMockIds = new Set(dbMocks.map(m => m.id))
      const localMockIds = new Set(mocks.map(m => m.id))
      
      // Create a copy to avoid mutation
      const dataCopy = [...mocks]
      
      // Save all mocks
      const savePromises = dataCopy.map(async (mock) => {
        const dbMock = componentMockToDB(mock)
        if (dbMockIds.has(mock.id)) {
          // Update existing
          return await updateUCATMock(mock.id, dbMock)
        } else {
          // Create new - check if it's a temporary ID (timestamp string)
          const isTemporaryId = /^\d+$/.test(mock.id) && mock.id.length > 10
          if (isTemporaryId) {
            const result = await createUCATMock(displayStudentId, dbMock)
            if (result) {
              // Update local state with real ID
              setMocks(prev => prev.map(m => m.id === mock.id ? dbMockToComponent(result) : m))
            }
            return result
          }
          return null
        }
      })

      // Delete mocks that are no longer in local state
      const deletePromises = dbMocks
        .filter(dbMock => !localMockIds.has(dbMock.id))
        .map(dbMock => deleteUCATMock(dbMock.id))

      await Promise.all(savePromises)
      await Promise.all(deletePromises)
      
      showNotification("UCAT data saved successfully", "success")
    } catch (error) {
      logger.error("Error saving mocks", error, { studentId: displayStudentId })
      showNotification("Failed to save UCAT data", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Helper function to convert DB format to component format
  const dbMockToComponent = (dbMock: DBUCATMock): UCATMock => ({
    id: dbMock.id,
    date: dbMock.date,
    provider: dbMock.mock_name,
    vr: dbMock.vr_score || 0,
    dm: dbMock.dm_score || 0,
    qr: dbMock.qr_score || 0,
    sjt: dbMock.sjt_band || "Band 1",
    total: dbMock.total_score || 0,
  })

  // Helper function to convert component format to DB format
  const componentMockToDB = (mock: UCATMock): Omit<DBUCATMock, 'id' | 'user_id' | 'created_at' | 'updated_at'> => ({
    date: mock.date,
    mock_name: mock.provider,
    vr_score: mock.vr,
    dm_score: mock.dm,
    qr_score: mock.qr,
    ar_score: null,
    total_score: mock.total,
    sjt_band: mock.sjt,
  })

  // Load mocks and student data from Supabase
  useEffect(() => {
    let mounted = true
    
    const loadMocks = async () => {
      const targetStudentId = studentId || currentUserId
      if (!targetStudentId) {
        if (mounted) setIsLoading(false)
        return
      }
      
      if (mounted) setIsLoading(true)
      try {
        const [dbMocks, student] = await Promise.all([
          getUCATMocks(targetStudentId),
          getUserById(targetStudentId),
        ])
        
        if (!mounted) return
        
        const componentMocks = dbMocks.map(dbMockToComponent)
        setMocks(componentMocks)
        if (student) {
          setStudentData(student)
        }
      } catch (error) {
        if (mounted) {
          logger.error("Error loading UCAT mocks", error, { studentId: targetStudentId })
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    
    loadMocks()
    
    return () => {
      mounted = false
    }
  }, [studentId, currentUserId])

  // Handler for PDF download
  const handleDownloadPDF = async () => {
    if (!displayStudentId || !studentData) return

    setIsGeneratingPDF(true)
    try {
      // Get DB format mocks for PDF
      const dbMocks = await getUCATMocks(displayStudentId)
      
      // Convert to format expected by PDF generator
      const pdfMocks = dbMocks.map(mock => {
        // Convert SJT band string to number (e.g., "Band 1" -> 1, "Band 2" -> 2)
        let sjtValue: number | null = null
        if (mock.sjt_band) {
          const bandMatch = mock.sjt_band.match(/Band\s*(\d+)/i)
          if (bandMatch) {
            sjtValue = parseInt(bandMatch[1], 10)
          }
        }
        
        return {
          mock_date: mock.date,
          mock_name: mock.mock_name,
          verbal_reasoning: mock.vr_score,
          decision_making: mock.dm_score,
          quantitative_reasoning: mock.qr_score,
          abstract_reasoning: mock.ar_score,
          situational_judgement: sjtValue,
          total_score: mock.total_score,
        }
      })

      await generateUCATReport({
        student: studentData,
        mocks: pdfMocks,
      })
    } catch (error) {
      logger.error("Error generating PDF", error, { studentId: displayStudentId })
      showNotification("Failed to generate PDF report. Please try again.", "error")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMock, setEditingMock] = useState<UCATMock | null>(null)
  const [examDate, setExamDate] = useState<string>("")
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showFinalConfirm, setShowFinalConfirm] = useState(false)

  const emptyFormState = {
    date: "",
    provider: "",
    vr: "",
    dm: "",
    qr: "",
    sjt: "",
  }

  const [formData, setFormData] = useState(emptyFormState)
  const [editFormData, setEditFormData] = useState(emptyFormState)

  const highestScore = Math.max(...mocks.map((m) => m.total))
  const averageBand = "Band 1"
  const mocksCompleted = mocks.length

  // Load exam date from localStorage on mount
  useEffect(() => {
    const savedExamDate = localStorage.getItem("ucat_exam_date")
    if (savedExamDate) {
      setExamDate(savedExamDate)
    }
  }, [])

  // Calculate days until exam
  useEffect(() => {
    if (examDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const exam = new Date(examDate)
      exam.setHours(0, 0, 0, 0)
      const diffTime = exam.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysUntilExam(diffDays)
      localStorage.setItem("ucat_exam_date", examDate)
    } else {
      setDaysUntilExam(null)
      localStorage.removeItem("ucat_exam_date")
    }
  }, [examDate])

  const chartData = mocks.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    totalScore: m.total,
    averageSubtest: Math.round((m.vr + m.dm + m.qr) / 3),
  }))

  const calculateTotal = (data: { vr: string; dm: string; qr: string }) =>
    Number(data.vr) + Number(data.dm) + Number(data.qr)

  const isScoreValid = (value: string) => {
    const num = Number(value)
    return !Number.isNaN(num) && num >= 300 && num <= 900
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayStudentId) return
    
    if (!isScoreValid(formData.vr) || !isScoreValid(formData.dm) || !isScoreValid(formData.qr)) {
      window.alert("Each subtest score (VR, DM, QR) must be between 300 and 900.")
      return
    }

    const total = calculateTotal(formData)
    if (total > 2700) {
      window.alert("Total UCAT score cannot exceed 2700 (VR + DM + QR, each max 900).")
      return
    }

    const newMock: UCATMock = {
      id: Date.now().toString(), // Temporary ID
      date: formData.date,
      provider: formData.provider,
      vr: Number(formData.vr),
      dm: Number(formData.dm),
      qr: Number(formData.qr),
      sjt: formData.sjt,
      total,
    }

    // Optimistically update UI
    setMocks([...mocks, newMock])
    setIsCreateDialogOpen(false)
    setFormData(emptyFormState)
    
    // Auto-save will handle the save
  }

  const handleDelete = (id: string) => {
    // Optimistically update UI
    setMocks(mocks.filter((m) => m.id !== id))
    // Auto-save will handle the deletion
  }

  const handleEditClick = (mock: UCATMock) => {
    setEditingMock(mock)
    setEditFormData({
      date: mock.date,
      provider: mock.provider,
      vr: String(mock.vr),
      dm: String(mock.dm),
      qr: String(mock.qr),
      sjt: mock.sjt,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMock) return

    if (
      !isScoreValid(editFormData.vr) ||
      !isScoreValid(editFormData.dm) ||
      !isScoreValid(editFormData.qr)
    ) {
      window.alert("Each subtest score (VR, DM, QR) must be between 300 and 900.")
      return
    }

    const total = calculateTotal(editFormData)
    if (total > 2700) {
      window.alert("Total UCAT score cannot exceed 2700 (VR + DM + QR, each max 900).")
      return
    }

    const updated: UCATMock = {
      ...editingMock,
      date: editFormData.date,
      provider: editFormData.provider,
      vr: Number(editFormData.vr),
      dm: Number(editFormData.dm),
      qr: Number(editFormData.qr),
      sjt: editFormData.sjt,
      total,
    }

    // Optimistically update UI
    setMocks(mocks.map((m) => (m.id === editingMock.id ? updated : m)))
    setIsEditDialogOpen(false)
    setEditingMock(null)
    
    // Auto-save will handle the save
  }

  const handleClearAllClick = () => {
    setShowClearConfirm(true)
  }

  const handleClearAllConfirm = () => {
    setShowClearConfirm(false)
    setShowFinalConfirm(true)
  }

  const handleClearAllFinal = () => {
    setMocks([])
    setShowFinalConfirm(false)
    // Auto-save will handle the deletion
  }

  // Keyboard shortcuts removed - undo/redo functionality removed

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-slate-600 font-light">Loading UCAT mocks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Exam Date Countdown */}
      <Card className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border-[#D4AF37]/20 rounded-lg shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#D4AF37]" />
              <div>
                <Label htmlFor="exam-date" className="text-sm font-light text-slate-600">
                  UCAT Exam Date
                </Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 rounded-lg mt-1 w-full sm:w-auto focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                />
              </div>
            </div>
            {daysUntilExam !== null && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs font-light text-slate-600">Days until exam</p>
                  <p className={`text-2xl font-light ${daysUntilExam < 0 ? "text-red-600" : daysUntilExam <= 30 ? "text-amber-600" : "text-slate-900"}`}>
                    {daysUntilExam < 0 ? `${Math.abs(daysUntilExam)} days past` : daysUntilExam === 0 ? "Today!" : `${daysUntilExam} days`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Area */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-light text-slate-900">Performance Analytics</h2>
          <p className="text-sm text-slate-600 mt-1 font-light">Track your UCAT mock exam progress</p>
          {canEdit && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="mt-2 bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg"
            >
              {isSaving ? "Saving..." : "Save UCAT Data"}
            </Button>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const csvData = mocks.map(m => ({
                  Date: m.date,
                  'Mock Provider': m.provider,
                  'VR Score': m.vr,
                  'DM Score': m.dm,
                  'QR Score': m.qr,
                  'Total Score': m.total,
                  'SJT Band': m.sjt,
                }))
                exportToCSV(csvData, 'ucat-mocks')
              }}
              className="border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
              disabled={mocks.length === 0}
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light shadow-sm hover:shadow-md transition-all">
                <Plus size={16} className="mr-2" />
                Log New Mock Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 max-w-2xl rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-slate-900 font-light">Add Mock Exam Result</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-slate-700 font-light">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider" className="text-slate-700 font-light">
                      Mock Provider
                    </Label>
                    <Select
                      value={formData.provider}
                      onValueChange={(value) => setFormData({ ...formData, provider: value })}
                    >
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300 rounded-lg">
                        <SelectItem value="Medify">Medify</SelectItem>
                        <SelectItem value="MedEntry">MedEntry</SelectItem>
                        <SelectItem value="Official">Official UCAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vr" className="text-slate-700 font-light">
                      VR Score
                    </Label>
                    <Input
                      id="vr"
                      type="number"
                      min="300"
                      max="900"
                      value={formData.vr}
                      onChange={(e) => setFormData({ ...formData, vr: e.target.value })}
                      className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dm" className="text-slate-700 font-light">
                      DM Score
                    </Label>
                    <Input
                      id="dm"
                      type="number"
                      min="300"
                      max="900"
                      value={formData.dm}
                      onChange={(e) => setFormData({ ...formData, dm: e.target.value })}
                      className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qr" className="text-slate-700 font-light">
                      QR Score
                    </Label>
                    <Input
                      id="qr"
                      type="number"
                      min="300"
                      max="900"
                      value={formData.qr}
                      onChange={(e) => setFormData({ ...formData, qr: e.target.value })}
                      className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sjt" className="text-slate-700 font-light">
                    SJT Band
                  </Label>
                  <Select value={formData.sjt} onValueChange={(value) => setFormData({ ...formData, sjt: value })}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all">
                      <SelectValue placeholder="Select band" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-300 rounded-lg">
                      <SelectItem value="Band 1">Band 1</SelectItem>
                      <SelectItem value="Band 2">Band 2</SelectItem>
                      <SelectItem value="Band 3">Band 3</SelectItem>
                      <SelectItem value="Band 4">Band 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light shadow-sm hover:shadow-md transition-all">
                    Save Mock Exam
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-light text-slate-500">Highest Total Score</CardTitle>
            <TrendingUp size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-slate-900">{highestScore}</div>
            <p className="text-xs text-slate-600 mt-1 font-light">Peak performance</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-light text-slate-500">Average Band</CardTitle>
            <Award size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-slate-900">{averageBand}</div>
            <p className="text-xs text-slate-600 mt-1 font-light">SJT Performance</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-light text-slate-500">Mock Exams Completed</CardTitle>
            <ClipboardList size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-slate-900">{mocksCompleted}</div>
            <p className="text-xs text-slate-600 mt-1 font-light">Total attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart - Elegant Styling */}
      <Card className="bg-white border-slate-200 rounded-lg shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg font-light text-slate-900">Score Progression</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#64748b" }}
                axisLine={{ stroke: "#cbd5e1" }}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#64748b" }}
                axisLine={{ stroke: "#cbd5e1" }}
                domain={[1800, 2700]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#64748b" }}
                axisLine={{ stroke: "#cbd5e1" }}
                domain={[600, 850]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalScore"
                stroke="#D4AF37"
                strokeWidth={3}
                dot={{ fill: "#D4AF37", r: 5, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, fill: "#D4AF37" }}
                name="Total Score"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageSubtest"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#94a3b8", r: 4 }}
                name="Average Subtest Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Mentor Comments for UCAT Section */}
      {displayStudentId && (
        <MentorComments
          studentId={displayStudentId}
          section="ucat"
          viewMode={viewMode}
          currentUserId={currentUserId || undefined}
        />
      )}

      {/* Data Table + Edit Dialog */}
      <Card className="bg-white border-slate-200 rounded-lg shadow-sm">
        <CardHeader className="border-b border-slate-200 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-light text-slate-900">Mock Exam History</CardTitle>
          <div className="flex items-center gap-2">
            {mocks.length > 0 && (
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 border-[#D4AF37] rounded-lg transition-all font-light"
              >
                <FileText size={14} className="mr-2" />
                {isGeneratingPDF ? "Generating..." : "Download PDF Report"}
              </Button>
            )}
            {canEdit && mocks.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAllClick}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-lg transition-all"
              >
                <Trash2 size={14} className="mr-2" />
                Clear All Mocks
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-light text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-light text-slate-500 uppercase tracking-wider">
                    Mock Name
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-light text-slate-500 uppercase tracking-wider">
                    VR
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-light text-slate-500 uppercase tracking-wider">
                    DM
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-light text-slate-500 uppercase tracking-wider">
                    QR
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-light text-slate-500 uppercase tracking-wider font-medium">
                    Total Score
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-light text-slate-500 uppercase tracking-wider">
                    SJT Band
                  </th>
                  {canEdit && (
                    <th className="text-center py-3 px-4 text-xs font-light text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {mocks.map((mock) => (
                  <tr key={mock.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-sm text-slate-700 font-light">
                      {new Date(mock.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700 font-light">{mock.provider}</td>
                    <td className="py-3 px-4 text-sm text-center text-slate-700 font-light">{mock.vr}</td>
                    <td className="py-3 px-4 text-sm text-center text-slate-700 font-light">{mock.dm}</td>
                    <td className="py-3 px-4 text-sm text-center text-slate-700 font-light">{mock.qr}</td>
                    <td className="py-3 px-4 text-sm text-center font-medium text-slate-900 bg-[#D4AF37]/10">
                      {mock.total}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-slate-700 font-light">{mock.sjt}</td>
                    {canEdit && (
                      <td className="py-3 px-4 text-sm text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => handleEditClick(mock)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Pencil size={14} className="text-slate-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(mock.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Mock Dialog */}
      {canEdit && editingMock && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white border-slate-200 max-w-2xl rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-light">Edit Mock Exam Result</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date" className="text-slate-700 font-light">
                    Date
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-provider" className="text-slate-700 font-light">
                    Mock Provider
                  </Label>
                  <Input
                    id="edit-provider"
                    type="text"
                    value={editFormData.provider}
                    onChange={(e) => setEditFormData({ ...editFormData, provider: e.target.value })}
                    className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vr" className="text-slate-700 font-light">
                    VR Score
                  </Label>
                  <Input
                    id="edit-vr"
                    type="number"
                    min="300"
                    max="900"
                    value={editFormData.vr}
                    onChange={(e) => setEditFormData({ ...editFormData, vr: e.target.value })}
                    className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dm" className="text-slate-700 font-light">
                    DM Score
                  </Label>
                  <Input
                    id="edit-dm"
                    type="number"
                    min="300"
                    max="900"
                    value={editFormData.dm}
                    onChange={(e) => setEditFormData({ ...editFormData, dm: e.target.value })}
                    className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-qr" className="text-slate-700 font-light">
                    QR Score
                  </Label>
                  <Input
                    id="edit-qr"
                    type="number"
                    min="300"
                    max="900"
                    value={editFormData.qr}
                    onChange={(e) => setEditFormData({ ...editFormData, qr: e.target.value })}
                    className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-sjt" className="text-slate-700 font-light">
                  SJT Band
                </Label>
                <Select
                  value={editFormData.sjt}
                  onValueChange={(value) => setEditFormData({ ...editFormData, sjt: value })}
                >
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all">
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300 rounded-lg">
                    <SelectItem value="Band 1">Band 1</SelectItem>
                    <SelectItem value="Band 2">Band 2</SelectItem>
                    <SelectItem value="Band 3">Band 3</SelectItem>
                    <SelectItem value="Band 4">Band 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light shadow-sm hover:shadow-md transition-all">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Clear All Mocks - First Confirmation */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="bg-white border-slate-200 max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-light flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Clear All Mock Exams?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-700 font-light">
              Are you sure you want to delete all {mocks.length} mock exam records? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
              className="border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAllConfirm}
              className="bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-all"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear All Mocks - Final Confirmation */}
      <Dialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
        <DialogContent className="bg-white border-slate-200 max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-light flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Final Confirmation Required
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-700 font-light mb-2">
              <strong className="font-medium text-red-600">Warning:</strong> This will permanently delete all {mocks.length} mock exam records.
            </p>
            <p className="text-slate-600 text-sm font-light">
              This action cannot be restored. Are you absolutely certain you want to proceed?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowFinalConfirm(false)
                setShowClearConfirm(false)
              }}
              className="border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAllFinal}
              className="bg-red-600 text-white hover:bg-red-700 rounded-lg transition-all"
            >
              Yes, Delete All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

