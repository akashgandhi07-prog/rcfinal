"use client"

import { Undo2, Redo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UndoRedoButtonsProps {
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  className?: string
}

export function UndoRedoButtons({ onUndo, onRedo, canUndo, canRedo, className }: UndoRedoButtonsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-8 w-8 p-0"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className={cn("h-4 w-4", !canUndo && "text-slate-300")} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="h-8 w-8 p-0"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className={cn("h-4 w-4", !canRedo && "text-slate-300")} />
      </Button>
    </div>
  )
}

