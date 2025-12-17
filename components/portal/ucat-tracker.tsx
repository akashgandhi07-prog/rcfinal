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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

type MiniMockType = "VR" | "DM" | "QR" | "SJT"

interface MiniMock {
  id: string
  date: string
  type: MiniMockType
  score?: number
  band?: string
}

interface UCATTrackerProps {
  viewMode: "student" | "parent" | "mentor"
  studentId?: string
}

export function UCATTracker({ viewMode }: UCATTrackerProps) {
  const [mocks, setMocks] = useState<UCATMock[]>([
    {
      id: "1",
      date: "2026-01-15",
      provider: "Medify Mock 1",
      vr: 680,
      dm: 720,
      qr: 690,
      sjt: "Band 1",
      total: 2090,
    },
    {
      id: "2",
      date: "2026-01-22",
      provider: "Official Mock A",
      vr: 710,
      dm: 730,
      qr: 720,
      sjt: "Band 1",
      total: 2160,
    },
    {
      id: "3",
      date: "2026-02-05",
      provider: "Medify Mock 2",
      vr: 720,
      dm: 750,
      qr: 730,
      sjt: "Band 1",
      total: 2200,
    },
    {
      id: "4",
      date: "2026-02-12",
      provider: "Official Mock B",
      vr: 740,
      dm: 760,
      qr: 750,
      sjt: "Band 1",
      total: 2250,
    },
    {
      id: "5",
      date: "2026-02-19",
      provider: "Medify Mock 3",
      vr: 750,
      dm: 770,
      qr: 760,
      sjt: "Band 1",
      total: 2280,
    },
    {
      id: "6",
      date: "2026-02-26",
      provider: "Official Mock C",
      vr: 760,
      dm: 780,
      qr: 770,
      sjt: "Band 1",
      total: 2310,
    },
    {
      id: "7",
      date: "2026-03-05",
      provider: "Medify Mock 4",
      vr: 770,
      dm: 790,
      qr: 780,
      sjt: "Band 1",
      total: 2340,
    },
    {
      id: "8",
      date: "2026-03-12",
      provider: "Official Mock D",
      vr: 780,
      dm: 800,
      qr: 790,
      sjt: "Band 1",
      total: 2370,
    },
    {
      id: "9",
      date: "2026-03-19",
      provider: "Medify Mock 5",
      vr: 790,
      dm: 810,
      qr: 800,
      sjt: "Band 1",
      total: 2400,
    },
    {
      id: "10",
      date: "2026-03-26",
      provider: "Official Mock E",
      vr: 800,
      dm: 820,
      qr: 810,
      sjt: "Band 1",
      total: 2430,
    },
    {
      id: "11",
      date: "2026-04-02",
      provider: "Medify Mock 6",
      vr: 810,
      dm: 830,
      qr: 820,
      sjt: "Band 1",
      total: 2460,
    },
    {
      id: "12",
      date: "2026-04-09",
      provider: "Official Mock F",
      vr: 820,
      dm: 840,
      qr: 830,
      sjt: "Band 1",
      total: 2490,
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMock, setEditingMock] = useState<UCATMock | null>(null)
  const [isMiniDialogOpen, setIsMiniDialogOpen] = useState(false)
  const [editingMini, setEditingMini] = useState<MiniMock | null>(null)
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

  const [miniMocks, setMiniMocks] = useState<MiniMock[]>([
    { id: "m1", date: "2026-02-01", type: "VR", score: 760 },
    { id: "m2", date: "2026-02-03", type: "DM", score: 750 },
    { id: "m3", date: "2026-02-05", type: "QR", score: 770 },
    { id: "m4", date: "2026-02-08", type: "SJT", band: "Band 1" },
  ])

  const miniEmptyState = {
    date: "",
    type: "" as MiniMockType,
    score: "",
    band: "",
  }
  const [miniForm, setMiniForm] = useState(miniEmptyState)

  const highestScore = Math.max(...mocks.map((m) => m.total))
  const averageBand = "Band 1" // Simplified - in real app, calculate from SJT bands
  const mocksCompleted = mocks.length
  const avgTotal =
    mocks.length > 0 ? Math.round(mocks.reduce((sum, m) => sum + m.total, 0) / mocks.length) : 0
  const last3Avg =
    mocks.length > 0
      ? Math.round(
          mocks
            .slice(-3)
            .reduce((sum, m) => sum + m.total, 0) / Math.min(3, mocks.length)
        )
      : 0

  const miniNumeric = miniMocks.filter((m) => m.type !== "SJT" && typeof m.score === "number") as Array<
    MiniMock & { score: number }
  >
  const miniAvg =
    miniNumeric.length > 0 ? Math.round(miniNumeric.reduce((s, m) => s + m.score, 0) / miniNumeric.length) : 0

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
      id: Date.now().toString(),
      date: formData.date,
      provider: formData.provider,
      vr: Number(formData.vr),
      dm: Number(formData.dm),
      qr: Number(formData.qr),
      sjt: formData.sjt,
      total,
    }

    setMocks([...mocks, newMock])
    setIsCreateDialogOpen(false)
    setFormData(emptyFormState)
  }

  const handleDelete = (id: string) => {
    setMocks(mocks.filter((m) => m.id !== id))
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

  const handleEditSubmit = (e: React.FormEvent) => {
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

    setMocks(mocks.map((m) => (m.id === editingMock.id ? updated : m)))
    setIsEditDialogOpen(false)
    setEditingMock(null)
  }

  const handleMiniSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!miniForm.date || !miniForm.type) return

    const newMini: MiniMock = {
      id: crypto.randomUUID(),
      date: miniForm.date,
      type: miniForm.type,
      score: miniForm.type === "SJT" ? undefined : Number(miniForm.score),
      band: miniForm.type === "SJT" ? miniForm.band || "Band 1" : undefined,
    }

    setMiniMocks((prev) => [...prev, newMini].sort((a, b) => a.date.localeCompare(b.date)))
    setMiniForm(miniEmptyState)
    setIsMiniDialogOpen(false)
    setEditingMini(null)
  }

  const handleMiniEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMini) return

    const updated: MiniMock = {
      ...editingMini,
      date: miniForm.date,
      type: miniForm.type,
      score: miniForm.type === "SJT" ? undefined : Number(miniForm.score),
      band: miniForm.type === "SJT" ? miniForm.band || "Band 1" : undefined,
    }

    setMiniMocks((prev) =>
      prev
        .map((m) => (m.id === editingMini.id ? updated : m))
        .sort((a, b) => a.date.localeCompare(b.date))
    )
    setMiniForm(miniEmptyState)
    setEditingMini(null)
    setIsMiniDialogOpen(false)
  }

  const handleMiniDelete = (id: string) => {
    setMiniMocks((prev) => prev.filter((m) => m.id !== id))
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
                <Label htmlFor="exam-date" className="text-sm font-light text-slate-300">
                  UCAT Exam Date
                </Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white rounded-lg mt-1 w-full sm:w-auto focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                />
              </div>
            </div>
            {daysUntilExam !== null && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs font-light text-slate-400">Days until exam</p>
                  <p className={`text-2xl font-light ${daysUntilExam < 0 ? "text-red-400" : daysUntilExam <= 30 ? "text-amber-400" : "text-slate-100"}`}>
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
          <h2 className="text-xl font-light text-slate-200">Performance Analytics</h2>
          <p className="text-sm text-slate-400 mt-1">Track your UCAT mock exam progress</p>
        </div>

        {viewMode === "student" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90">
                <Plus size={16} className="mr-2" />
                Log New Mock Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0B1120] border-slate-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-[#D4AF37] font-serif">Add Mock Exam Result</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-slate-300">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider" className="text-slate-300">
                      Mock Provider
                    </Label>
                    <Select
                      value={formData.provider}
                      onValueChange={(value) => setFormData({ ...formData, provider: value })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="Medify">Medify</SelectItem>
                        <SelectItem value="MedEntry">MedEntry</SelectItem>
                        <SelectItem value="Official">Official UCAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vr" className="text-slate-300">
                      VR Score
                    </Label>
                    <Input
                      id="vr"
                      type="number"
                      min="300"
                      max="900"
                      value={formData.vr}
                      onChange={(e) => setFormData({ ...formData, vr: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dm" className="text-slate-300">
                      DM Score
                    </Label>
                    <Input
                      id="dm"
                      type="number"
                      min="300"
                      max="900"
                      value={formData.dm}
                      onChange={(e) => setFormData({ ...formData, dm: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qr" className="text-slate-300">
                      QR Score
                    </Label>
                    <Input
                      id="qr"
                      type="number"
                      min="300"
                      max="900"
                      value={formData.qr}
                      onChange={(e) => setFormData({ ...formData, qr: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sjt" className="text-slate-300">
                    SJT Band
                  </Label>
                  <Select value={formData.sjt} onValueChange={(value) => setFormData({ ...formData, sjt: value })}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Select band" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
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
                    className="border-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90">
                    Save Mock Exam
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {viewMode === "student" && (
          <Dialog open={isMiniDialogOpen} onOpenChange={setIsMiniDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-[#D4AF37]/60 text-[#D4AF37] hover:bg-[#D4AF37]/10 ml-3"
                onClick={() => {
                  setEditingMini(null)
                  setMiniForm(miniEmptyState)
                }}
              >
                <Plus size={16} className="mr-2" />
                Log Mini Mock
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0B1120] border-slate-800 max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-[#D4AF37] font-serif">
                  {editingMini ? "Edit Mini Mock" : "Add Mini Mock"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={editingMini ? handleMiniEditSubmit : handleMiniSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Date</Label>
                    <Input
                      type="date"
                      value={miniForm.date}
                      onChange={(e) => setMiniForm({ ...miniForm, date: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Subtest</Label>
                    <Select
                      value={miniForm.type}
                      onValueChange={(value) => setMiniForm({ ...miniForm, type: value as MiniMockType })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Select subtest" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="VR">VR</SelectItem>
                        <SelectItem value="DM">DM</SelectItem>
                        <SelectItem value="QR">QR</SelectItem>
                        <SelectItem value="SJT">SJT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {miniForm.type === "SJT" ? (
                  <div className="space-y-2">
                    <Label className="text-slate-300">SJT Band</Label>
                    <Select value={miniForm.band} onValueChange={(value) => setMiniForm({ ...miniForm, band: value })}>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Select band" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="Band 1">Band 1</SelectItem>
                        <SelectItem value="Band 2">Band 2</SelectItem>
                        <SelectItem value="Band 3">Band 3</SelectItem>
                        <SelectItem value="Band 4">Band 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Score (300-900)</Label>
                    <Input
                      type="number"
                      min={300}
                      max={900}
                      value={miniForm.score}
                      onChange={(e) => setMiniForm({ ...miniForm, score: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsMiniDialogOpen(false)
                      setEditingMini(null)
                      setMiniForm(miniEmptyState)
                    }}
                    className="border-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90">
                    {editingMini ? "Save Changes" : "Save Mini Mock"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-light text-slate-400">Highest Score</CardTitle>
            <TrendingUp size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-slate-100">{highestScore}</div>
            <p className="text-xs text-slate-500 mt-1">Peak performance</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-light text-slate-400">Average Band</CardTitle>
            <Award size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-slate-100">{averageBand}</div>
            <p className="text-xs text-slate-500 mt-1">SJT Performance</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-light text-slate-400">Mocks Completed</CardTitle>
            <ClipboardList size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-slate-100">{mocksCompleted}</div>
            <p className="text-xs text-slate-500 mt-1">Total attempts</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-light text-slate-400">Avg (All Mocks)</CardTitle>
            <ClipboardList size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-slate-100">{avgTotal}</div>
            <p className="text-xs text-slate-500 mt-1">Overall average total</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-light text-slate-400">Last 3 Avg / Mini Avg</CardTitle>
            <ClipboardList size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-light text-slate-100">Mocks: {last3Avg}</div>
            <p className="text-xs text-slate-500">Mini: {miniAvg || "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Mini Mocks */}
      <Card className="bg-white border-slate-200 rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-light text-slate-900">Mini Mocks (VR, DM, QR, SJT)</CardTitle>
          {viewMode === "student" && (
            <Button
              size="sm"
              onClick={() => {
                setEditingMini(null)
                setMiniForm(miniEmptyState)
                setIsMiniDialogOpen(true)
              }}
              className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
            >
              <Plus size={14} className="mr-1" />
              Log Mini Mock
            </Button>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Date</TableHead>
                <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Type</TableHead>
                <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light">Score / Band</TableHead>
                <TableHead className="text-xs text-slate-500 uppercase tracking-wider font-light text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {miniMocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-slate-500 font-light py-4">
                    No mini mocks logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                miniMocks.map((mini) => (
                  <TableRow key={mini.id} className="border-slate-200">
                    <TableCell className="text-sm text-slate-900 font-light">
                      {new Date(mini.date).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 font-light">{mini.type}</TableCell>
                    <TableCell className="text-sm text-slate-700 font-light">
                      {mini.type === "SJT" ? mini.band : mini.score}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {viewMode === "student" && (
                          <>
                            <button
                              onClick={() => {
                                setEditingMini(mini)
                                setMiniForm({
                                  date: mini.date,
                                  type: mini.type,
                                  score: mini.score ? String(mini.score) : "",
                                  band: mini.band || "",
                                })
                                setIsMiniDialogOpen(true)
                              }}
                              className="text-slate-500 hover:text-slate-800"
                              aria-label="Edit mini mock"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleMiniDelete(mini.id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Delete mini mock"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-200">Score Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis yAxisId="left" stroke="#94a3b8" style={{ fontSize: "12px" }} domain={[1800, 2700]} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" style={{ fontSize: "12px" }} domain={[600, 850]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0B1120",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalScore"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={{ fill: "#D4AF37", r: 4 }}
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

      {/* Data Table + Edit Dialog */}
      <Card className="bg-slate-900/50 border-slate-800 rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-light text-slate-200">Mock Exam History</CardTitle>
          {viewMode === "student" && mocks.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAllClick}
              className="border-red-400/50 text-red-400 hover:bg-red-950/30 hover:border-red-400 rounded-lg transition-all"
            >
              <Trash2 size={14} className="mr-2" />
              Clear All Mocks
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-sm font-light text-slate-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-light text-slate-400">Mock Name</th>
                  <th className="text-center py-3 px-4 text-sm font-light text-slate-400">VR</th>
                  <th className="text-center py-3 px-4 text-sm font-light text-slate-400">DM</th>
                  <th className="text-center py-3 px-4 text-sm font-light text-slate-400">QR</th>
                  <th className="text-center py-3 px-4 text-sm font-light text-slate-400 font-medium">Total Score</th>
                  <th className="text-center py-3 px-4 text-sm font-light text-slate-400">SJT Band</th>
                  {viewMode === "student" && (
                    <th className="text-center py-3 px-4 text-sm font-light text-slate-400">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {mocks.map((mock) => (
                  <tr key={mock.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {new Date(mock.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">{mock.provider}</td>
                    <td className="py-3 px-4 text-sm text-center text-slate-300">{mock.vr}</td>
                    <td className="py-3 px-4 text-sm text-center text-slate-300">{mock.dm}</td>
                    <td className="py-3 px-4 text-sm text-center text-slate-300">{mock.qr}</td>
                    <td className="py-3 px-4 text-sm text-center font-medium text-slate-900 bg-[#D4AF37]/20">
                      {mock.total}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-slate-300">{mock.sjt}</td>
                    {viewMode === "student" && (
                      <td className="py-3 px-4 text-sm text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => handleEditClick(mock)}
                            className="p-1 hover:bg-slate-700 rounded"
                          >
                            <Pencil size={14} className="text-slate-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(mock.id)}
                            className="p-1 hover:bg-slate-700 rounded"
                          >
                            <Trash2 size={14} className="text-red-400" />
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
      {viewMode === "student" && editingMock && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#0B1120] border-slate-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#D4AF37] font-serif">Edit Mock Exam Result</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date" className="text-slate-300">
                    Date
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-provider" className="text-slate-300">
                    Mock Provider
                  </Label>
                  <Input
                    id="edit-provider"
                    type="text"
                    value={editFormData.provider}
                    onChange={(e) => setEditFormData({ ...editFormData, provider: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vr" className="text-slate-300">
                    VR Score
                  </Label>
                  <Input
                    id="edit-vr"
                    type="number"
                    min="300"
                    max="900"
                    value={editFormData.vr}
                    onChange={(e) => setEditFormData({ ...editFormData, vr: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dm" className="text-slate-300">
                    DM Score
                  </Label>
                  <Input
                    id="edit-dm"
                    type="number"
                    min="300"
                    max="900"
                    value={editFormData.dm}
                    onChange={(e) => setEditFormData({ ...editFormData, dm: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-qr" className="text-slate-300">
                    QR Score
                  </Label>
                  <Input
                    id="edit-qr"
                    type="number"
                    min="300"
                    max="900"
                    value={editFormData.qr}
                    onChange={(e) => setEditFormData({ ...editFormData, qr: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-sjt" className="text-slate-300">
                  SJT Band
                </Label>
                <Select
                  value={editFormData.sjt}
                  onValueChange={(value) => setEditFormData({ ...editFormData, sjt: value })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
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
                  className="border-slate-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Clear All Mocks - First Confirmation */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-100 font-light flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Clear All Mock Exams?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-300 font-light">
              Are you sure you want to delete all {mocks.length} mock exam records? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg transition-all"
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
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-100 font-light flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Final Confirmation Required
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-300 font-light mb-2">
              <strong className="font-medium text-red-400">Warning:</strong> This will permanently delete all {mocks.length} mock exam records.
            </p>
            <p className="text-slate-400 text-sm font-light">
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
              className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg transition-all"
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
