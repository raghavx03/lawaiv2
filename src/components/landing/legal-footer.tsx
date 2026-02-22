'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const navigation = {
  product: [
    { name: 'AI Assistant', href: '/ai-assistant', protected: true },
    { name: 'Document Generator', href: '/drafts', protected: true },
    { name: 'Judgment Summarizer', href: '/summarizer', protected: true },
    { name: 'Case Tracker', href: '/case-tracker', protected: true },
  ],
  tools: [
    { name: 'Legal Research', href: '/research', protected: true },
    { name: 'Legal Notices', href: '/notices', protected: true },
    { name: 'CRM System', href: '/crm', protected: true },
    { name: 'Legal News', href: '/news', protected: true },
  ],
  company: [
    { name: 'About', href: '/about', protected: false },
    { name: 'Contact', href: '/contact', protected: false },
    { name: 'Blog', href: '/blog', protected: false },
    { name: 'Meet the Founder', href: '/founder', protected: false },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy', protected: false },
    { name: 'Terms of Service', href: '/terms', protected: false },
    { name: 'Sign In', href: '/auth/login', protected: false },
    { name: 'Sign Up', href: '/auth/signup', protected: false },
  ],
}

export function LegalFooter() {
  const { user } = useAuth()
  const router = useRouter()

  const handleLinkClick = (href: string, isProtected: boolean) => {
    if (isProtected && !user) {
      router.push(`/auth/login?redirect=${href}`)
      return
    }
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      element?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    router.push(href)
  }

  return (
    <footer className="bg-white px-4 sm:px-6 lg:px-8 pb-4">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-20 bg-gray-50 rounded-3xl border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-serif text-lg">⚖</span>
              </div>
              <span className="font-serif font-bold text-xl text-gray-900">LAW.AI</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              AI-powered legal assistant for Indian lawyers and law firms.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/ragsproai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/ragspro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="mailto:ragsproai@gmail.com"
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          {Object.entries(navigation).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-5">
                {category}
              </h3>
              <ul className="space-y-3.5">
                {links.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleLinkClick(item.href, item.protected)}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 text-left"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 LAW.AI. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Developed by</span>
              <a
                href="https://ragspro.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 hover:underline"
              >
                RAGSPRO
              </a>
              <span>•</span>
              <span>Professional Legal Solutions</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
