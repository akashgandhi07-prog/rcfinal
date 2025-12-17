"use client"

import { LogOut, Menu } from "lucide-react"
import type { ViewMode } from "@/app/portal/page"

interface HeaderProps {
  studentName: string
  courseLabel?: string
  viewMode: ViewMode
  isAdmin: boolean
  onLogout: () => void
  onMobileMenuToggle?: () => void
}

export function Header({ studentName, courseLabel, viewMode, isAdmin, onLogout, onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 md:py-4">
      <div className="flex justify-between items-center gap-3 sm:gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        {/* Student Name - Responsive */}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm sm:text-base md:text-xl font-light text-slate-900 truncate">
            <span className="hidden md:inline">{studentName} | </span>
            <span className="text-slate-600 font-normal capitalize">{viewMode}</span>
            {courseLabel && (
              <span className="hidden sm:inline text-slate-500 font-normal"> · {courseLabel}</span>
            )}
          </h1>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-light min-h-[44px] touch-manipulation"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Mobile Logout Button */}
        <button
          onClick={onLogout}
          className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="mt-2 sm:mt-3 px-3 md:px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
        <p className="text-xs sm:text-sm text-slate-700 font-light">
          Role: <span className="font-medium capitalize">{viewMode}</span>
          {isAdmin && <span className="hidden sm:inline"> (Admin privileges)</span>}
        </p>
      </div>
    </header>
  )
}

