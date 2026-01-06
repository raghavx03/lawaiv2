'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Home, HelpCircle } from 'lucide-react'
import Link from 'next/link'

interface NavigationHeaderProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  badges?: Array<{ label: string; icon?: React.ReactNode; color: string }>
  helpText?: string
}

export function NavigationHeader({ title, subtitle, icon, badges = [], helpText }: NavigationHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            {/* Back to Dashboard Button */}
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2 bg-white/80 hover:bg-white border-gray-200 hover:border-blue-300 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </motion.div>
            </Link>
            
            {/* Feature Icon and Title */}
            <motion.div 
              className="p-3 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut"
              }}
            >
              {icon}
            </motion.div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">{subtitle}</p>
            </div>
          </div>
          
          {/* Badges and Help */}
          <div className="flex items-center space-x-3">
            {badges.map((badge, index) => (
              <Badge 
                key={index}
                variant="secondary" 
                className={`px-3 py-2 ${badge.color} hidden sm:flex items-center space-x-1`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </Badge>
            ))}
            
            {helpText && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500 hover:text-blue-600"
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