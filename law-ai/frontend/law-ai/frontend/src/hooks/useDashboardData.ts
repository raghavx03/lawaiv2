'use client'

import { useState, useEffect, useCallback } from 'react'

interface DashboardStats {
  totalCases: number
  totalResearch: number
  totalChats: number
  totalDrafts: number
  dbConnected?: boolean
}

export function useDashboardData(userId?: string) {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    totalResearch: 0,
    totalChats: 0,
    totalDrafts: 0,
    dbConnected: true
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      const response = await fetch('/api/dashboard/stats', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'max-age=60'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error('Failed to fetch stats')
      }
    } catch (err) {
      console.error('Dashboard stats error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStats(prev => ({ ...prev, dbConnected: false }))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const refetch = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch
  }
}