"use client"

import { LayoutDashboard, Brain, Briefcase, Target, Settings, User, MessageSquare, Shield } from "lucide-react"

type ActiveView = "dashboard" | "profile" | "portfolio" | "ucat" | "strategy" | "interview" | "settings" | "admin"
type ViewMode = "student" | "parent"

interface SidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  viewMode: ViewMode
}

export function Sidebar({ activeView, onViewChange, viewMode }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as ActiveView, icon: LayoutDashboard, label: "Overview" },
    { id: "profile" as ActiveView, icon: User, label: "My Profile" },
    { id: "portfolio" as ActiveView, icon: Briefcase, label: "Portfolio" },
    { id: "ucat" as ActiveView, icon: Brain, label: "UCAT Performance" },
    { id: "strategy" as ActiveView, icon: Target, label: "University Strategy" },
    { id: "interview" as ActiveView, icon: MessageSquare, label: "Interview Prep" },
    { id: "settings" as ActiveView, icon: Settings, label: "Settings" },
  ]

  return (
    <aside className="w-64 bg-[#0B1120] border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-serif text-[#D4AF37] tracking-widest">REGENT'S</h1>
        <p className="text-xs text-slate-400 mt-1">Private Client Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-sm font-light">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Admin Section */}
      <div className="p-4 border-t border-slate-800 mt-auto">
        <button
          onClick={() => onViewChange("admin")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
            activeView === "admin"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
              : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
          }`}
        >
          <Shield size={20} strokeWidth={1.5} />
          <span className="text-xs font-light uppercase tracking-wider">Consultant Access</span>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-md">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
            <User size={20} className="text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200">Ella Lewis</p>
            <p className="text-xs text-slate-400 capitalize">{viewMode}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
