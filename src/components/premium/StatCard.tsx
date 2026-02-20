'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  icon?: ReactNode
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue'
  loading?: boolean
}

const colorClasses = {
  indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
  blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
}

export function StatCard({
  label,
  value,
  trend,
  icon,
  color = 'indigo',
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700">
      {/* Icon */}
      {icon && (
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
      )}

      {/* Label */}
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
        {label}
      </p>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {loading ? '...' : value}
        </p>
      </div>

      {/* Trend */}
      {trend && !loading && (
        <div className="flex items-center gap-1">
          {trend.isPositive ? (
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          )}
          <span
            className={`text-sm font-medium ${
              trend.isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.isPositive ? '+' : '-'}
            {Math.abs(trend.value)}%
          </span>
          {trend.label && (
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
