"use client"

import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react"
import { SaveStatus } from "@/lib/hooks/use-auto-save"
import { cn } from "@/lib/utils"

interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved?: Date | null
  className?: string
}

export function SaveStatusIndicator({ status, lastSaved, className }: SaveStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          className: 'text-amber-600',
          iconClassName: 'animate-spin',
        }
      case 'saved':
        return {
          icon: CheckCircle2,
          text: 'Saved',
          className: 'text-green-600',
          iconClassName: '',
        }
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Error saving',
          className: 'text-red-600',
          iconClassName: '',
        }
      default:
        return {
          icon: Clock,
          text: lastSaved ? `Saved ${formatLastSaved(lastSaved)}` : 'Not saved',
          className: 'text-slate-500',
          iconClassName: '',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={cn("flex items-center gap-2 text-xs font-light", className)}>
      <Icon className={cn("h-3 w-3", config.iconClassName)} />
      <span className={config.className}>{config.text}</span>
    </div>
  )
}

function formatLastSaved(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)

  if (diffSecs < 10) return 'just now'
  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

