import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles with theme variables
          "flex h-10 w-full rounded-lg border px-3 py-2 text-base ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
Input.displayName = "Input"

export { Input }