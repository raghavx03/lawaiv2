'use client'

import { useState, useEffect } from 'react'
import { useCase } from '@/context/CaseContext'
import Link from 'next/link'
import {
  Sparkles, FileText, Calendar, AlertTriangle,
  ArrowRight, Briefcase, MessageSquare, Scale,
  Clock, CheckCircle
} from 'lucide-react'

interface Suggestion {
  id: string
  type: 'urgent' | 'action' | 'tip'
  title: string
  description: string
  action: {
    label: string
    href: string
  }
  caseId?: string
  caseName?: string
}

export function SmartSuggestions() {
  const { cases, activeCase, urgentCases, upcomingHearings } = useCase()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  useEffect(() => {
    generateSuggestions()
  }, [cases, activeCase, urgentCases, upcomingHearings])

  const generateSuggestions = () => {
    const newSuggestions: Suggestion[] = []

    // Urgent: Hearings in next 3 days
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    upcomingHearings.slice(0, 2).forEach(c => {
      if (c.nextHearing) {
        const hearingDate = new Date(c.nextHearing)
        if (hearingDate <= threeDaysFromNow) {
          newSuggestions.push({
            id: `hearing-${c.id}`,
            type: 'urgent',
            title: `Hearing in ${getDaysUntil(hearingDate)} days`,
            description: `${c.title || c.cnrNumber} - Prepare for court`,
            action: {
              label: 'Prepare Now',
              href: `/cases/${c.id}?prep=true`
            },
            caseId: c.id,
            caseName: c.cnrNumber
          })
        }
      }
    })

    // Action: Cases without recent activity
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    cases.filter(c =>
      c.status !== 'DISPOSED' &&
      c.status !== 'CLOSED' &&
      new Date(c.updatedAt) < oneWeekAgo
    ).slice(0, 1).forEach(c => {
      newSuggestions.push({
        id: `inactive-${c.id}`,
        type: 'action',
        title: 'Case needs attention',
        description: `${c.title || c.cnrNumber} - No activity in 7+ days`,
        action: {
          label: 'Review Case',
          href: `/cases/${c.id}`
        },
        caseId: c.id,
        caseName: c.cnrNumber
      })
    })

    // Tip: Suggest AI for active case
    if (activeCase) {
      newSuggestions.push({
        id: 'ai-tip',
        type: 'tip',
        title: 'Get AI insights',
        description: `Ask LAW.AI about ${activeCase.cnrNumber}`,
        action: {
          label: 'Ask AI',
          href: '/ai-assistant'
        },
        caseId: activeCase.id
      })
    }

    // Tip: No cases yet
    if (cases.length === 0) {
      newSuggestions.push({
        id: 'first-case',
        type: 'tip',
        title: 'Add your first case',
        description: 'Track cases by CNR number for smart assistance',
        action: {
          label: 'Add Case',
          href: '/case-tracker'
        }
      })
    }

    setSuggestions(newSuggestions.slice(0, 3))
  }

  const getDaysUntil = (date: Date) => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (suggestions.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl p-5 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-yellow-400" />
        <h2 className="font-semibold text-white">Smart Suggestions</h2>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`p-3 rounded-xl ${suggestion.type === 'urgent'
                ? 'bg-red-500/20 border border-red-500/30'
                : suggestion.type === 'action'
                  ? 'bg-amber-500/20 border border-amber-500/30'
                  : 'bg-white/10 border border-white/10 hover:bg-white/15 transition-colors'
              }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {suggestion.type === 'urgent' && (
                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  )}
                  {suggestion.type === 'action' && (
                    <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  )}
                  {suggestion.type === 'tip' && (
                    <Sparkles className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  )}
                  <span className="font-medium text-sm text-white">{suggestion.title}</span>
                </div>
                <p className="text-xs text-white/70 truncate">{suggestion.description}</p>
              </div>

              <Link
                href={suggestion.action.href}
                className="flex-shrink-0 px-3 py-1.5 bg-white text-gray-900 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                {suggestion.action.label}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
