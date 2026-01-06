'use client'

import Link from 'next/link'
import { Shield, Lock, Eye, Database, UserCheck, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">{/* Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-6xl mx-auto px-6 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200/60 rounded-2xl">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-serif text-lg">⚖</span>
              </div>
              <span className="font-serif font-bold text-xl text-gray-900">LAW.AI</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Home</Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Terms</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
              <ArrowLeft size={16} />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
              <Shield size={16} className="text-green-600" />
              <span className="text-green-700 text-sm font-medium">Your Privacy Matters</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
              Privacy Policy
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              How we collect, use, and protect your personal information
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-4 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm">
            <div className="text-gray-600 leading-relaxed space-y-10">
              {/* Last Updated */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-900 font-semibold mb-1">Last Updated: January 2026</p>
                <p className="text-gray-500 text-sm">This Privacy Policy describes how LAW.AI collects, uses, and protects your information.</p>
              </div>

              {/* Information We Collect */}
              <div>
                <h2 className="text-gray-900 text-2xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Database size={20} className="text-blue-600" />
                  </div>
                  Information We Collect
                </h2>
                <div className="space-y-6 pl-2">
                  <div>
                    <h3 className="text-gray-900 font-medium mb-3">Personal Information</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                        Name, email address, and contact information
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                        Professional credentials and bar registration details
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                        Payment and billing information
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium mb-3">Usage Information</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                        Legal documents and case information you upload
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                        Search queries and AI interactions
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                        Usage patterns and feature preferences
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use */}
              <div>
                <h2 className="text-gray-900 text-2xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Eye size={20} className="text-purple-600" />
                  </div>
                  How We Use Your Information
                </h2>
                <ul className="space-y-3 text-gray-600 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    Provide and improve our AI-powered legal services
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    Process legal documents and generate insights
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    Maintain and secure your account
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    Send important updates and notifications
                  </li>
                </ul>
              </div>

              {/* Data Protection */}
              <div>
                <h2 className="text-gray-900 text-2xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Lock size={20} className="text-yellow-600" />
                  </div>
                  Data Protection & Security
                </h2>
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
                  <h3 className="text-gray-900 font-medium mb-3">Security Measures</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• End-to-end encryption for all data transmission</li>
                    <li>• Regular security audits and penetration testing</li>
                    <li>• Secure cloud infrastructure with backup systems</li>
                    <li>• Access controls and authentication protocols</li>
                  </ul>
                </div>
                <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                  <h3 className="text-gray-900 font-medium mb-3">Your Data Belongs to You</h3>
                  <p className="text-gray-600 text-sm">LAW.AI does not train AI models on your confidential client data. Your documents and case information remain private and are never shared with third parties.</p>
                </div>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className="text-gray-900 text-2xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <UserCheck size={20} className="text-indigo-600" />
                  </div>
                  Your Rights
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['Access', 'Correction', 'Deletion', 'Portability'].map((right) => (
                    <div key={right} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-gray-900 font-medium text-sm">{right}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 bg-gray-900 rounded-2xl text-white">
                <h3 className="font-semibold mb-4">Contact Us</h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p><span className="text-white">Email:</span> ragsproai@gmail.com</p>
                  <p><span className="text-white">Phone:</span> +91 8826073013</p>
                  <p><span className="text-white">Address:</span> New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
