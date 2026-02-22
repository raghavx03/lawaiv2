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
        relative overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 
        rounded-2xl shadow-sm transition-all duration-500 cubic-bezier(0.22, 1, 0.36, 1) flex flex-col group
        ${hoverable ? 'hover:shadow-2xl hover:shadow-slate-300/30 dark:hover:shadow-black/40 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700/80' : ''}
        ${className}
      `}
    >
      {/* Subtle top highlight gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Animated hover glow overlay */}
      {hoverable && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}

      {/* Header */}
      {(title || description) && (
        <div className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-800/10 backdrop-blur-md relative z-10">
          {title && (
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors">
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
      <div className={`flex-1 relative z-10 ${defaultPadding}`}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-b-2xl mt-auto relative z-10">
          {footer}
        </div>
      )}
    </div>
  )
}
