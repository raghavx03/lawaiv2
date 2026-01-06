'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { UserPlus, MousePointer, Zap, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create your account',
    description: 'Sign up and access your legal workspace instantly. No credit card required.'
  },
  {
    number: '02',
    icon: MousePointer,
    title: 'Choose a tool',
    description: 'Draft, summarize, or research — all from one intuitive dashboard.'
  },
  {
    number: '03',
    icon: Zap,
    title: 'Get results',
    description: 'Save hours on every case with AI-powered legal assistance.'
  }
]

export function LegalHowItWorks() {
  const { user } = useAuth()

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-600 text-sm font-medium mb-6 shadow-sm">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Get started in
              <span className="block">3 simple steps</span>
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              No complex setup. No learning curve. Start using AI for your legal work in minutes.
            </p>

            <Link
              href={user ? "/dashboard" : "/auth/signup"}
              className="group inline-flex items-center gap-2.5 px-7 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create account now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {/* Right Steps */}
          <div className="space-y-5">
            {steps.map((step, index) => (
              <div key={step.number} className="group relative">
                <div className="flex gap-5 p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                  {/* Number */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                      <span className="text-gray-600 font-bold text-lg group-hover:text-white transition-colors duration-300">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-3">
                      {step.title}
                      <step.icon size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-[15px]">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[2.75rem] top-[5.5rem] w-0.5 h-5 bg-gray-200 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
