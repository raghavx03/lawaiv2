'use client'

import { motion } from 'framer-motion'
import { Hero } from '@/components/landing/hero'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import Features from '@/components/landing/features'
import Pricing from '@/components/landing/pricing'


const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
}

export default function HomePage() {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300"
      style={{
        willChange: 'transform, opacity'
      }}
      id="main-content"
    >
      <Navbar />
      <Hero />
      
      <Features />
      <Pricing />
      
      <Footer />
    </motion.div>
  )
}