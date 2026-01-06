'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

export interface UsageStats {
  aiMessagesToday: number
  draftsThisMonth: number
  activeCases: number
  filesUploaded: number
  lastUpdated: string
}

export interface UsageLimits {
  aiMessagesPerDay: number
  draftsPerMonth: number
  maxActiveCases: number
  maxFileSize: number // in MB
}

const FREE_LIMITS: UsageLimits = {
  aiMessagesPerDay: 20,
  draftsPerMonth: 5,
  maxActiveCases: 3,
  maxFileSize: 5
}

const PRO_LIMITS: UsageLimits = {
  aiMessagesPerDay: 999,
  draftsPerMonth: 999,
  maxActiveCases: 999,
  maxFileSize: 50
}

export function useUsageTracking() {
  const { user, profile } = useAuth()
  const [usage, setUsage] = useState<UsageStats>({
    aiMessagesToday: 0,
    draftsThisMonth: 0,
    activeCases: 0,
    filesUploaded: 0,
    lastUpdated: new Date().toISOString()
  })
  const [loading, setLoading] = useState(true)

  const isPro = profile?.plan === 'PRO' || profile?.plan === 'PLUS'
  const limits = isPro ? PRO_LIMITS : FREE_LIMITS

  // Load usage from localStorage (fallback) and API
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    // Load from localStorage first for instant display
    const cached = localStorage.getItem(`usage_${user.id}`)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        // Reset daily count if it's a new day
        const lastDate = new Date(parsed.lastUpdated).toDateString()
        const today = new Date().toDateString()
        if (lastDate !== today) {
          parsed.aiMessagesToday = 0
        }
        setUsage(parsed)
      } catch (e) {
        console.error('Failed to parse cached usage:', e)
      }
    }

    // Then fetch from API
    fetchUsage()
  }, [user])

  const fetchUsage = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/usage/stats')
      if (response.ok) {
        const data = await response.json()
        const newUsage = {
          aiMessagesToday: data.aiMessagesToday || 0,
          draftsThisMonth: data.draftsThisMonth || 0,
          activeCases: data.activeCases || 0,
          filesUploaded: data.filesUploaded || 0,
          lastUpdated: new Date().toISOString()
        }
        setUsage(newUsage)
        localStorage.setItem(`usage_${user.id}`, JSON.stringify(newUsage))
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackUsage = useCallback(async (type: 'ai_message' | 'draft' | 'file_upload') => {
    if (!user) return

    // Update local state immediately
    setUsage(prev => {
      const updated = { ...prev, lastUpdated: new Date().toISOString() }
      switch (type) {
        case 'ai_message':
          updated.aiMessagesToday = prev.aiMessagesToday + 1
          break
        case 'draft':
          updated.draftsThisMonth = prev.draftsThisMonth + 1
          break
        case 'file_upload':
          updated.filesUploaded = prev.filesUploaded + 1
          break
      }
      localStorage.setItem(`usage_${user.id}`, JSON.stringify(updated))
      return updated
    })

    // Track in background
    try {
      await fetch('/api/usage/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
    } catch (error) {
      console.error('Failed to track usage:', error)
    }
  }, [user])

  const getUsagePercentage = (type: keyof UsageStats) => {
    switch (type) {
      case 'aiMessagesToday':
        return Math.min((usage.aiMessagesToday / limits.aiMessagesPerDay) * 100, 100)
      case 'draftsThisMonth':
        return Math.min((usage.draftsThisMonth / limits.draftsPerMonth) * 100, 100)
      case 'activeCases':
        return Math.min((usage.activeCases / limits.maxActiveCases) * 100, 100)
      default:
        return 0
    }
  }

  const canUse = (type: 'ai_message' | 'draft' | 'new_case') => {
    if (isPro) return true
    
    switch (type) {
      case 'ai_message':
        return usage.aiMessagesToday < limits.aiMessagesPerDay
      case 'draft':
        return usage.draftsThisMonth < limits.draftsPerMonth
      case 'new_case':
        return usage.activeCases < limits.maxActiveCases
      default:
        return true
    }
  }

  const getRemainingMessage = (type: 'ai_message' | 'draft' | 'new_case') => {
    if (isPro) return null
    
    switch (type) {
      case 'ai_message':
        const aiRemaining = limits.aiMessagesPerDay - usage.aiMessagesToday
        if (aiRemaining <= 5 && aiRemaining > 0) {
          return `${aiRemaining} AI messages left today`
        }
        if (aiRemaining <= 0) {
          return 'Daily AI limit reached. Upgrade for unlimited.'
        }
        return null
      case 'draft':
        const draftRemaining = limits.draftsPerMonth - usage.draftsThisMonth
        if (draftRemaining <= 2 && draftRemaining > 0) {
          return `${draftRemaining} drafts left this month`
        }
        if (draftRemaining <= 0) {
          return 'Monthly draft limit reached. Upgrade for unlimited.'
        }
        return null
      case 'new_case':
        const caseRemaining = limits.maxActiveCases - usage.activeCases
        if (caseRemaining <= 1 && caseRemaining > 0) {
          return `${caseRemaining} case slot remaining`
        }
        if (caseRemaining <= 0) {
          return 'Case limit reached. Archive old cases or upgrade.'
        }
        return null
      default:
        return null
    }
  }

  return {
    usage,
    limits,
    loading,
    isPro,
    trackUsage,
    getUsagePercentage,
    canUse,
    getRemainingMessage,
    refetch: fetchUsage
  }
}
