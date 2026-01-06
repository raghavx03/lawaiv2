'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SearchBar } from './search-bar'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
}

export function Hero() {
  const { user } = useAuth()
  const router = useRouter()
  
  const handleFeatureClick = (href: string) => {
    if (user) {
      router.push(href)
    } else {
      router.push(`/auth/login?redirect=${href}`)
    }
  }

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 pb-16 sm:pb-24 lg:pb-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 border border-blue-200 dark:border-blue-800">
          <span>✨</span>
          <span>AI-Powered Legal Revolution</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 leading-tight transition-colors">
          The Future of{' '}
          <span style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Legal Practice
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed transition-colors px-4 sm:px-0">
          Revolutionize your legal practice with AI-powered document analysis, 
          automated workflows, intelligent case management, and seamless client collaboration.
        </motion.p>

        {/* Professional Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-6 sm:gap-8 lg:gap-10 items-center mt-6 sm:mt-8">
          {/* Large Search Bar */}
          <SearchBar />
          
          {/* Professional Feature Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-w-2xl w-full px-4 sm:px-0">
            <button 
              onClick={() => handleFeatureClick('/ai-assistant')} 
              className="flex items-center gap-2 sm:gap-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl text-gray-700 dark:text-gray-300 font-semibold p-3 sm:p-4 rounded-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer text-xs sm:text-sm min-h-[56px] touch-manipulation"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-sm sm:text-base flex-shrink-0">🤖</div>
              <span className="truncate">AI Assistant</span>
            </button>
            
            <button 
              onClick={() => handleFeatureClick('/drafts')} 
              className="flex items-center gap-2 sm:gap-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl text-gray-700 dark:text-gray-300 font-semibold p-3 sm:p-4 rounded-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer text-xs sm:text-sm min-h-[56px] touch-manipulation"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center text-sm sm:text-base flex-shrink-0">📄</div>
              <span className="truncate">Doc Generator</span>
            </button>
            
            <button 
              onClick={() => handleFeatureClick('/summarizer')} 
              className="flex items-center gap-2 sm:gap-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl text-gray-700 dark:text-gray-300 font-semibold p-3 sm:p-4 rounded-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 cursor-pointer text-xs sm:text-sm min-h-[56px] touch-manipulation col-span-2 sm:col-span-1"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center text-sm sm:text-base flex-shrink-0">📋</div>
              <span className="truncate">Judgment Summarizer</span>
            </button>
          </div>
          
          {/* Start Free Trial Button - Smart Redirect */}
          <Link
            href={user ? "/dashboard" : "/auth/signup?redirect=/dashboard"}
            className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold text-sm sm:text-base lg:text-lg px-6 py-3 sm:px-8 sm:py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 no-underline min-h-[56px] touch-manipulation"
          >
            <span className="text-lg sm:text-xl">✨</span>
            <span>{user ? "Go to Dashboard" : "Start Free Trial"}</span>
            <span className="text-lg sm:text-xl">→</span>
          </Link>
        </motion.div>


      </motion.div>
      

    </section>
  )
}