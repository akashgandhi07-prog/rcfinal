import * as React from "react"
import { cn } from "@/lib/utils"

export interface MatteTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const MatteTextarea = React.forwardRef<HTMLTextAreaElement, MatteTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full bg-transparent border-0 border-b border-slate-300 rounded-none px-0 py-2 text-slate-900 font-light placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MatteTextarea.displayName = "MatteTextarea"

export { MatteTextarea }

