'use client'

import { ReactNode } from 'react'

interface PremiumCardProps {
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  hoverable?: boolean
  className?: string
}

export function PremiumCard({
  title,
  description,
  children,
  footer,
  hoverable = true,
  className = '',
}: PremiumCardProps) {
  // We extract any padding overrides from className to decide if we should apply default padding
  const hasPaddingOverride = className.includes('p-') || className.includes('px-') || className.includes('py-')
  const defaultPadding = hasPaddingOverride ? '' : 'px-6 py-5'

  return (
    <div
      className={`
        relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 
        rounded-xl shadow-sm transition-all duration-300 ease-out flex flex-col
        ${hoverable ? 'hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-slate-900/40 hover:-translate-y-0.5 hover:border-slate-300/80 dark:hover:border-slate-700/80' : ''}
        ${className}
      `}
    >
      {/* Subtle top highlight gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      {(title || description) && (
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-sm">
          {title && (
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 ${defaultPadding}`}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-md rounded-b-xl mt-auto">
          {footer}
        </div>
      )}
    </div>
  )
}
