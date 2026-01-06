'use client'

import Link from 'next/link'
import { FileText, AlertTriangle, Scale, Users, CreditCard, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
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
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Privacy</Link>
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
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-6">
              <Scale size={16} className="text-amber-600" />
              <span className="text-amber-700 text-sm font-medium">Legal Agreement</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
              Terms of Service
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Legal terms and conditions for using LAW.AI services
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
                <p className="text-gray-900 font-semibold mb-1">Last Updated: January 2025</p>
                <p className="text-gray-500 text-sm">By using LAW.AI services, you agree to be bound by these Terms of Service.</p>
              </div>

              {/* Service Description */}
              <div>
                <h2 className="text-gray-900 text-2xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  Service Description
                </h2>
                <p className="mb-4">LAW.AI provides AI-powered legal technology services including:</p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    Legal document analysis and generation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    AI-powered legal research and case law search
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    Contract review and risk assessment
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    Court case tracking and updates
                  </li>
                </ul>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-red-700 text-sm font-medium">
                    Important: LAW.AI provides technology tools and does not constitute legal advice. Always consult with qualified legal professionals.
                  </p>
                </div>
              </div>

              {/* User Responsibilities */}
              <div>
                <h2 className="text-gray-900 text-2xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Users size={20} className="text-green-600" />
                  </div>
                  User Responsibilities
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-gray-900 font-medium mb-3">Account Security</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li>• Maintain confidentiality of your account credentials</li>
                      <li>• Notify us immediately of any unauthorized access</li>
                      <li>• Provide accurate and up-to-date information</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium mb-3">Acceptable Use</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li>• Use services only for lawful purposes</li>
                      <li>• Respect intellectual property rights</li>
                      <li>• Comply with all applicable laws and regulations</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <h2 className="text-gray-900 text-2xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <CreditCard size={20} className="text-purple-600" />
                  </div>
                  Payment Terms
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="text-gray-900 font-medium mb-2">Subscription Plans</h3>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• Monthly and annual billing</li>
                      <li>• Automatic renewal</li>
                      <li>• Pro-rated charges for upgrades</li>
                    </ul>
                  </div>
                  <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                    <h3 className="text-gray-900 font-medium mb-2">Refund Policy</h3>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• 30-day money-back guarantee</li>
                      <li>• Refunds within 5-7 business days</li>
                      <li>• Cancel anytime</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Limitations */}
              <div>
                <h2 className="text-gray-900 text-2xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-600" />
                  </div>
                  Limitations & Disclaimers
                </h2>
                <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li><strong>No Legal Advice:</strong> Our AI tools provide information but do not constitute legal advice</li>
                    <li><strong>Accuracy:</strong> While we strive for accuracy, AI-generated content may contain errors</li>
                    <li><strong>Jurisdiction:</strong> Legal information may not apply to all jurisdictions</li>
                    <li><strong>Professional Review:</strong> Always have legal documents reviewed by qualified attorneys</li>
                  </ul>
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 bg-gray-900 rounded-2xl text-white">
                <h3 className="font-semibold mb-4">Questions about these terms?</h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p><span className="text-white">Email:</span> ragsproai@gmail.com</p>
                  <p><span className="text-white">Phone:</span> +91 8826073013</p>
                  <p><span className="text-white">Address:</span> South West Delhi, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
