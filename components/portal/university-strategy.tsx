"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface University {
  id: string
  name: string
  courseCode: string
  entranceReq: string
  ucatCutoff: string
}

interface UniversityStrategyProps {
  viewMode: "student" | "parent"
}

export function UniversityStrategy({ viewMode }: UniversityStrategyProps) {
  const [longlist, setLonglist] = useState<University[]>([
    {
      id: "1",
      name: "University of Edinburgh",
      courseCode: "A100",
      entranceReq: "AAA",
      ucatCutoff: "2600",
    },
    {
      id: "2",
      name: "University of Manchester",
      courseCode: "A100",
      entranceReq: "A*AA",
      ucatCutoff: "2700",
    },
    {
      id: "3",
      name: "King's College London",
      courseCode: "A100",
      entranceReq: "A*AA",
      ucatCutoff: "2800",
    },
  ])

  const [shortlist, setShortlist] = useState<University[]>([
    {
      id: "4",
      name: "University of Oxford",
      courseCode: "A100",
      entranceReq: "A*A*A",
      ucatCutoff: "2900",
    },
    {
      id: "5",
      name: "University of Cambridge",
      courseCode: "A100",
      entranceReq: "A*A*A",
      ucatCutoff: "2950",
    },
    {
      id: "6",
      name: "Imperial College London",
      courseCode: "A100",
      entranceReq: "A*AA",
      ucatCutoff: "2850",
    },
    {
      id: "7",
      name: "University College London",
      courseCode: "A100",
      entranceReq: "A*AA",
      ucatCutoff: "2800",
    },
  ])

  const [applied, setApplied] = useState<University[]>([])

  const moveToShortlist = (uni: University) => {
    if (shortlist.length >= 4) return
    setLonglist(longlist.filter((u) => u.id !== uni.id))
    setShortlist([...shortlist, uni])
  }

  const moveToApplied = (uni: University) => {
    setShortlist(shortlist.filter((u) => u.id !== uni.id))
    setApplied([...applied, uni])
  }

  const removeFromShortlist = (uni: University) => {
    setShortlist(shortlist.filter((u) => u.id !== uni.id))
    setLonglist([...longlist, uni])
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-slate-200 mb-2">University Application Strategy</h2>
        <p className="text-sm text-slate-400">Strategic shortlist limited to 4 universities (UCAS maximum)</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Longlist Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-light text-slate-400 uppercase tracking-wider">Longlist</h3>
            <span className="text-xs text-slate-500">{longlist.length}</span>
          </div>
          <div className="space-y-3 min-h-[400px]">
            {longlist.map((uni) => (
              <Card key={uni.id} className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-sm font-light text-slate-200">{uni.name}</h4>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>Course: {uni.courseCode}</p>
                    <p>Entry Req: {uni.entranceReq}</p>
                    <p>UCAT Cut-off: {uni.ucatCutoff}</p>
                  </div>
                  {viewMode === "student" && shortlist.length < 4 && (
                    <Button
                      size="sm"
                      onClick={() => moveToShortlist(uni)}
                      className="w-full mt-2 bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 text-xs"
                    >
                      Add to Shortlist
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Strategic Shortlist Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-light text-[#D4AF37] uppercase tracking-wider">Strategic Shortlist</h3>
            <span className="text-xs text-slate-500">
              {shortlist.length}/4
            </span>
          </div>
          <div className="space-y-3 min-h-[400px]">
            {shortlist.map((uni) => (
              <Card key={uni.id} className="bg-[#D4AF37]/10 border-[#D4AF37]/30">
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-sm font-light text-slate-200">{uni.name}</h4>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>Course: {uni.courseCode}</p>
                    <p>Entry Req: {uni.entranceReq}</p>
                    <p>UCAT Cut-off: {uni.ucatCutoff}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {viewMode === "student" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => moveToApplied(uni)}
                          className="flex-1 bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 text-xs"
                        >
                          Mark Applied
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromShortlist(uni)}
                          className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs"
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {shortlist.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-700 rounded-md">
                <p className="text-sm text-slate-500">No universities in shortlist</p>
              </div>
            )}
          </div>
        </div>

        {/* Applied Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-light text-slate-400 uppercase tracking-wider">Applied</h3>
            <span className="text-xs text-slate-500">{applied.length}</span>
          </div>
          <div className="space-y-3 min-h-[400px]">
            {applied.map((uni) => (
              <Card key={uni.id} className="bg-green-950/20 border-green-800/30">
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-sm font-light text-slate-200">{uni.name}</h4>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>Course: {uni.courseCode}</p>
                    <p>Entry Req: {uni.entranceReq}</p>
                    <p>UCAT Cut-off: {uni.ucatCutoff}</p>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-green-400 bg-green-950/30 px-2 py-1 rounded border border-green-800/30">
                      Application Submitted
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {applied.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-700 rounded-md">
                <p className="text-sm text-slate-500">No applications submitted</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

