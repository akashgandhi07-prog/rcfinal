"use client"

import { Button } from "@/components/ui/button"
import { User, X, Eye } from "lucide-react"
import type { User as UserType } from "@/lib/supabase/types"

interface AdminImpersonationBarProps {
  impersonatedUser: UserType
  adminUser: UserType
  onExit: () => void
  onSwitch?: () => void
}

export function AdminImpersonationBar({
  impersonatedUser,
  adminUser,
  onExit,
  onSwitch,
}: AdminImpersonationBarProps) {
  return (
    <div className="bg-amber-100 border-b border-amber-300 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye size={18} className="text-amber-800" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-amber-900">
              Viewing as:
            </span>
            <div className="flex items-center gap-2 px-2 py-1 bg-white rounded border border-amber-300">
              <User size={14} className="text-amber-700" />
              <span className="text-sm text-amber-900 font-medium">
                {impersonatedUser.full_name || impersonatedUser.email}
              </span>
              <span className="text-xs text-amber-700 font-light">
                ({impersonatedUser.role})
              </span>
            </div>
            <span className="text-sm text-amber-800 font-light">|</span>
            <span className="text-xs text-amber-800 font-light">
              Your Admin Account: {adminUser.email}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onSwitch && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitch}
              className="rounded-lg border-amber-300 text-amber-900 hover:bg-amber-200 text-xs"
            >
              Switch User
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="rounded-lg border-amber-300 text-amber-900 hover:bg-amber-200 text-xs"
          >
            <X size={14} className="mr-1" />
            Exit Impersonation
          </Button>
        </div>
      </div>
    </div>
  )
}

