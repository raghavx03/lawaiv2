'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import Link from 'next/link'

interface NavigationHeaderProps {
  title: string
  subtitle?: string
  helpText?: string
}

export function NavigationHeader({ title, subtitle, helpText }: NavigationHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px] border-b border-white/20 dark:border-gray-700/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8_1px_32px_rgba(0,0,0,0.3)]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-300 p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {helpText && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title={helpText}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}