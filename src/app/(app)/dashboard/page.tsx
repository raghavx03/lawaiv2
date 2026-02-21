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
import { StatCard, PremiumButton, PremiumCard, SkeletonLoader } from '@/components/premium'
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
      <div className="space-y-6">
        <div className="h-10 w-48 skeleton-premium rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 skeleton-premium rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return null

  // Calculate lawyer-specific KPIs
  const pendingCases = cases.filter(c => c.status?.toLowerCase().includes('pending')).length
  const upcomingHearings = cases.filter(c => c.nextHearing && new Date(c.nextHearing) >= new Date()).length
  const estimatedHoursSaved = Math.round((stats?.totalChats || 0) * 0.5 + (stats?.totalDrafts || 0) * 2)

  const statCards = [
    {
      label: 'Active Cases',
      value: pendingCases,
      icon: <Briefcase className="h-5 w-5" />,
      color: 'indigo' as const,
      trend: { value: 12, isPositive: true, label: 'from last month' }
    },
    {
      label: 'Drafts Created',
      value: stats?.totalDrafts || 0,
      icon: <FileText className="h-5 w-5" />,
      color: 'emerald' as const,
      trend: { value: 8, isPositive: true, label: 'this month' }
    },
    {
      label: 'Hours Saved',
      value: `${estimatedHoursSaved}h`,
      icon: <Timer className="h-5 w-5" />,
      color: 'amber' as const,
      trend: { value: 15, isPositive: true, label: 'total' }
    },
    {
      label: 'Upcoming Hearings',
      value: upcomingHearings,
      icon: <Calendar className="h-5 w-5" />,
      color: 'blue' as const,
      trend: { value: 3, isPositive: false, label: 'next 30 days' }
    },
  ]

  const quickActions = [
    {
      name: 'AI Assistant',
      href: '/ai-assistant',
      icon: MessageSquare,
      desc: 'Indian Law Expert',
      badge: 'AI Powered'
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
    <div className="space-y-8">
      <Toaster position="top-right" />

      {/* Resume Last Case Prompt */}
      {showResumePrompt && lastCase && (
        <PremiumCard className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Continue where you left off?</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">{lastCase.cnrNumber}</p>
                {lastCase.petitioner && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{lastCase.petitioner} vs {lastCase.respondent}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PremiumButton
                size="sm"
                onClick={handleResumeCase}
              >
                Resume
              </PremiumButton>
              <button
                onClick={handleDismissResume}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-premium-h1 text-slate-900 dark:text-white">
            Welcome back, {profile?.fullName?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-premium-body text-slate-600 dark:text-slate-400 mt-2">
            {activeCase
              ? `Working on: ${activeCase.cnrNumber}`
              : "Here's your legal work overview"}
          </p>
        </div>
        <Link href="/case-tracker">
          <PremiumButton size="lg">
            <Plus className="h-4 w-4" />
            Add New Case
          </PremiumButton>
        </Link>
      </div>

      {/* Active Case Banner */}
      {activeCase && (
        <PremiumCard className="bg-black dark:bg-white border text-white dark:text-black shadow-xl shadow-black/10 dark:shadow-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/80 dark:text-black/80">Active Case</p>
                <p className="font-semibold text-lg">{activeCase.cnrNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {activeCase.nextHearing && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-white/80 dark:text-black/80" />
                  <span>Next: {activeCase.nextHearing}</span>
                </div>
              )}
              <span className="px-3 py-1 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full text-xs font-medium">
                {activeCase.status || 'Pending'}
              </span>
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={statsLoading ? '...' : stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            loading={statsLoading}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-premium-h2 text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const content = (
              <PremiumCard hoverable className="flex flex-col h-full min-h-[140px] cursor-pointer group bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-12 h-12 bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 text-slate-900 dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black group-hover:border-transparent rounded-xl flex items-center justify-center mb-4 transition-all duration-300 flex-shrink-0 shadow-sm group-hover:scale-110 relative z-10">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 flex flex-col relative z-10">
                  <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight group-hover:text-black dark:group-hover:text-white transition-colors">{action.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{action.desc}</p>
                </div>
                {action.badge && (
                  <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white relative z-10">
                    <Sparkles className="h-3.5 w-3.5 text-slate-900 dark:text-white animate-pulse" />
                    <span>{action.badge}</span>
                  </div>
                )}
              </PremiumCard>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <SmartSuggestions />
      </div>

      {/* Usage & Case Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!isPro && <UsageProgressBar />}
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
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg text-sm border border-slate-200 dark:border-slate-800">
              <Briefcase className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">Linked to: {activeCase.cnrNumber}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ask a legal question</label>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="e.g., What are the grounds for bail under Section 437 CrPC?"
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm resize-none"
              rows={4}
            />
          </div>

          <PremiumButton
            onClick={handleQuickAI}
            disabled={aiLoading || !aiInput.trim()}
            isLoading={aiLoading}
            className="w-full"
          >
            <Sparkles className="h-4 w-4" />
            Get Answer
          </PremiumButton>

          {aiResponse && (
            <PremiumCard className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{aiResponse}</p>
            </PremiumCard>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-medium">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {['Bail provisions', 'Section 138 NI Act', 'Consumer complaint'].map((q) => (
                <button
                  key={q}
                  onClick={() => setAiInput(q)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg transition-all font-medium border border-slate-200 dark:border-slate-700"
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
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg text-sm border border-slate-200 dark:border-slate-800">
              <Briefcase className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">Will be linked to: {activeCase.cnrNumber}</span>
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
