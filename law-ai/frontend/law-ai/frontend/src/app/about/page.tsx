'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200/80 dark:border-gray-700/80 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                ⚖
              </div>
              <span className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-gray-100 transition-colors">
                LAW.AI
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 no-underline transition-colors font-medium">Home</Link>
              <Link href="/about" className="text-blue-600 dark:text-blue-400 no-underline transition-colors font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 no-underline transition-colors font-medium">Contact</Link>
              <Link href="/auth/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 no-underline transition-colors font-medium">Login</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">
              About LAW.AI
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto transition-colors">
              Empowering legal professionals with AI-driven solutions that save time, reduce errors, and deliver superior client outcomes.
            </p>
          </section>

          {/* Mission & Vision */}
          <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-300">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 transition-colors">
              Our Mission
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6 transition-colors">
              LAW.AI transforms legal practice by eliminating the 15+ hours lawyers spend weekly on manual document review. 
              Our AI instantly analyzes complex legal documents, identifies critical precedents, and generates accurate case briefs—
              helping legal professionals win 40% more cases while increasing their revenue by 3x.
            </p>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
              We believe every lawyer deserves access to cutting-edge technology that enhances their expertise, 
              not replaces it. From judgment summarization to contract analysis, LAW.AI serves as your intelligent legal assistant.
            </p>
          </section>

          {/* Key Benefits */}
          <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-300">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 transition-colors">
              Why Choose LAW.AI?
            </h2>
            <ul className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed list-none p-0 space-y-4 transition-colors">
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl mt-0.5 flex-shrink-0">✓</span>
                <span><strong className="text-gray-900 dark:text-gray-100">Save 15+ Hours Weekly:</strong> Automated document analysis and case research</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl mt-0.5 flex-shrink-0">✓</span>
                <span><strong className="text-gray-900 dark:text-gray-100">99.2% Accuracy:</strong> AI-powered legal insights with human-level precision</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl mt-0.5 flex-shrink-0">✓</span>
                <span><strong className="text-gray-900 dark:text-gray-100">Comprehensive Suite:</strong> 9 integrated tools from case tracking to document generation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl mt-0.5 flex-shrink-0">✓</span>
                <span><strong className="text-gray-900 dark:text-gray-100">Secure & Compliant:</strong> Bank-grade security with legal industry standards</span>
              </li>
            </ul>
          </section>

          {/* Creator Section */}
          <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 lg:p-10 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-15 h-15 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                RS
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1 transition-colors">
                  Made by Raghav Shah
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base transition-colors">
                  AI Innovation Specialist & Legal Tech Entrepreneur
                </p>
              </div>
            </div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
              Raghav Shah combines deep expertise in artificial intelligence with a passion for legal innovation. 
              Through his agency, he has helped numerous law firms modernize their practice with cutting-edge AI solutions, 
              delivering measurable results and competitive advantages in today's digital legal landscape.
            </p>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 sm:p-12 rounded-2xl text-center text-white shadow-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4">
              Ready to Transform Your Legal Practice?
            </h2>
            <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of legal professionals already using LAW.AI to deliver better results for their clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard" className="bg-white text-blue-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold no-underline hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[48px] flex items-center justify-center touch-manipulation">
                Go to Dashboard
              </Link>
              <Link href="/contact" className="bg-transparent text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold no-underline border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200 min-h-[48px] flex items-center justify-center touch-manipulation">
                Schedule Demo
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}