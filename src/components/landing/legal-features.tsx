'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FileText, Brain, Scale, Shield, ArrowUpRight } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Smart Drafting',
    description: 'Legal notices, agreements, affidavits — generated in seconds with AI precision.',
    path: '/drafts'
  },
  {
    icon: Brain,
    title: 'Judgment Summarizer',
    description: 'Long PDFs transformed into short, actionable insights instantly.',
    path: '/summarizer'
  },
  {
    icon: Scale,
    title: 'AI Legal Assistant',
    description: 'Ask questions, get Indian-law aware answers with relevant citations.',
    path: '/ai-assistant'
  },
  {
    icon: Shield,
    title: 'Case Tracker',
    description: 'Track court cases by CNR number and get real-time status updates.',
    path: '/case-tracker'
  }
]

export function LegalFeatures() {
  const { user } = useAuth()
  const router = useRouter()

  const handleFeatureClick = (path: string) => {
    if (user) {
      router.push(path)
    } else {
      router.push(`/auth/login?redirect=${path}`)
    }
  }

  return (
    <section id="features" className="relative py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="inline-block px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-600 text-sm font-medium mb-6">
            Why Choose LAW.AI
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-5 tracking-tight">
            Built for Modern Legal Practice
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to streamline your legal workflow in one powerful platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group cursor-pointer"
              onClick={() => handleFeatureClick(feature.path)}
            >
              <div className="relative bg-white rounded-2xl border border-gray-200 p-7 h-full hover:border-gray-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-gray-900 transition-all duration-300">
                  <feature.icon size={26} className="text-gray-600 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-5 text-[15px]">
                  {feature.description}
                </p>
                
                {/* Try Now Link */}
                <div className="flex items-center gap-1.5 text-sm text-gray-400 group-hover:text-gray-900 transition-colors duration-300">
                  <span className="font-medium">Try now</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
