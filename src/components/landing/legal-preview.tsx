'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FileText, MessageSquare, Scale, Clock, ArrowUpRight } from 'lucide-react'

export function LegalPreview() {
  const { user } = useAuth()
  const router = useRouter()

  const handleQuickAction = (path: string) => {
    if (user) {
      router.push(path)
    } else {
      router.push(`/auth/login?redirect=${path}`)
    }
  }

  const stats = [
    { label: 'Documents', value: '247', icon: FileText, path: '/drafts' },
    { label: 'AI Queries', value: '1.2K', icon: MessageSquare, path: '/ai-assistant' },
    { label: 'Active Cases', value: '38', icon: Scale, path: '/case-tracker' },
    { label: 'Hours Saved', value: '120+', icon: Clock, path: '/dashboard' },
  ]

  const sidebarItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'AI Assistant', path: '/ai-assistant' },
    { name: 'Drafts', path: '/drafts' },
    { name: 'Summarizer', path: '/summarizer' },
    { name: 'Case Tracker', path: '/case-tracker' },
    { name: 'CRM', path: '/crm' }
  ]

  const quickActions = [
    { name: 'Draft Notice', path: '/drafts' },
    { name: 'Summarize Judgment', path: '/summarizer' },
    { name: 'Track Case', path: '/case-tracker' }
  ]

  return (
    <section id="preview" className="relative py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-5 tracking-tight">
            One platform. All your legal work.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Drafting, research, summarization, and case tracking — unified in one powerful dashboard.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="relative">
          {/* Main Card */}
          <div className="relative bg-white rounded-3xl border border-gray-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-5 sm:p-8 overflow-hidden">
            {/* Mock Dashboard UI */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-6">
              {/* Sidebar Mock */}
              <div className="hidden lg:block bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white font-serif text-sm">⚖</span>
                  </div>
                  <span className="text-gray-900 font-semibold">LAW.AI</span>
                </div>
                
                <div className="space-y-1.5">
                  {sidebarItems.map((item, i) => (
                    <button 
                      key={item.name}
                      onClick={() => handleQuickAction(item.path)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        i === 0 
                          ? 'bg-gray-900 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Mock */}
              <div className="lg:col-span-3 space-y-5">
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stats.map((stat) => (
                    <button 
                      key={stat.label} 
                      onClick={() => handleQuickAction(stat.path)}
                      className="bg-white rounded-2xl p-5 border border-gray-100 text-left hover:border-gray-200 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                          <stat.icon size={16} className="text-gray-600" />
                        </div>
                      </div>
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900 block mb-1">{stat.value}</span>
                      <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                    </button>
                  ))}
                </div>

                {/* AI Chat Preview */}
                <div 
                  className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 sm:p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-300 group"
                  onClick={() => handleQuickAction('/ai-assistant')}
                >
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white text-xs font-medium">AI</span>
                      </div>
                      <span className="text-sm text-gray-700 font-semibold">AI Legal Assistant</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                      Try it <ArrowUpRight size={12} />
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 max-w-[85%] border border-gray-100 shadow-sm">
                      <p className="text-sm text-gray-700">What are the key provisions of Section 138 of NI Act?</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-4 ml-auto max-w-[90%] shadow-md">
                      <p className="text-sm text-gray-100 leading-relaxed">Section 138 deals with dishonour of cheques. Key provisions include: 1) Cheque must be presented within 3 months, 2) Notice must be given within 30 days of dishonour...</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <button 
                      key={action.name} 
                      onClick={() => handleQuickAction(action.path)}
                      className="bg-white hover:bg-gray-50 rounded-2xl p-5 border border-gray-200 cursor-pointer transition-all duration-300 text-center hover:border-gray-300 hover:shadow-md group"
                    >
                      <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">{action.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
