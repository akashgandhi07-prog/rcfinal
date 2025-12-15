"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, GraduationCap, Shield } from "lucide-react"

interface MyProfileProps {
  viewMode: "student" | "parent"
}

export function MyProfile({ viewMode }: MyProfileProps) {
  return (
    <div className="space-y-6">
      {/* Personal Details Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
            <User size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">Name</p>
              <p className="text-sm text-slate-900 font-light">Ella Lewis</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">Date of Birth</p>
              <p className="text-sm text-slate-900 font-light">15 March 2007</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">Email</p>
              <p className="text-sm text-slate-900 font-light">ella.lewis@example.com</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">Parent Name</p>
              <p className="text-sm text-slate-900 font-light">Sarah Lewis</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">Parent Phone (WhatsApp)</p>
              <p className="text-sm text-slate-900 font-light">+44 7700 900456</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">Home Address</p>
              <p className="text-sm text-slate-900 font-light">24 Kensington Gardens, London, W8 4RT</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Profile Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
            <GraduationCap size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
            Academic Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">School Name</p>
            <p className="text-sm text-slate-900 font-light">Westminster Academy</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">GCSE Summary</p>
            <p className="text-sm text-slate-900 font-light">9 GCSEs - Grade 9-7 (including Maths, English, Sciences)</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">A-Level Predictions</p>
            <p className="text-sm text-slate-900 font-light">A*A*A (Biology, Chemistry, Mathematics)</p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Status Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
            <Shield size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
            Admin Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">Consultant Assigned</p>
                  <p className="text-sm text-slate-900 font-light">Dr Sonal Tanna</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-light mb-1">Contract Status</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-light bg-green-100 text-green-800 border border-green-200">
              Active
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

