'use client'

import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function PrivacyPage() {
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
              <Link href="/privacy" className="text-green-400 no-underline transition-colors font-semibold">Privacy Policy</Link>
              <Link href="/terms" className="text-slate-300 hover:text-white no-underline transition-colors font-medium">Terms of Service</Link>
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
            <div className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 mb-6">
              <Shield size={16} className="text-green-400" />
              <span className="text-green-400 text-sm font-semibold">
                Your Privacy Matters
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
              🔒 Privacy Policy
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              How we collect, use, and protect your personal information
            </p>
          </div>

          {/* Content */}
          <div className="bg-white/5 dark:bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 sm:p-8 lg:p-12 border border-white/10 dark:border-gray-700/30 transition-colors duration-300">
            <div className="text-slate-300 leading-relaxed space-y-8">
              <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/20">
                <p className="text-green-400 font-semibold mb-2">Last Updated: January 2025</p>
                <p className="text-slate-300 text-sm">This Privacy Policy describes how LAW.AI collects, uses, and protects your information when you use our services.</p>
              </div>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                  <Database size={24} className="text-blue-400" />
                  Information We Collect
                </h2>
                <div className="pl-6 space-y-6">
                  <div>
                    <h3 className="text-green-400 text-lg font-semibold mb-3">Personal Information</h3>
                    <ul className="space-y-2 pl-6 list-disc list-inside">
                      <li>Name, email address, and contact information</li>
                      <li>Professional credentials and bar registration details</li>
                      <li>Payment and billing information</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-green-400 text-lg font-semibold mb-3">Usage Information</h3>
                    <ul className="space-y-2 pl-6 list-disc list-inside">
                      <li>Legal documents and case information you upload</li>
                      <li>Search queries and AI interactions</li>
                      <li>Usage patterns and feature preferences</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                  <Eye size={24} className="text-purple-400" />
                  How We Use Your Information
                </h2>
                <div className="pl-6">
                  <ul className="space-y-3 pl-6 list-disc list-inside">
                    <li>Provide and improve our AI-powered legal services</li>
                    <li>Process legal documents and generate insights</li>
                    <li>Maintain and secure your account</li>
                    <li>Send important updates and notifications</li>
                    <li>Comply with legal and regulatory requirements</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                  <Lock size={24} className="text-yellow-400" />
                  Data Protection & Security
                </h2>
                <div className="pl-6 space-y-6">
                  <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                    <h3 className="text-blue-400 text-lg font-semibold mb-3">Security Measures</h3>
                    <ul className="space-y-2 pl-6 list-disc list-inside">
                      <li>End-to-end encryption for all data transmission</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>Secure cloud infrastructure with backup systems</li>
                      <li>Access controls and authentication protocols</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-green-400 text-lg font-semibold mb-3">Data Retention</h3>
                    <p>We retain your personal information only as long as necessary to provide our services and comply with legal obligations. You can request deletion of your data at any time.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                  <UserCheck size={24} className="text-indigo-400" />
                  Your Rights
                </h2>
                <div className="pl-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-green-400 font-semibold mb-2">Access</h3>
                      <p className="text-sm">Request access to your personal data</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-green-400 font-semibold mb-2">Correction</h3>
                      <p className="text-sm">Update or correct your information</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-green-400 font-semibold mb-2">Deletion</h3>
                      <p className="text-sm">Request deletion of your data</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-green-400 font-semibold mb-2">Portability</h3>
                      <p className="text-sm">Export your data in a portable format</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6">Contact Us</h2>
                <div className="bg-blue-500/10 p-8 rounded-xl border border-blue-500/20">
                  <p className="mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
                  <div className="space-y-2">
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