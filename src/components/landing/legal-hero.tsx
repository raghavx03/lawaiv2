'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ArrowRight, Play, Shield, Zap, Clock } from 'lucide-react'

export function LegalHero() {
  const { user } = useAuth()
  const router = useRouter()

  const handleStartTrial = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth/signup?redirect=/dashboard')
    }
  }

  const handleWatchDemo = () => {
    const previewSection = document.getElementById('preview')
    if (previewSection) {
      previewSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const trustBadges = [
    { icon: Shield, text: 'Bank-grade security' },
    { icon: Zap, text: 'AI-powered' },
    { icon: Clock, text: '24/7 assistance' },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 bg-white overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border border-gray-200 rounded-full mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-900"></span>
          </span>
          <span className="text-gray-700 text-sm font-medium">Trusted by 500+ Legal Professionals</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6 text-gray-900 tracking-tight">
          AI Legal Assistant for
          <br />
          <span className="text-gray-900">
            Indian Lawyers & Law Firms
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Draft notices, summarize judgments, and manage cases — in minutes, not hours.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={handleStartTrial}
            className="group flex items-center gap-2.5 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-base"
          >
            {user ? 'Go to Dashboard' : 'Start Free Trial'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          
          <button 
            onClick={handleWatchDemo}
            className="group flex items-center gap-2.5 px-8 py-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md text-base"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Play size={14} className="text-gray-600 ml-0.5" fill="currentColor" />
            </div>
            See how it works
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {trustBadges.map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-2.5 text-sm text-gray-500"
            >
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <badge.icon size={16} className="text-gray-600" />
              </div>
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
