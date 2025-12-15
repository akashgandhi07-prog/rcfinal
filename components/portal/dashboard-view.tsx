import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Calendar, Award } from "lucide-react"

interface DashboardViewProps {
  viewMode: "student" | "parent"
}

export function DashboardView({ viewMode }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-light text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
              Latest UCAT Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-light text-slate-900">3020</div>
            <p className="text-sm text-green-600 mt-2 font-light">+120 from previous</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-light text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Target size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
              Target Universities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-light text-slate-900">8</div>
            <p className="text-sm text-slate-500 mt-2 font-light">Shortlisted institutions</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-light text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
              Next Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light text-slate-900">UCAT Exam</div>
                <p className="text-sm text-slate-500 mt-2 font-light">15th June 2026</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-light text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Award size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
              Portfolio Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-light text-slate-900">12</div>
            <p className="text-sm text-slate-500 mt-2 font-light">Verified experiences</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Logged Mock UCAT", detail: "Official UCAT - Score: 3020", time: "2 hours ago" },
              { action: "Added Work Experience", detail: "Royal London Hospital shadowing", time: "1 day ago" },
              { action: "Updated Personal Statement", detail: "Draft revision 3", time: "3 days ago" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                <div>
                  <p className="text-sm text-slate-900 font-light">{item.action}</p>
                  <p className="text-xs text-slate-600 mt-1 font-light">{item.detail}</p>
                </div>
                <span className="text-xs text-slate-500 font-light">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
