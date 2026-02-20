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
  return (
    <div
      className={`
        bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800
        shadow-sm transition-all duration-200
        ${hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''}
        ${className}
      `}
    >
      {/* Header */}
      {(title || description) && (
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  )
}
