'use client'

import { useEffect, useState } from 'react'
import { PremiumCard } from '@/components/premium'
import { TrendingUp, Users, CheckCircle, CreditCard } from 'lucide-react'

interface FunnelData {
  visitors: number
  signups: number
  proTrials: number
  proSubscribers: number
}

interface FunnelStage {
  name: string
  count: number
  percentage: number
  icon: React.ReactNode
  color: string
}

export default function ConversionFunnel() {
  const [data, setData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/analytics')
        if (response.ok) {
          const metrics = await response.json()
          // Mock funnel data based on metrics
          setData({
            visitors: Math.floor(metrics.activeUsers * 50),
            signups: metrics.activeUsers,
            proTrials: Math.floor(metrics.activeUsers * 0.3),
            proSubscribers: Math.floor(metrics.activeUsers * 0.12),
          })
        }
      } catch (error) {
        console.error('Error fetching funnel data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || !data) {
    return (
      <PremiumCard title="Conversion Funnel" hoverable>
        <div className="h-64 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
      </PremiumCard>
    )
  }

  const stages: FunnelStage[] = [
    {
      name: 'Visitors',
      count: data.visitors,
      percentage: 100,
      icon: <Users className="h-5 w-5" />,
      color: 'indigo',
    },
    {
      name: 'Signups',
      count: data.signups,
      percentage: (data.signups / data.visitors) * 100,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'blue',
    },
    {
      name: 'Pro Trials',
      count: data.proTrials,
      percentage: (data.proTrials / data.visitors) * 100,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'amber',
    },
    {
      name: 'Pro Subscribers',
      count: data.proSubscribers,
      percentage: (data.proSubscribers / data.visitors) * 100,
      icon: <CreditCard className="h-5 w-5" />,
      color: 'emerald',
    },
  ]

  const colorMap = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  }

  return (
    <PremiumCard title="Conversion Funnel" hoverable>
      <div className="space-y-6">
        {stages.map((stage, index) => {
          const conversionRate = index === 0 ? 100 : (stage.percentage / 100) * 100
          const dropoff = index === 0 ? 0 : 100 - conversionRate

          return (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorMap[stage.color as keyof typeof colorMap]}`}>
                    {stage.icon}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{stage.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {stage.count.toLocaleString()} users
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">{stage.percentage.toFixed(1)}%</p>
                  {index > 0 && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      {dropoff.toFixed(1)}% drop
                    </p>
                  )}
                </div>
              </div>

              {/* Funnel bar */}
              <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-${stage.color}-500 to-${stage.color}-600 transition-all duration-300`}
                  style={{
                    width: `${stage.percentage}%`,
                    background: stage.color === 'indigo' ? 'linear-gradient(to right, #4f46e5, #4338ca)' :
                               stage.color === 'blue' ? 'linear-gradient(to right, #3b82f6, #1d4ed8)' :
                               stage.color === 'amber' ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                               'linear-gradient(to right, #10b981, #059669)',
                  }}
                />
              </div>
            </div>
          )
        })}

        {/* Summary */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Signup Rate</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {((data.signups / data.visitors) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Conversion Rate</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {((data.proSubscribers / data.signups) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}
