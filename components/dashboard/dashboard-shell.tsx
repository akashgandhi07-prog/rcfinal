"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import type { ViewMode, ActiveView } from "@/app/portal/page"

interface DashboardShellProps {
  children: React.ReactNode
  studentName: string
  courseLabel?: string
  viewMode: ViewMode
  isAdmin: boolean
  isSuperAdmin?: boolean
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  onViewModeChange: (mode: ViewMode) => void
  onLogout: () => void
}

export function DashboardShell({
  children,
  studentName,
  courseLabel,
  viewMode,
  isAdmin,
  isSuperAdmin = false,
  activeView,
  onViewChange,
  onViewModeChange,
  onLogout,
  showUCAT = true,
}: DashboardShellProps & { showUCAT?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#0B1120]">
      <Sidebar 
        activeView={activeView} 
        onViewChange={onViewChange} 
        viewMode={viewMode} 
        showUCAT={showUCAT} 
        isAdmin={isAdmin}
        isSuperAdmin={isSuperAdmin}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <Header
          studentName={studentName}
          courseLabel={courseLabel}
          viewMode={viewMode}
          isAdmin={isAdmin}
          onViewModeChange={onViewModeChange}
          onLogout={onLogout}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Main Content Area - Light background for readability */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8">{children}</div>
        </div>
      </main>
    </div>
  )
}

