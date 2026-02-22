'use client'

import Link from 'next/link'
import { Scale, Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">LAW.AI</span>
            </Link>
            <p className="text-sm text-gray-600 mb-4">
              India's #1 AI-powered legal assistant for lawyers. Trusted by 10,000+ advocates.
            </p>
            <div className="flex gap-3">
              <a href="https://x.com/ragsproai" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Twitter className="h-4 w-4 text-gray-600" />
              </a>
              <a href="https://www.linkedin.com/in/ragspro" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Linkedin className="h-4 w-4 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ai-assistant" className="text-gray-600 hover:text-gray-900">AI Legal Assistant</Link></li>
              <li><Link href="/drafts" className="text-gray-600 hover:text-gray-900">Document Generator</Link></li>
              <li><Link href="/summarizer" className="text-gray-600 hover:text-gray-900">Judgment Summarizer</Link></li>
              <li><Link href="/case-tracker" className="text-gray-600 hover:text-gray-900">Case Tracker</Link></li>
              <li><Link href="/research" className="text-gray-600 hover:text-gray-900">Legal Research</Link></li>
              <li><Link href="/crm" className="text-gray-600 hover:text-gray-900">Client CRM</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link></li>
              <li><Link href="/indian-law-ai" className="text-gray-600 hover:text-gray-900">Indian Law AI</Link></li>
              <li><Link href="/acts" className="text-gray-600 hover:text-gray-900">Bare Acts</Link></li>
              <li><Link href="/news" className="text-gray-600 hover:text-gray-900">Legal News</Link></li>
              <li><Link href="/help/user-guide" className="text-gray-600 hover:text-gray-900">User Guide</Link></li>
              <li><Link href="/help/tutorials" className="text-gray-600 hover:text-gray-900">Tutorials</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
              <li><Link href="/founder" className="text-gray-600 hover:text-gray-900">Founder</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} LAW.AI. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Developed by <a href="https://ragspro.com" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline font-medium">RAGSPRO</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
