"use client"

import { LogOut, Menu } from "lucide-react"
import type { ViewMode } from "@/app/portal/page"
import { NotificationBell } from "@/components/portal/notification-bell"
import { getCurrentUser } from "@/lib/supabase/queries"
import { useEffect, useState } from "react"

interface HeaderProps {
  studentName: string
  courseLabel?: string
  viewMode: ViewMode
  isAdmin: boolean
  onViewModeChange?: (mode: ViewMode) => void
  onLogout: () => void
  onMobileMenuToggle?: () => void
  userId?: string
}

export function Header({ studentName, courseLabel, viewMode, isAdmin, onViewModeChange, onLogout, onMobileMenuToggle, userId }: HeaderProps) {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId)

  useEffect(() => {
    if (!userId) {
      getCurrentUser().then(user => {
        if (user) setCurrentUserId(user.id)
      })
    }
  }, [userId])

  return (
    <header className="bg-white/98 backdrop-blur-lg border-b border-slate-200/80 shadow-sm px-4 md:px-8 py-4 md:py-5">
      <div className="flex justify-between items-center gap-3 sm:gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-[#D4AF37] hover:bg-slate-50 rounded-lg transition-all touch-manipulation"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        {/* Student Name - Premium styling */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg md:text-2xl font-serif text-slate-900 truncate">
            <span className="hidden md:inline text-[#D4AF37]">{studentName}</span>
            <span className="md:hidden">{studentName.split(' ')[0]}</span>
            <span className="hidden md:inline text-slate-400 mx-2">|</span>
            <span className="text-slate-600 font-light capitalize text-sm md:text-base">
              {isAdmin ? "admin" : viewMode}
            </span>
            {courseLabel && (
              <span className="hidden sm:inline text-slate-500 font-light ml-2 text-sm md:text-base">· {courseLabel}</span>
            )}
          </h1>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAdmin && (
            <span className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
              Admin
            </span>
          )}
          <NotificationBell userId={currentUserId} />
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-light min-h-[44px] touch-manipulation border border-slate-200 hover:border-slate-300"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-2">
          <NotificationBell userId={currentUserId} />
          <button
            onClick={onLogout}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-[#D4AF37] hover:bg-slate-50 rounded-lg transition-all touch-manipulation"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="mt-3 px-4 md:px-5 py-2.5 bg-gradient-to-r from-slate-50 to-white border border-slate-200/60 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs sm:text-sm text-slate-600 font-light">
            Role: <span className="font-medium text-slate-900 capitalize">{isAdmin ? "admin" : viewMode}</span>
          </p>
          {isAdmin && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-xs sm:text-sm text-purple-600 font-medium">Full Administrative Access</span>
            </>
          )}
          {courseLabel && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-xs sm:text-sm text-slate-500 font-light">{courseLabel}</span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

