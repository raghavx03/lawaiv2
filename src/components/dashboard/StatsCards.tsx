'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Search, Bot, FileText } from 'lucide-react'

interface DashboardStats {
  totalCases: number
  totalResearch: number
  totalChats: number
  totalDrafts: number
  dbConnected?: boolean
}

interface StatsCardsProps {
  stats: DashboardStats
  loading: boolean
}

const StatCard = memo(function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  loading 
}: {
  title: string
  value: number
  icon: any
  color: string
  loading: boolean
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )
})

export const StatsCards = memo(function StatsCards({ stats, loading }: StatsCardsProps) {
  const statsConfig = [
    { title: 'Total Cases', value: stats.totalCases, icon: BarChart3, color: 'text-blue-600' },
    { title: 'Research Queries', value: stats.totalResearch, icon: Search, color: 'text-green-600' },
    { title: 'AI Conversations', value: stats.totalChats, icon: Bot, color: 'text-purple-600' },
    { title: 'Documents', value: stats.totalDrafts, icon: FileText, color: 'text-orange-600' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statsConfig.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          loading={loading}
        />
      ))}
    </div>
  )
})