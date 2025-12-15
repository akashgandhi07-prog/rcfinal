"use client"

import type React from "react"

import { useState } from "react"
import { Plus, TrendingUp, Award, ClipboardList, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts"

interface UCATMock {
  id: string
  date: string
  provider: string
  vr: number
  dm: number
  qr: number
  ar: number
  sjt: string
  total: number
}

interface UCATTrackerProps {
  viewMode: "student" | "parent"
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B1120] border border-slate-700 rounded-none px-4 py-3 shadow-lg">
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

export function UCATTracker({ viewMode }: UCATTrackerProps) {
  const [mocks, setMocks] = useState<UCATMock[]>([
    {
      id: "1",
      date: "2026-01-15",
      provider: "Medify Mock 1",
      vr: 680,
      dm: 720,
      qr: 690,
      ar: 710,
      sjt: "Band 1",
      total: 2800,
    },
    {
      id: "2",
      date: "2026-01-22",
      provider: "Official Mock A",
      vr: 710,
      dm: 730,
      qr: 720,
      ar: 740,
      sjt: "Band 1",
      total: 2900,
    },
    {
      id: "3",
      date: "2026-02-05",
      provider: "Medify Mock 2",
      vr: 720,
      dm: 750,
      qr: 730,
      ar: 760,
      sjt: "Band 1",
      total: 2960,
    },
    {
      id: "4",
      date: "2026-02-12",
      provider: "Official Mock B",
      vr: 740,
      dm: 760,
      qr: 750,
      ar: 770,
      sjt: "Band 1",
      total: 3020,
    },
    {
      id: "5",
      date: "2026-02-19",
      provider: "Medify Mock 3",
      vr: 750,
      dm: 770,
      qr: 760,
      ar: 780,
      sjt: "Band 1",
      total: 3060,
    },
    {
      id: "6",
      date: "2026-02-26",
      provider: "Official Mock C",
      vr: 760,
      dm: 780,
      qr: 770,
      ar: 790,
      sjt: "Band 1",
      total: 3100,
    },
    {
      id: "7",
      date: "2026-03-05",
      provider: "Medify Mock 4",
      vr: 770,
      dm: 790,
      qr: 780,
      ar: 800,
      sjt: "Band 1",
      total: 3140,
    },
    {
      id: "8",
      date: "2026-03-12",
      provider: "Official Mock D",
      vr: 780,
      dm: 800,
      qr: 790,
      ar: 810,
      sjt: "Band 1",
      total: 3180,
    },
    {
      id: "9",
      date: "2026-03-19",
      provider: "Medify Mock 5",
      vr: 790,
      dm: 810,
      qr: 800,
      ar: 820,
      sjt: "Band 1",
      total: 3220,
    },
    {
      id: "10",
      date: "2026-03-26",
      provider: "Official Mock E",
      vr: 800,
      dm: 820,
      qr: 810,
      ar: 830,
      sjt: "Band 1",
      total: 3260,
    },
    {
      id: "11",
      date: "2026-04-02",
      provider: "Medify Mock 6",
      vr: 810,
      dm: 830,
      qr: 820,
      ar: 840,
      sjt: "Band 1",
      total: 3300,
    },
    {
      id: "12",
      date: "2026-04-09",
      provider: "Official Mock F",
      vr: 820,
      dm: 840,
      qr: 830,
      ar: 850,
      sjt: "Band 1",
      total: 3340,
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    provider: "",
    vr: "",
    dm: "",
    qr: "",
    ar: "",
    sjt: "",
  })

  const highestScore = Math.max(...mocks.map((m) => m.total))
  const averageBand = "Band 1"
  const mocksCompleted = mocks.length

  const chartData = mocks.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    totalScore: m.total,
    averageSubtest: Math.round((m.vr + m.dm + m.qr + m.ar) / 4),
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = Number(formData.vr) + Number(formData.dm) + Number(formData.qr) + Number(formData.ar)

    const newMock: UCATMock = {
      id: Date.now().toString(),
      date: formData.date,
      provider: formData.provider,
      vr: Number(formData.vr),
      dm: Number(formData.dm),
      qr: Number(formData.qr),
      ar: Number(formData.ar),
      sjt: formData.sjt,
      total,
    }

    setMocks([...mocks, newMock])
    setIsDialogOpen(false)
    setFormData({ date: "", provider: "", vr: "", dm: "", qr: "", ar: "", sjt: "" })
  }

  const handleDelete = (id: string) => {
    setMocks(mocks.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Action Area */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-light text-slate-900">Performance Analytics</h2>
          <p className="text-sm text-slate-600 mt-1 font-light">Track your UCAT mock exam progress</p>
        </div>

        {viewMode === "student" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-none font-light">
                <Plus size={16} className="mr-2" />
                Log New Mock Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 max-w-2xl rounded-none">
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
                      className="bg-white border-slate-300 text-slate-900 rounded-none"
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
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900 rounded-none">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300 rounded-none">
                        <SelectItem value="Medify">Medify</SelectItem>
                        <SelectItem value="MedEntry">MedEntry</SelectItem>
                        <SelectItem value="Official">Official UCAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
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
                      className="bg-white border-slate-300 text-slate-900 rounded-none"
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
                      className="bg-white border-slate-300 text-slate-900 rounded-none"
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
                      className="bg-white border-slate-300 text-slate-900 rounded-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ar" className="text-slate-700 font-light">
                      AR Score
                    </Label>
                    <Input
                      id="ar"
                      type="number"
                      min="300"
                      max="900"
                      value={formData.ar}
                      onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
                      className="bg-white border-slate-300 text-slate-900 rounded-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sjt" className="text-slate-700 font-light">
                    SJT Band
                  </Label>
                  <Select value={formData.sjt} onValueChange={(value) => setFormData({ ...formData, sjt: value })}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 rounded-none">
                      <SelectValue placeholder="Select band" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-300 rounded-none">
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
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-300 rounded-none"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-none font-light">
                    Save Mock Exam
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-light text-slate-500">Highest Total Score</CardTitle>
            <TrendingUp size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-slate-900">{highestScore}</div>
            <p className="text-xs text-slate-600 mt-1 font-light">Peak performance</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-light text-slate-500">Average Band</CardTitle>
            <Award size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-slate-900">{averageBand}</div>
            <p className="text-xs text-slate-600 mt-1 font-light">SJT Performance</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-none">
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
      <Card className="bg-white border-slate-200 rounded-none">
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
                domain={[2400, 3400]}
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

      {/* Data Table */}
      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg font-light text-slate-900">Mock Exam History</CardTitle>
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
                  {viewMode === "student" && (
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
                    {viewMode === "student" && (
                      <td className="py-3 px-4 text-sm text-center">
                        <div className="flex gap-2 justify-center">
                          <button className="p-1 hover:bg-slate-200 rounded-none">
                            <Pencil size={14} className="text-slate-500" />
                          </button>
                          <button onClick={() => handleDelete(mock.id)} className="p-1 hover:bg-slate-200 rounded-none">
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
    </div>
  )
}

