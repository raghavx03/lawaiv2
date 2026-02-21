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
    <div className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out hover:shadow-slate-200/40 dark:hover:shadow-slate-900/40 hover:border-slate-300/80 dark:hover:border-slate-700/80 flex flex-col group">
      {/* Subtle highlight gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent pointer-events-none" />

      {/* Header/Label area */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
        </div>
        {icon && (
          <div className={`w-10 h-10 ${colorClasses[color]} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-3 mt-auto">
        {loading ? (
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </p>
        )}
      </div>

      {/* Trend */}
      {trend && !loading && (
        <div className="flex items-center gap-1.5 mt-1">
          <div className={`flex items-center justify-center p-0.5 rounded-full ${trend.isPositive ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/20'}`}>
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <span
            className={`text-sm font-semibold ${trend.isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
              }`}
          >
            {trend.isPositive ? '+' : '-'}
            {Math.abs(trend.value)}%
          </span>
          {trend.label && (
            <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
