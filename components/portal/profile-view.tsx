import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { School, Phone, Shield } from "lucide-react"

interface ProfileViewProps {
  viewMode: "student" | "parent"
}

export function ProfileView({ viewMode }: ProfileViewProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-200 flex items-center gap-2">
            <School size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
            Academic Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">School Name</p>
            <p className="text-base text-slate-200 mt-1">Westminster Academy</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">GCSE Summary</p>
            <p className="text-base text-slate-200 mt-1">9 GCSEs - Grade 9-7 (including Maths, English, Sciences)</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-200 flex items-center gap-2">
            <Phone size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">Student Mobile</p>
            <p className="text-base text-slate-200 mt-1">+44 7700 900123</p>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-green-500" />
              <p className="text-xs text-green-400">Protected Information</p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Parent Mobile</p>
                <p className="text-base text-slate-200 mt-1">+44 7700 900456</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Parent Email</p>
                <p className="text-base text-slate-200 mt-1">parent.lewis@email.com</p>
              </div>
            </div>
            {viewMode === "student" && (
              <p className="text-xs text-slate-500 mt-3 italic">
                Parent contact information cannot be modified for security purposes
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-200">Target Universities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              "Imperial College London",
              "University of Cambridge",
              "University of Oxford",
              "King's College London",
              "University College London",
            ].map((uni, idx) => (
              <div key={idx} className="py-2 px-3 bg-slate-800/30 rounded border border-slate-800">
                <p className="text-sm text-slate-200">{uni}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
