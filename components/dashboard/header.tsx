"use client"

import { LogOut, Menu } from "lucide-react"
import type { ViewMode } from "@/app/portal/page"

interface HeaderProps {
  studentName: string
  viewMode: ViewMode
  isAdmin: boolean
  onViewModeChange: (mode: ViewMode) => void
  onLogout: () => void
  onMobileMenuToggle?: () => void
}

export function Header({ studentName, viewMode, isAdmin, onViewModeChange, onLogout, onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 md:py-4">
      <div className="flex justify-between items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        {/* Student Name - Responsive */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base md:text-xl font-light text-slate-900 truncate">
            <span className="hidden md:inline">{studentName} | </span>
            <span className="text-slate-600 font-normal">Status: Active Candidate</span>
          </h1>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-4">
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

        {/* Mobile Logout Button */}
        <button
          onClick={onLogout}
          className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      {viewMode === "parent" && (
        <div className="mt-3 px-3 md:px-4 py-2 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg">
          <p className="text-xs md:text-sm text-blue-700 font-light">Parent Observer Mode - Read Only</p>
        </div>
      )}

      {isAdmin && (
        <div className="mt-3 px-3 md:px-4 py-2 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-lg">
          <p className="text-xs md:text-sm text-amber-700 font-light">Admin Impersonation Mode - Viewing as: {studentName}</p>
        </div>
      )}
    </header>
  )
}

