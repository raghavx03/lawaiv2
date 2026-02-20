'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'emerald' | 'indigo'
}

export default function MetricsCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: MetricsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
  }

  const iconBgClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    emerald: 'bg-emerald-100',
    indigo: 'bg-indigo-100',
  }

  const isPositive = !trend.includes('-')

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all duration-300 hover:shadow-lg animate-slide-up ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600" />
        )}
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
        <span className="text-xs text-slate-500">from last period</span>
      </div>
    </div>
  )
}
