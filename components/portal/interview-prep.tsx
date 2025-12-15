"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, FileText, Video } from "lucide-react"

interface InterviewPrepProps {
  viewMode: "student" | "parent"
}

export function InterviewPrep({ viewMode }: InterviewPrepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-slate-900 mb-2">Interview Preparation</h2>
        <p className="text-sm text-slate-500 font-light">MMI simulation and panel preparation resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
              Scheduled Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="pb-3 border-b border-slate-200">
                <p className="text-sm text-slate-900 font-light">MMI Simulation</p>
                    <p className="text-xs text-slate-600 mt-1 font-light">15 April 2026, 14:00</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 font-light">Panel Interview Prep</p>
                    <p className="text-xs text-slate-600 mt-1 font-light">22 April 2026, 16:00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
              <FileText size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
              Practice Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-slate-900 font-light">Medical Ethics Scenarios</p>
              <p className="text-sm text-slate-900 font-light">NHS Hot Topics Guide</p>
              <p className="text-sm text-slate-900 font-light">Personal Statement Review</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
              <Video size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
              Recorded Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-900 font-light">Access previous interview practice recordings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

