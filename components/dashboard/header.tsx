"use client"

import { LogOut } from "lucide-react"
import type { ViewMode } from "@/app/portal/page"

interface HeaderProps {
  studentName: string
  viewMode: ViewMode
  isAdmin: boolean
  onViewModeChange: (mode: ViewMode) => void
  onLogout: () => void
}

export function Header({ studentName, viewMode, isAdmin, onViewModeChange, onLogout }: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-8 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-light text-slate-900">
            {studentName} | <span className="text-slate-600 font-normal">Status: Active Candidate</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 font-light">View as:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onViewModeChange("student")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors font-light ${
                viewMode === "student"
                  ? "bg-[#D4AF37] text-slate-950"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => onViewModeChange("parent")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors font-light ${
                viewMode === "parent"
                  ? "bg-[#D4AF37] text-slate-950"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Parent
            </button>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-light"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {viewMode === "parent" && (
        <div className="mt-3 px-4 py-2 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 font-light">Parent Observer Mode - Read Only</p>
        </div>
      )}

      {isAdmin && (
        <div className="mt-3 px-4 py-2 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700 font-light">Admin Impersonation Mode - Viewing as: {studentName}</p>
        </div>
      )}
    </header>
  )
}

