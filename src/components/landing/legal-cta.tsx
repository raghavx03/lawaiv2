'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { ArrowRight, Sparkles } from 'lucide-react'

export function LegalCTA() {
  const { user } = useAuth()

  return (
    <section className="relative py-24 sm:py-32 bg-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-800/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-800/30 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-8">
            <Sparkles size={16} className="text-white/80" />
            <span className="text-white/80 text-sm font-medium">Join 500+ legal professionals</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 tracking-tight">
            Ready to simplify your legal work?
          </h2>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of legal professionals who are saving hours every week with AI-powered legal assistance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? "/dashboard" : "/auth/signup"}
              className="group flex items-center gap-2.5 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-2xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            
            <Link
              href="/contact"
              className="px-8 py-4 bg-transparent hover:bg-white/10 border border-gray-700 hover:border-gray-600 text-white font-medium rounded-2xl transition-all duration-300 text-lg block"
            >
              Contact Sales
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-10">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
