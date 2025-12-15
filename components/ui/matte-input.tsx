import * as React from "react"
import { cn } from "@/lib/utils"

export interface MatteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const MatteInput = React.forwardRef<HTMLInputElement, MatteInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full bg-transparent border-0 border-b border-slate-300 rounded-none px-0 py-2 text-slate-900 font-light placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MatteInput.displayName = "MatteInput"

export { MatteInput }

