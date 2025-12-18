"use client"

import { LayoutDashboard, Brain, Briefcase, Target, Settings, User, MessageSquare, MessageCircle, Shield, X, BookOpen } from "lucide-react"
import type { ActiveView, ViewMode } from "@/app/portal/page"

interface SidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  viewMode: ViewMode
  showUCAT?: boolean
  isAdmin?: boolean
  isSuperAdmin?: boolean
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ activeView, onViewChange, viewMode, showUCAT = true, isAdmin = false, isSuperAdmin = false, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as ActiveView, icon: LayoutDashboard, label: "Overview" },
    { id: "profile" as ActiveView, icon: User, label: "My Profile" },
    { id: "portfolio" as ActiveView, icon: Briefcase, label: "Portfolio" },
    ...(showUCAT ? [{ id: "ucat" as ActiveView, icon: Brain, label: "UCAT Performance" }] : []),
    { id: "strategy" as ActiveView, icon: Target, label: "University Strategy" },
    { id: "interview" as ActiveView, icon: MessageSquare, label: "Interview Prep" },
    { id: "messages" as ActiveView, icon: MessageCircle, label: "Messages" },
    { id: "resources" as ActiveView, icon: BookOpen, label: "Resource Library" },
    { id: "settings" as ActiveView, icon: Settings, label: "Settings" },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[85vw] sm:w-64 bg-[#0B1120] border-r border-slate-800/50 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800/50">
          <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-widest">REGENT&apos;S</h1>
          <button
            onClick={onMobileClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors touch-manipulation"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Logo - Desktop */}
        <div className="hidden md:block p-6 border-b border-slate-800/50">
          <h1 className="text-2xl font-serif text-[#D4AF37] tracking-widest">REGENT&apos;S</h1>
          <p className="text-xs text-slate-400 mt-1 font-light">Private Client Portal</p>
        </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id)
                onMobileClose?.()
              }}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-none transition-colors min-h-[44px] touch-manipulation ${
                isActive
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
                  : "text-slate-300 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-sm sm:text-base font-light">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Admin Section */}
      {(isAdmin || isSuperAdmin) && (
        <div className="p-3 sm:p-4 border-t border-slate-800/50 mt-auto">
          <button
            onClick={() => {
              onViewChange("admin")
              onMobileClose?.()
            }}
            className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-none transition-colors min-h-[44px] touch-manipulation ${
              activeView === "admin"
                ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
                : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
            }`}
          >
            <Shield size={20} strokeWidth={1.5} />
            <span className="text-xs sm:text-sm font-light uppercase tracking-wider">
              {isSuperAdmin ? "Super Admin" : "Consultant Access"}
            </span>
          </button>
        </div>
      )}

      {/* User Profile */}
      <div className="p-3 sm:p-4 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-3 sm:px-4 py-3 bg-white/5 backdrop-blur-sm rounded-none border border-white/10">
          <div className="w-10 h-10 rounded-none bg-slate-700/50 flex items-center justify-center border border-slate-600/50 flex-shrink-0">
            <User size={20} className="text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-light text-slate-200 truncate">{/* user name handled in header */}</p>
            <p className="text-xs text-slate-400 capitalize font-light truncate">{isAdmin ? "admin" : viewMode}</p>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}

