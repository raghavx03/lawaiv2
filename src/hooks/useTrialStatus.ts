'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

interface TrialStatus {
  isTrialActive: boolean
  isTrialExpired: boolean
  daysLeft: number
  trialEndDate: Date | null
  isPaidUser: boolean
  shouldShowUpgradeModal: boolean
}

export function useTrialStatus(): TrialStatus {
  const { user, profile, loading } = useAuth()
  const [status, setStatus] = useState<TrialStatus>({
    isTrialActive: true,
    isTrialExpired: false,
    daysLeft: 7,
    trialEndDate: null,
    isPaidUser: false,
    shouldShowUpgradeModal: false
  })

  useEffect(() => {
    // Wait for auth to load
    if (loading) return
    
    if (!user || !profile) {
      setStatus({
        isTrialActive: true,
        isTrialExpired: false,
        daysLeft: 7,
        trialEndDate: null,
        isPaidUser: false,
        shouldShowUpgradeModal: false
      })
      return
    }

    // Check if user has a paid plan
    const isPaidUser = profile.plan === 'PLUS' || profile.plan === 'PRO'
    
    if (isPaidUser) {
      setStatus({
        isTrialActive: false,
        isTrialExpired: false,
        daysLeft: 0,
        trialEndDate: null,
        isPaidUser: true,
        shouldShowUpgradeModal: false
      })
      return
    }

    // Calculate trial status for FREE users
    let trialEndDate: Date | null = null
    
    // Check trialEndDate first, then expiryDate, then createdAt
    if (profile.trialEndDate) {
      trialEndDate = new Date(profile.trialEndDate)
    } else if (profile.expiryDate) {
      trialEndDate = new Date(profile.expiryDate)
    } else if (profile.createdAt) {
      // Calculate 7 days from account creation
      trialEndDate = new Date(profile.createdAt)
      trialEndDate.setDate(trialEndDate.getDate() + 7)
    } else {
      // Fallback: 7 days from now for new users
      trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 7)
    }

    const now = new Date()
    const timeDiff = trialEndDate.getTime() - now.getTime()
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    
    const isTrialExpired = daysLeft <= 0
    const isTrialActive = daysLeft > 0
    
    // Show upgrade modal if trial expired
    const shouldShowUpgradeModal = isTrialExpired

    setStatus({
      isTrialActive,
      isTrialExpired,
      daysLeft: Math.max(0, daysLeft),
      trialEndDate,
      isPaidUser: false,
      shouldShowUpgradeModal
    })
  }, [user, profile, loading])

  return status
}
