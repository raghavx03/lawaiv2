'use client'

import { FileText, AlertTriangle, Scale, Users, CreditCard, Ban } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/5 dark:bg-gray-900/20 backdrop-blur-xl border-b border-white/10 dark:border-gray-700/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">
                ⚖
              </div>
              <span className="font-bold text-lg sm:text-xl lg:text-2xl text-white">
                LAW.AI
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/" className="text-slate-300 hover:text-white no-underline transition-colors font-medium">Home</Link>
              <Link href="/privacy" className="text-slate-300 hover:text-white no-underline transition-colors font-medium">Privacy Policy</Link>
              <Link href="/terms" className="text-amber-400 no-underline transition-colors font-semibold">Terms of Service</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 mb-6">
              <Scale size={16} className="text-amber-400" />
              <span className="text-amber-400 text-sm font-semibold">
                Legal Agreement
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent">
              📋 Terms of Service
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Legal terms and conditions for using LAW.AI services
            </p>
          </div>

          {/* Content */}
          <div className="bg-white/5 dark:bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 sm:p-8 lg:p-12 border border-white/10 dark:border-gray-700/30 transition-colors duration-300">
            <div className="text-slate-300 leading-relaxed space-y-8">
              <div className="p-6 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <p className="text-amber-400 font-semibold mb-2">Last Updated: January 2025</p>
                <p className="text-slate-300 text-sm">By accessing and using LAW.AI services, you agree to be bound by these Terms of Service.</p>
              </div>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                  <FileText size={24} className="text-blue-400" />
                  Service Description
                </h2>
                <div className="pl-6 space-y-4">
                  <p>LAW.AI provides AI-powered legal technology services including:</p>
                  <ul className="space-y-2 pl-6 list-disc list-inside">
                    <li>Legal document analysis and generation</li>
                    <li>AI-powered legal research and case law search</li>
                    <li>Contract review and risk assessment</li>
                    <li>Legal practice management tools</li>
                    <li>Court case tracking and updates</li>
                  </ul>
                  <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    <p className="text-red-400 text-sm font-semibold">
                      Important: LAW.AI provides technology tools and does not constitute legal advice. Always consult with qualified legal professionals for legal matters.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                  <Users size={24} className="text-green-400" />
                  User Responsibilities
                </h2>
                <div className="pl-6 space-y-6">
                  <div>
                    <h3 className="text-amber-400 text-lg font-semibold mb-3">Account Security</h3>
                    <ul className="space-y-2 pl-6 list-disc list-inside">
                      <li>Maintain confidentiality of your account credentials</li>
                      <li>Notify us immediately of any unauthorized access</li>
                      <li>Provide accurate and up-to-date information</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-amber-400 text-lg font-semibold mb-3">Acceptable Use</h3>
                    <ul className="space-y-2 pl-6 list-disc list-inside">
                      <li>Use services only for lawful purposes</li>
                      <li>Respect intellectual property rights</li>
                      <li>Do not attempt to reverse engineer our AI systems</li>
                      <li>Comply with all applicable laws and regulations</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                  <CreditCard size={24} className="text-purple-400" />
                  Payment Terms
                </h2>
                <div className="pl-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                      <h3 className="text-blue-400 font-semibold mb-3">Subscription Plans</h3>
                      <ul className="space-y-1 text-sm">
                        <li>Monthly and annual billing options</li>
                        <li>Automatic renewal unless cancelled</li>
                        <li>Pro-rated charges for upgrades</li>
                      </ul>
                    </div>
                    <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/20">
                      <h3 className="text-green-400 font-semibold mb-3">Refund Policy</h3>
                      <ul className="space-y-1 text-sm">
                        <li>30-day money-back guarantee</li>
                        <li>Refunds processed within 5-7 business days</li>
                        <li>Usage-based refunds for annual plans</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    All payments are processed securely through our certified payment partners. We do not store your payment information on our servers.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle size={24} className="text-red-400" />
                  Limitations & Disclaimers
                </h2>
                <div className="pl-6 space-y-6">
                  <div className="bg-red-500/10 p-8 rounded-xl border border-red-500/20">
                    <h3 className="text-red-400 text-lg font-semibold mb-4">Service Limitations</h3>
                    <ul className="space-y-3">
                      <li><strong className="text-white">No Legal Advice:</strong> Our AI tools provide information and assistance but do not constitute legal advice</li>
                      <li><strong className="text-white">Accuracy:</strong> While we strive for accuracy, AI-generated content may contain errors</li>
                      <li><strong className="text-white">Jurisdiction:</strong> Legal information may not apply to all jurisdictions</li>
                      <li><strong className="text-white">Professional Review:</strong> Always have legal documents reviewed by qualified attorneys</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-amber-400 text-lg font-semibold mb-3">Liability Limitations</h3>
                    <p>
                      LAW.AI's liability is limited to the amount paid for services in the 12 months preceding any claim. 
                      We are not liable for indirect, incidental, or consequential damages.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                  <Ban size={24} className="text-orange-400" />
                  Termination
                </h2>
                <div className="pl-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-amber-400 font-semibold mb-2">By You</h3>
                      <p className="text-sm">Cancel your subscription anytime through your account settings</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-amber-400 font-semibold mb-2">By Us</h3>
                      <p className="text-sm">We may terminate accounts for violations of these terms</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-amber-400 font-semibold mb-2">Data Retention</h3>
                      <p className="text-sm">Your data will be deleted within 30 days of termination</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6">Governing Law</h2>
                <div className="bg-purple-500/10 p-8 rounded-xl border border-purple-500/20">
                  <p className="mb-4">
                    These Terms of Service are governed by the laws of India without regard to conflict of law principles. 
                    Any disputes will be resolved through binding arbitration.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong className="text-white">Questions about these terms?</strong></p>
                    <p><strong className="text-white">Email:</strong> ragsproai@gmail.com</p>
                    <p><strong className="text-white">Phone:</strong> +91 8700048490</p>
                    <p><strong className="text-white">Address:</strong> South West Delhi, India</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}