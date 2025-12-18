"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { getUniversitiesByCourse, type University } from "@/lib/universities"
import type { User } from "@/lib/supabase/types"

interface StrategyKanbanProps {
  viewMode: "student" | "parent" | "mentor"
  userData?: User | null
}

export function StrategyKanban({ viewMode, userData }: StrategyKanbanProps) {
  const [shortlist, setShortlist] = useState<University[]>([])
  const [applied, setApplied] = useState<University[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState<string>("")

  // Get available universities based on student's target course
  const availableUniversities = getUniversitiesByCourse(userData?.target_course || null)
  
  // Filter out universities already in shortlist or applied
  const availableToAdd = availableUniversities.filter(
    (uni) => !shortlist.some((s) => s.id === uni.id) && !applied.some((a) => a.id === uni.id)
  )

  const handleAddToShortlist = () => {
    if (!selectedUniversity || shortlist.length >= 4) return

    const university = availableUniversities.find((u) => u.id === selectedUniversity)
    if (university) {
      setShortlist([...shortlist, university])
      setSelectedUniversity("")
    }
  }

  const moveToApplied = (uni: University) => {
    if (viewMode === "parent") {
      // Parents can edit universities
      setShortlist(shortlist.filter((u) => u.id !== uni.id))
      setApplied([...applied, uni])
    } else if (viewMode === "student") {
      setShortlist(shortlist.filter((u) => u.id !== uni.id))
      setApplied([...applied, uni])
    }
  }

  const removeFromShortlist = (uni: University) => {
    if (viewMode === "parent" || viewMode === "student") {
      setShortlist(shortlist.filter((u) => u.id !== uni.id))
    }
  }

  const removeFromApplied = (uni: University) => {
    if (viewMode === "parent" || viewMode === "student") {
      setApplied(applied.filter((u) => u.id !== uni.id))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-slate-900 mb-2">University Application Strategy</h2>
        <p className="text-sm text-slate-500 font-light">
          Strategic shortlist limited to 4 universities (UCAS maximum) for {userData?.target_course || "medicine"}
        </p>
      </div>

      {/* Add University Dropdown - Allow both students and parents to edit universities */}
      {(viewMode === "student" || viewMode === "parent") && shortlist.length < 4 && (
        <Card className="bg-white border-slate-200 rounded-lg">
          <CardContent className="p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-slate-500 uppercase tracking-wider font-light mb-2 block">
                  Add University
                </label>
                <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select a university..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg max-h-[300px]">
                    {availableToAdd.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No universities available to add
                      </SelectItem>
                    ) : (
                      availableToAdd.map((uni) => (
                        <SelectItem key={uni.id} value={uni.id}>
                          {uni.name} ({uni.courseCode}) - {uni.entranceReq}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddToShortlist}
                disabled={!selectedUniversity || shortlist.length >= 4}
                className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light"
              >
                <Plus size={16} className="mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategic Shortlist Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-light text-[#D4AF37] uppercase tracking-wider">Strategic Shortlist</h3>
            <span className="text-xs text-slate-400 font-light">
              {shortlist.length}/4
            </span>
          </div>
          <div className="space-y-3 min-h-[400px] bg-slate-50 p-4 border border-slate-200 rounded-lg">
            {shortlist.map((uni) => (
              <Card key={uni.id} className="bg-[#D4AF37]/10 border-[#D4AF37]/30 rounded-lg">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900 mb-1">{uni.name}</h4>
                      <div className="space-y-1 text-xs text-slate-600 font-light">
                        <p>Course: {uni.courseCode}</p>
                        <p>Entry Requirement: {uni.entranceReq}</p>
                      </div>
                    </div>
                    {(viewMode === "student" || viewMode === "parent") && (
                      <button
                        onClick={() => removeFromShortlist(uni)}
                        className="ml-2 p-1 hover:bg-[#D4AF37]/20 rounded transition-colors"
                      >
                        <X size={16} className="text-slate-600" />
                      </button>
                    )}
                  </div>
                  {(viewMode === "student" || viewMode === "parent") && (
                    <Button
                      size="sm"
                      onClick={() => moveToApplied(uni)}
                      className="w-full bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 text-xs rounded-lg font-light"
                    >
                      Mark Applied
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {shortlist.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-300 rounded-lg">
                <p className="text-sm text-slate-400 font-light">No universities in shortlist</p>
              </div>
            )}
          </div>
        </div>

        {/* Applied Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-light text-slate-500 uppercase tracking-wider">Applied</h3>
            <span className="text-xs text-slate-400 font-light">{applied.length}</span>
          </div>
          <div className="space-y-3 min-h-[400px] bg-slate-50 p-4 border border-slate-200 rounded-lg">
            {applied.map((uni) => (
              <Card key={uni.id} className="bg-green-50 border-green-200 rounded-lg">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900 mb-1">{uni.name}</h4>
                      <div className="space-y-1 text-xs text-slate-600 font-light">
                        <p>Course: {uni.courseCode}</p>
                        <p>Entry Requirement: {uni.entranceReq}</p>
                      </div>
                    </div>
                    {(viewMode === "student" || viewMode === "parent") && (
                      <button
                        onClick={() => removeFromApplied(uni)}
                        className="ml-2 p-1 hover:bg-green-100 rounded transition-colors"
                      >
                        <X size={16} className="text-slate-600" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 border border-green-200 rounded-lg font-light uppercase tracking-wider">
                      Application Submitted
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {applied.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-300 rounded-lg">
                <p className="text-sm text-slate-400 font-light">No applications submitted</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
