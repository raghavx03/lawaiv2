'use client'

import { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: ReactNode
  children: ReactNode
}

const variantClasses = {
  primary:
    'relative group bg-black dark:bg-white text-white dark:text-black overflow-hidden shadow-md hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95',
  secondary:
    'relative group bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-sm hover:shadow',
  ghost:
    'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:scale-95',
  danger:
    'relative group bg-rose-600 text-white overflow-hidden shadow-md hover:shadow-xl hover:shadow-rose-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function PremiumButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  disabled,
  className,
  ...props
}: PremiumButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        transition-all duration-300 cubic-bezier(0.22, 1, 0.36, 1)
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className || ''}
      `}
      {...props}
    >

      {/* Glossy top highlight for primary/danger variants */}
      {(variant === 'primary' || variant === 'danger') && (
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {/* Internal content wrapper to stay above background effects */}
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
        {children}
      </span>
    </button>
  )
}
