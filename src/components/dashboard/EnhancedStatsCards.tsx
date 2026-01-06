'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Search, Bot, FileText } from 'lucide-react'

interface DashboardStats {
  totalCases: number
  totalResearch: number
  totalChats: number
  totalDrafts: number
  dbConnected?: boolean
}

interface EnhancedStatsCardsProps {
  stats: DashboardStats
  loading: boolean
}

const StatCard = memo(function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor,
  loading,
  index 
}: {
  title: string
  value: number
  icon: any
  color: string
  bgColor: string
  loading: boolean
  index: number
}) {
  const getHintText = () => {
    if (value > 0) return null
    switch (title) {
      case 'Total Cases': return 'Add your first case to track'
      case 'Research Queries': return 'Try the legal research tool'
      case 'AI Conversations': return 'Start chatting with AI Assistant'
      case 'Documents': return 'Generate your first document'
      default: return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
              ) : (
                <div className="mt-1">
                  <motion.p 
                    className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  >
                    {value}
                  </motion.p>
                  {getHintText() && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{getHintText()}</p>
                  )}
                </div>
              )}
            </div>
            <motion.div 
              className={`p-3 rounded-full ${bgColor}`}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className={`h-6 w-6 ${color}`} />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})

export const EnhancedStatsCards = memo(function EnhancedStatsCards({ stats, loading }: EnhancedStatsCardsProps) {
  const statsConfig = [
    { 
      title: 'Total Cases', 
      value: stats.totalCases, 
      icon: BarChart3, 
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    { 
      title: 'Research Queries', 
      value: stats.totalResearch, 
      icon: Search, 
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    { 
      title: 'AI Conversations', 
      value: stats.totalChats, 
      icon: Bot, 
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    { 
      title: 'Documents', 
      value: stats.totalDrafts, 
      icon: FileText, 
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          bgColor={stat.bgColor}
          loading={loading}
          index={index}
        />
      ))}
    </div>
  )
})