'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCase } from '@/context/CaseContext'
import Link from 'next/link'
import {
  MessageSquare, FileText, Scale, Search, Bell,
  Briefcase, ArrowRight, Clock, Sparkles, FileEdit,
  ChevronRight
} from 'lucide-react'

interface Activity {
  id: string
  type: string
  feature: string
  title: string
  content?: string
  caseId?: string
  caseTitle?: string
  caseCnr?: string
  referenceId?: string
  createdAt: string
}

const activityIcons: Record<string, any> = {
  AI_CHAT: MessageSquare,
  DRAFT_CREATED: FileText,
  SUMMARY_CREATED: Scale,
  RESEARCH_DONE: Search,
  NOTICE_CREATED: Bell,
  DOCUMENT_UPLOADED: FileEdit,
  NOTE_ADDED: FileText,
  HEARING_ADDED: Briefcase,
  CASE_CREATED: Briefcase
}

const activityColors: Record<string, string> = {
  AI_CHAT: 'bg-blue-100 text-blue-600',
  DRAFT_CREATED: 'bg-green-100 text-green-600',
  SUMMARY_CREATED: 'bg-purple-100 text-purple-600',
  RESEARCH_DONE: 'bg-amber-100 text-amber-600',
  NOTICE_CREATED: 'bg-red-100 text-red-600',
  DOCUMENT_UPLOADED: 'bg-gray-100 text-gray-600',
  NOTE_ADDED: 'bg-gray-100 text-gray-600',
  HEARING_ADDED: 'bg-indigo-100 text-indigo-600',
  CASE_CREATED: 'bg-gray-900 text-white'
}

export function RecentActivity() {
  const { user } = useAuth()
  const { setActiveCase, cases } = useCase()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadActivities()
    }
  }, [user])

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/timeline?limit=10')
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = (activity: Activity) => {
    // Set active case if activity has one
    if (activity.caseId) {
      const caseItem = cases.find(c => c.id === activity.caseId)
      if (caseItem) {
        setActiveCase(caseItem)
      }
    }
  }

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const getCTA = (activity: Activity) => {
    switch (activity.type) {
      case 'AI_CHAT':
        return { label: 'Continue Chat', href: '/ai-assistant' }
      case 'DRAFT_CREATED':
        return { label: 'View Draft', href: '/drafts' }
      case 'SUMMARY_CREATED':
        return { label: 'View Summary', href: '/summarizer' }
      case 'RESEARCH_DONE':
        return { label: 'Continue Research', href: '/research' }
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-3 p-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No recent activity</p>
          <Link
            href="/ai-assistant"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Start with AI Assistant
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
        <Link
          href="/cases"
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
        >
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type] || FileText
          const colorClass = activityColors[activity.type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          const cta = getCTA(activity)

          return (
            <div
              key={activity.id}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                  {activity.title}
                </p>
                {activity.content && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {activity.content}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {getTimeAgo(activity.createdAt)}
                  </span>
                  {activity.caseCnr && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Briefcase className="h-3 w-3" />
                      {activity.caseCnr}
                    </span>
                  )}
                </div>
              </div>

              {cta && (
                <Link
                  href={cta.href}
                  onClick={() => handleContinue(activity)}
                  className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center gap-1"
                >
                  {cta.label}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
