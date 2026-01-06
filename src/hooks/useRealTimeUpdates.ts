'use client'

import { useState, useEffect, useCallback } from 'react'

interface RealTimeData {
  stats: any
  deadlines: any[]
  updates: any[]
  performance: any
  lastUpdated: Date
}

export function useRealTimeUpdates(userId?: string) {
  const [data, setData] = useState<RealTimeData>({
    stats: { totalCases: 0, totalResearch: 0, totalChats: 0, totalDrafts: 0 },
    deadlines: [],
    updates: [],
    performance: { totalQueries: 0, efficiency: 0 },
    lastUpdated: new Date()
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllData = useCallback(async () => {
    if (!userId) return

    try {
      setError(null)
      const [statsRes, deadlinesRes, updatesRes, performanceRes] = await Promise.allSettled([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/deadlines'),
        fetch('/api/dashboard/recent-updates'),
        fetch('/api/dashboard/ai-performance')
      ])

      const newData: Partial<RealTimeData> = { lastUpdated: new Date() }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        newData.stats = await statsRes.value.json()
      }
      if (deadlinesRes.status === 'fulfilled' && deadlinesRes.value.ok) {
        newData.deadlines = await deadlinesRes.value.json()
      }
      if (updatesRes.status === 'fulfilled' && updatesRes.value.ok) {
        newData.updates = await updatesRes.value.json()
      }
      if (performanceRes.status === 'fulfilled' && performanceRes.value.ok) {
        newData.performance = await performanceRes.value.json()
      }

      setData(prev => ({ ...prev, ...newData }))
    } catch (err) {
      console.error('Real-time update error:', err)
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAllData()
    
    // Set up intervals for different update frequencies
    const statsInterval = setInterval(fetchAllData, 60000) // 1 minute
    const updatesInterval = setInterval(() => {
      // Fetch only updates more frequently
      fetch('/api/dashboard/recent-updates')
        .then(res => res.ok ? res.json() : [])
        .then(updates => setData(prev => ({ ...prev, updates, lastUpdated: new Date() })))
        .catch(console.error)
    }, 30000) // 30 seconds

    return () => {
      clearInterval(statsInterval)
      clearInterval(updatesInterval)
    }
  }, [fetchAllData])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchAllData()
  }, [fetchAllData])

  return {
    data,
    loading,
    error,
    refresh
  }
}