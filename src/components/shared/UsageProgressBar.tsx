'use client'

import { useUsageTracking } from '@/hooks/useUsageTracking'
import { Zap, FileText, Briefcase, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface UsageProgressBarProps {
  compact?: boolean
  showUpgrade?: boolean
}

export function UsageProgressBar({ compact = false, showUpgrade = true }: UsageProgressBarProps) {
  const { usage, limits, isPro, getUsagePercentage, getRemainingMessage } = useUsageTracking()

  if (isPro) {
    return compact ? null : (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-xl text-sm">
        <Zap className="h-4 w-4" />
        <span>Pro Plan - Unlimited Access</span>
      </div>
    )
  }

  const aiPercentage = getUsagePercentage('aiMessagesToday')
  const draftPercentage = getUsagePercentage('draftsThisMonth')
  const casePercentage = getUsagePercentage('activeCases')

  const aiWarning = getRemainingMessage('ai_message')
  const draftWarning = getRemainingMessage('draft')
  const caseWarning = getRemainingMessage('new_case')

  if (compact) {
    // Show only if near limit
    const showWarning = aiPercentage >= 70 || draftPercentage >= 70 || casePercentage >= 70
    if (!showWarning) return null

    return (
      <Link href="/pricing">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>
            {aiWarning || draftWarning || caseWarning || 'Approaching limits'}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Usage This Period</h3>
        {showUpgrade && (
          <Link href="/pricing">
            <button className="text-xs px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors">
              Upgrade
            </button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {/* AI Messages */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="h-4 w-4" />
              <span>AI Messages Today</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {usage.aiMessagesToday}/{limits.aiMessagesPerDay}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                aiPercentage >= 90 ? 'bg-red-500' : aiPercentage >= 70 ? 'bg-amber-500' : 'bg-gray-900'
              }`}
              style={{ width: `${aiPercentage}%` }}
            />
          </div>
          {aiWarning && (
            <p className="text-xs text-amber-600 mt-1">{aiWarning}</p>
          )}
        </div>

        {/* Drafts */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>Drafts This Month</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {usage.draftsThisMonth}/{limits.draftsPerMonth}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                draftPercentage >= 90 ? 'bg-red-500' : draftPercentage >= 70 ? 'bg-amber-500' : 'bg-gray-900'
              }`}
              style={{ width: `${draftPercentage}%` }}
            />
          </div>
          {draftWarning && (
            <p className="text-xs text-amber-600 mt-1">{draftWarning}</p>
          )}
        </div>

        {/* Active Cases */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4" />
              <span>Active Cases</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {usage.activeCases}/{limits.maxActiveCases}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                casePercentage >= 90 ? 'bg-red-500' : casePercentage >= 70 ? 'bg-amber-500' : 'bg-gray-900'
              }`}
              style={{ width: `${casePercentage}%` }}
            />
          </div>
          {caseWarning && (
            <p className="text-xs text-amber-600 mt-1">{caseWarning}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Limits reset daily (AI) and monthly (drafts)
      </p>
    </div>
  )
}
