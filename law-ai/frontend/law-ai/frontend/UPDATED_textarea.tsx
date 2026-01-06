import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styles with theme variables
          "flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Theme-aware styling using CSS variables
          "bg-[var(--theme-input-bg)] border-[var(--theme-input-border)]",
          "text-[var(--theme-input-text)] placeholder:text-[var(--theme-input-placeholder)]",
          // Focus states
          "focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800",
          className
        )}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'textfield',
          appearance: 'none',
          borderRadius: '8px',
          ...props.style
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }