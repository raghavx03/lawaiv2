'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns'

interface Deadline {
  id: string
  cnr: string
  partyName: string
  court: string
  nextDate: string
  status: string
}

export function DeadlinesWidget() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const response = await fetch('/api/dashboard/deadlines')
        if (response.ok) {
          const data = await response.json()
          setDeadlines(data)
        }
      } catch (error) {
        console.error('Failed to fetch deadlines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeadlines()
    const interval = setInterval(fetchDeadlines, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    const days = differenceInDays(date, new Date())
    return days === 1 ? 'Tomorrow' : `${days} days`
  }

  const getUrgencyColor = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = differenceInDays(date, new Date())
    if (days <= 1) return 'bg-red-100 text-red-800'
    if (days <= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : deadlines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No upcoming deadlines</p>
              <p className="text-sm">Add cases to track important dates</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deadlines.map((deadline, index) => (
                <motion.div
                  key={deadline.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {deadline.partyName}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {deadline.court}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {format(new Date(deadline.nextDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`text-xs ${getUrgencyColor(deadline.nextDate)}`}>
                      {getDateLabel(deadline.nextDate)}
                    </Badge>
                    {differenceInDays(new Date(deadline.nextDate), new Date()) <= 1 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}