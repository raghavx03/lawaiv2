'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Bot, TrendingUp, Zap } from 'lucide-react'
import { useVisibilityPolling } from '@/hooks/useVisibilityPolling'

interface AIPerformance {
  totalQueries: number
  drafts: number
  conversations: number
  research: number
  summaries: number
  efficiency: number
}

export function AIPerformanceWidget() {
  const [performance, setPerformance] = useState<AIPerformance>({
    totalQueries: 0,
    drafts: 0,
    conversations: 0,
    research: 0,
    summaries: 0,
    efficiency: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchPerformance = async () => {
    try {
      const response = await fetch('/api/dashboard/ai-performance')
      if (response.ok) {
        const data = await response.json()
        setPerformance(data)
      }
    } catch (error) {
      console.error('Failed to fetch AI performance:', error)
    } finally {
      setLoading(false)
    }
  }

  useVisibilityPolling({
    onPoll: fetchPerformance,
    interval: 300000, // 5 minutes instead of 1 minute
    enabled: true
  })

  useEffect(() => {
    fetchPerformance()
  }, [])

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600'
    if (efficiency >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEfficiencyBg = (efficiency: number) => {
    if (efficiency >= 80) return 'bg-green-500'
    if (efficiency >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            AI Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-2 bg-gray-200 rounded w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ) : performance.totalQueries === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No AI activity yet</p>
              <p className="text-sm">Start using AI features to see performance metrics</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Efficiency Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">AI Efficiency</span>
                  <span className={`text-sm font-bold ${getEfficiencyColor(performance.efficiency)}`}>
                    {performance.efficiency}%
                  </span>
                </div>
                <Progress 
                  value={performance.efficiency} 
                  className="h-2"
                />
              </div>

              {/* Total Queries */}
              <motion.div 
                className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Total AI Queries</span>
                </div>
                <motion.p 
                  className="text-2xl font-bold text-purple-600"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {performance.totalQueries}
                </motion.p>
              </motion.div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <p className="text-xs text-gray-500 mb-1">Documents</p>
                  <p className="text-lg font-semibold text-green-600">{performance.drafts}</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <p className="text-xs text-gray-500 mb-1">Conversations</p>
                  <p className="text-lg font-semibold text-blue-600">{performance.conversations}</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <p className="text-xs text-gray-500 mb-1">Research</p>
                  <p className="text-lg font-semibold text-orange-600">{performance.research}</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <p className="text-xs text-gray-500 mb-1">Summaries</p>
                  <p className="text-lg font-semibold text-purple-600">{performance.summaries}</p>
                </motion.div>
              </div>

              {performance.efficiency >= 80 && (
                <motion.div 
                  className="flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Excellent AI Performance!</span>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}