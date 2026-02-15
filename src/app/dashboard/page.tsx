'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Toaster, toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { useCase } from '@/context/CaseContext'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useUsageTracking } from '@/hooks/useUsageTracking'
import { Drawer } from '@/components/shared/Drawer'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { FileUpload } from '@/components/shared/FileUpload'
import { UsageProgressBar } from '@/components/shared/UsageProgressBar'
import { CaseHealthWidget } from '@/components/shared/CaseHealthWidget'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { SmartSuggestions } from '@/components/dashboard/SmartSuggestions'
import {
  MessageSquare,
  FileText,
  Scale,
  Briefcase,
  Users,
  Newspaper,
  Search,
  Plus,
  Upload,
  Sparkles,
  Calendar,
  Timer,
  X
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading, refreshProfile } = useAuth()
  const { activeCase, cases, setActiveCase } = useCase()
  const { stats, loading: statsLoading } = useDashboardData(user?.id)
  const { isPro } = useUsageTracking()

  // Quick action modals
  const [showAIDrawer, setShowAIDrawer] = useState(false)
  const [showUploadSheet, setShowUploadSheet] = useState(false)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [lastCase, setLastCase] = useState<typeof activeCase>(null)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')

  useEffect(() => {
    if (user && !profile) {
      refreshProfile().catch(console.error)
    }
  }, [user, profile, refreshProfile])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [loading, user, router])

  // Check for last case to resume
  useEffect(() => {
    if (typeof window !== 'undefined' && cases.length > 0 && !activeCase) {
      const lastCaseId = localStorage.getItem('activeCaseId')
      if (lastCaseId) {
        const found = cases.find(c => c.id === lastCaseId)
        if (found) {
          setLastCase(found)
          setShowResumePrompt(true)
        }
      }
    }
  }, [cases, activeCase])

  const handleResumeCase = () => {
    if (lastCase) {
      setActiveCase(lastCase)
      setShowResumePrompt(false)
      toast.success(`Resumed: ${lastCase.cnrNumber}`)
    }
  }

  const handleDismissResume = () => {
    setShowResumePrompt(false)
    localStorage.removeItem('activeCaseId')
  }

  // Quick AI query
  const handleQuickAI = async () => {
    if (!aiInput.trim()) return
    setAiLoading(true)
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiInput,
          caseId: activeCase?.id
        })
      })
      const data = await response.json()
      setAiResponse(data.response || data.message || 'No response')
    } catch (error) {
      toast.error('Failed to get AI response')
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  // Calculate lawyer-specific KPIs
  const pendingCases = cases.filter(c => c.status?.toLowerCase().includes('pending')).length
  const upcomingHearings = cases.filter(c => c.nextHearing && new Date(c.nextHearing) >= new Date()).length
  const estimatedHoursSaved = Math.round((stats?.totalChats || 0) * 0.5 + (stats?.totalDrafts || 0) * 2)

  const statCards = [
    { label: 'Active Cases', value: pendingCases, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
    { label: 'Drafts Created', value: stats?.totalDrafts || 0, icon: FileText, color: 'bg-green-50 text-green-600' },
    { label: 'Hours Saved', value: `${estimatedHoursSaved}h`, icon: Timer, color: 'bg-purple-50 text-purple-600' },
    { label: 'Upcoming Hearings', value: upcomingHearings, icon: Calendar, color: 'bg-amber-50 text-amber-600' },
  ]

  const quickActions = [
    {
      name: 'AI Assistant',
      icon: MessageSquare,
      desc: 'Indian Law Expert',
      badge: 'AI Powered',
      action: () => setShowAIDrawer(true),
      highlight: true
    },
    {
      name: 'Upload Document',
      icon: Upload,
      desc: 'Analyze PDF, DOC',
      action: () => setShowUploadSheet(true)
    },
    {
      name: 'Generate Draft',
      href: '/drafts',
      icon: FileText,
      desc: 'Legal Documents'
    },
    {
      name: 'Summarize',
      href: '/summarizer',
      icon: Scale,
      desc: 'Judgment Analysis'
    },
    {
      name: 'Track Case',
      href: '/case-tracker',
      icon: Briefcase,
      desc: 'CNR Status'
    },
    {
      name: 'Client CRM',
      href: '/crm',
      icon: Users,
      desc: 'Manage Clients'
    },
    {
      name: 'Research',
      href: '/research',
      icon: Search,
      desc: 'Case Laws'
    },
    {
      name: 'Legal News',
      href: '/news',
      icon: Newspaper,
      desc: 'Latest Updates'
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <Toaster position="top-right" />

      {/* Resume Last Case Prompt */}
      {showResumePrompt && lastCase && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Continue where you left off?</p>
                <p className="font-semibold text-gray-900 dark:text-white">{lastCase.cnrNumber}</p>
                {lastCase.petitioner && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{lastCase.petitioner} vs {lastCase.respondent}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResumeCase}
                className="px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleDismissResume}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.fullName?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            {activeCase
              ? `Working on: ${activeCase.cnrNumber}`
              : "Here's your legal work overview"}
          </p>
        </div>
        <Link href="/case-tracker">
          <button className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-xl transition-colors text-sm sm:text-base">
            <Plus className="h-4 w-4" />
            Add New Case
          </button>
        </Link>
      </div>

      {/* Active Case Banner */}
      {activeCase && (
        <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-2xl p-4 sm:p-5 border border-transparent dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/60">Active Case</p>
                <p className="font-semibold">{activeCase.cnrNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {activeCase.nextHearing && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-white/60" />
                  <span>Next: {activeCase.nextHearing}</span>
                </div>
              )}
              <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs">
                {activeCase.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 ${stat.color} dark:bg-opacity-20 rounded-xl flex items-center justify-center`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsLoading ? '...' : stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const content = (
              <div className={`group bg-white dark:bg-gray-800 border rounded-2xl p-4 sm:p-5 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all cursor-pointer flex flex-col h-full min-h-[140px] ${action.highlight ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-900/50' : 'border-gray-200 dark:border-gray-700'
                }`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors flex-shrink-0 ${action.highlight
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-900 dark:group-hover:bg-white text-gray-600 dark:text-gray-300 group-hover:text-white dark:group-hover:text-gray-900'
                  }`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{action.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">{action.desc}</p>
                </div>
                {action.badge && (
                  <div className="mt-auto pt-2 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <Sparkles className="h-3 w-3" />
                    <span>{action.badge}</span>
                  </div>
                )}
              </div>
            )

            if (action.action) {
              return (
                <div key={action.name} onClick={action.action}>
                  {content}
                </div>
              )
            }

            return (
              <Link key={action.name} href={action.href!}>
                {content}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity & Smart Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity - Real Timeline */}
        <RecentActivity />

        {/* Smart Suggestions */}
        <SmartSuggestions />
      </div>

      {/* Usage & Case Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Usage Progress */}
        {!isPro && <UsageProgressBar />}

        {/* Case Health Widget */}
        {activeCase && <CaseHealthWidget />}
      </div>

      {/* AI Assistant Drawer */}
      <Drawer
        isOpen={showAIDrawer}
        onClose={() => { setShowAIDrawer(false); setAiResponse(''); setAiInput(''); }}
        title="AI Legal Assistant"
        width="w-[450px]"
      >
        <div className="p-5 space-y-4">
          {activeCase && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm">
              <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">Linked to: {activeCase.cnrNumber}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ask a legal question</label>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="e.g., What are the grounds for bail under Section 437 CrPC?"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-sm resize-none"
              rows={4}
            />
          </div>

          <button
            onClick={handleQuickAI}
            disabled={aiLoading || !aiInput.trim()}
            className="w-full py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Get Answer
              </>
            )}
          </button>

          {aiResponse && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {['Bail provisions', 'Section 138 NI Act', 'Consumer complaint'].map((q) => (
                <button
                  key={q}
                  onClick={() => setAiInput(q)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Upload Bottom Sheet (Mobile) */}
      <BottomSheet
        isOpen={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        title="Upload Document"
      >
        <div className="space-y-4">
          {activeCase && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm">
              <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">Will be linked to: {activeCase.cnrNumber}</span>
            </div>
          )}

          <FileUpload
            linkedFeature="dashboard"
            onFileUploaded={(file) => {
              toast.success(`${file.filename} uploaded successfully`)
              setShowUploadSheet(false)
            }}
          />
        </div>
      </BottomSheet>
    </div>
  )
}
