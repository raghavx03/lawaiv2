'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronRight, Sparkles, Zap, Shield, Brain, FileText, Scale, Users, Calendar, Bell, Search, BarChart3 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { LoginModal } from '@/components/ui/LoginModal'
import { useRouter } from 'next/navigation'

const features = [
  {
    icon: Brain,
    title: 'AI Legal Assistant',
    description: 'Get instant legal advice and guidance from our advanced AI chatbot trained on legal knowledge.',
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    href: '/ai-assistant',
    stats: { users: '10K+', accuracy: '95%', response: '<2s' },
    features: ['Multi-language support', 'Legal citations', 'Context awareness', '24/7 availability']
  },
  {
    icon: FileText,
    title: 'Document Analysis',
    description: 'Upload and analyze legal documents with AI-powered insights, summaries, and risk assessment.',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #10b981, #047857)',
    href: '/document-analysis',
    stats: { processed: '50K+', accuracy: '98%', time: '30s' },
    features: ['Risk assessment', 'Key clause extraction', 'Compliance check', 'Summary generation']
  },
  {
    icon: Shield,
    title: 'Contract Review',
    description: 'Automatically detect risky clauses and get suggestions for contract improvements.',
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    href: '/contract-review',
    stats: { contracts: '25K+', risks: '99%', saved: '$2M+' },
    features: ['Risk detection', 'Clause suggestions', 'Version comparison', 'Legal compliance']
  },
  {
    icon: Search,
    title: 'Legal Research',
    description: 'Search and analyze case laws, legal precedents, and regulations with AI assistance.',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    href: '/research',
    stats: { cases: '1M+', acts: '500+', citations: '100K+' },
    features: ['Case law search', 'Precedent analysis', 'Citation tracking', 'Legal database']
  },
  {
    icon: Zap,
    title: 'Document Generator',
    description: 'Generate legal documents like NDAs, contracts, and affidavits using AI templates.',
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    href: '/drafts',
    stats: { generated: '75K+', templates: '50+', time: '5min' },
    features: ['Smart templates', 'Auto-fill', 'Legal compliance', 'PDF export']
  },
  {
    icon: Scale,
    title: 'Judgment Summarizer',
    description: 'Upload PDF judgments and get AI-powered summaries with key legal principles.',
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    href: '/summarizer',
    stats: { judgments: '30K+', accuracy: '96%', time: '1min' },
    features: ['Key principle extraction', 'Case summary', 'Citation analysis', 'Precedent mapping']
  },
  {
    icon: BarChart3,
    title: 'Case Tracker',
    description: 'Track court cases by CNR number and get real-time status updates.',
    color: '#6366f1',
    bgGradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    href: '/case-tracker',
    stats: { cases: '15K+', courts: '200+', updates: 'Real-time' },
    features: ['CNR tracking', 'Status updates', 'Court notifications', 'Case analytics']
  },
  {
    icon: Users,
    title: 'CRM System',
    description: 'Manage appointments, tasks, and client relationships efficiently.',
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    href: '/crm',
    stats: { clients: '5K+', appointments: '20K+', efficiency: '+40%' },
    features: ['Client management', 'Appointment scheduling', 'Task tracking', 'Communication hub']
  },
  {
    icon: Bell,
    title: 'Legal Notices',
    description: 'Generate professional legal notices with AI assistance.',
    color: '#84cc16',
    bgGradient: 'linear-gradient(135deg, #84cc16, #65a30d)',
    href: '/notices',
    stats: { notices: '8K+', templates: '25+', delivery: '99%' },
    features: ['Notice templates', 'Legal formatting', 'Delivery tracking', 'Response management']
  }
]

interface FeatureCardProps {
  feature: typeof features[0]
  index: number
  isVisible: boolean
}

function FeatureCard({ feature, index, isVisible }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const handleCloseModal = () => {
    setShowLoginModal(false)
  }
  const cardRef = useRef<HTMLDivElement>(null)
  const IconComponent = feature.icon
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!cardRef.current) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          cardRef.current?.style.setProperty('--animate-delay', `${index * 100}ms`)
          cardRef.current?.classList.add('animate-in')
        }
      },
      { threshold: 0.1 }
    )
    
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isExpanded) {
      if (user) {
        router.push(feature.href)
      } else {
        setShowLoginModal(true)
      }
    } else {
      setIsExpanded(true)
    }
  }

  return (
    <div
      ref={cardRef}
      className="feature-card bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/30 transition-all duration-300"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-4 sm:p-6 lg:p-8 ${isExpanded ? 'lg:p-10' : ''} transition-all duration-400 cursor-pointer relative overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/30 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        boxShadow: isHovered 
          ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 15px 30px -6px ${feature.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.4)`
          : `0 10px 25px -6px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
        transform: isHovered 
          ? 'translateY(-8px) scale(1.02)'
          : 'translateY(0) scale(1)',
        minHeight: isExpanded ? '400px' : '280px',
        animationDelay: 'var(--animate-delay, 0ms)'
      }}
    >
      {/* Animated Background Gradient */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 rounded-t-2xl sm:rounded-t-3xl transition-transform duration-300"
        style={{
          background: feature.bgGradient,
          transform: isHovered ? 'scaleX(1.05)' : 'scaleX(1)'
        }} 
      />

      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        borderRadius: '2rem'
      }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: feature.color,
              borderRadius: '50%',
              opacity: isHovered ? 0.6 : 0,
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              transform: isHovered ? `translateY(-${20 + i * 10}px) scale(${1 + i * 0.2})` : 'translateY(0) scale(1)',
              transition: `all ${0.6 + i * 0.1}s cubic-bezier(0.4, 0, 0.2, 1)`,
              animationDelay: `${i * 100}ms`
            }}
          />
        ))}
      </div>

      {/* 3D Icon Container */}
      <div 
        className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 relative transition-all duration-400"
        style={{
          background: feature.bgGradient,
          boxShadow: `0 10px 20px ${feature.color}40, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
          transform: isHovered ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)'
        }}
      >
        <IconComponent 
          size={window.innerWidth < 640 ? 20 : window.innerWidth < 1024 ? 24 : 28} 
          color="white" 
          className="drop-shadow-sm transition-transform duration-300"
          style={{
            transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)'
          }}
        />
        
        {/* Icon Glow Effect */}
        <div 
          className="absolute -inset-2 sm:-inset-3 rounded-2xl sm:rounded-3xl blur-xl transition-opacity duration-300 -z-10"
          style={{
            background: feature.bgGradient,
            opacity: isHovered ? 0.2 : 0
          }} 
        />
      </div>

      {/* Content */}
      <div className="transition-transform duration-400">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold leading-tight transition-all duration-300 text-gray-900 dark:text-gray-100 ${
            isHovered ? 'bg-gradient-to-r bg-clip-text text-transparent' : ''
          }`}
          style={{
            backgroundImage: isHovered ? feature.bgGradient : 'none'
          }}>
            {feature.title}
          </h3>
          
          <div className={`flex items-center gap-1 sm:gap-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-70'
          }`}>
            <Sparkles size={window.innerWidth < 640 ? 14 : 16} color={feature.color} />
            <ChevronRight 
              size={window.innerWidth < 640 ? 18 : 20} 
              color={feature.color}
              className="transition-transform duration-300"
              style={{
                transform: isHovered ? 'translateX(2px)' : 'translateX(0)'
              }}
            />
          </div>
        </div>

        <p className={`text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed transition-all duration-300 ${
          isExpanded ? 'mb-6 sm:mb-8' : 'mb-4 sm:mb-6'
        }`}>
          {feature.description}
        </p>



        {/* Feature List */}
        <div className={`transition-all duration-300 delay-200 ${
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
            Key Features:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {feature.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: feature.color }}
                />
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holographic Shine Effect */}
      <div 
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
          transform: isHovered 
            ? 'translateX(100%) translateY(100%) rotate(45deg)' 
            : 'translateX(-100%) translateY(-100%) rotate(45deg)',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      
      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={handleCloseModal}
          redirectTo={feature.href}
        />
      )}
    </div>
  )
}

function Features() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(features.length).fill(false))
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the animation of cards
            features.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => {
                  const newVisible = [...prev]
                  newVisible[index] = true
                  return newVisible
                })
              }, index * 150)
            })
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={sectionRef}
      id="features" 
      className="py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-300"
    >
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
        `,
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0
      }} />

      {/* Grid Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        zIndex: 0
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 dark:bg-blue-400/10 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border border-blue-500/20 dark:border-blue-400/20 mb-6 sm:mb-8">
            <Sparkles size={16} color="#3b82f6" />
            <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold">
              AI-Powered Legal Solutions
            </span>
          </div>
          
          <h2 className="text-white dark:text-gray-100 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-blue-400 bg-clip-text text-transparent">
              Revolutionary Features for
            </span>
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Modern Law Firms
            </span>
          </h2>
          
          <p className="text-slate-300 dark:text-gray-300 text-base sm:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
            Transform your legal practice with cutting-edge AI technology, streamlined workflows, 
            and intelligent automation that delivers exceptional results.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-16 sm:mb-20 lg:mb-24">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              isVisible={visibleCards[index] || false}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/10 dark:border-white/10 shadow-2xl relative overflow-hidden">
          {/* CTA Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 -z-10" />

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Stop Missing Critical Case Details
            </span>
          </h3>
          
          <p className="text-slate-300 dark:text-gray-300 mb-6 sm:mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed text-sm sm:text-base lg:text-lg px-4 sm:px-0">
            <strong style={{color: '#f59e0b'}}>The Problem:</strong> Manual document review causes 67% of lawyers to miss key precedents, 
            leading to weaker arguments. <strong style={{color: '#10b981'}}>Our Solution:</strong> AI scans 1000+ cases in seconds, 
            finds relevant precedents, and builds stronger legal arguments automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button 
              onClick={() => window.location.href = '/auth/signup'}
              className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-sm sm:text-base lg:text-lg border-none cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 min-h-[56px] touch-manipulation w-full sm:w-auto"
            >
              <Zap size={20} />
              Start Free Trial
            </button>
            
            <button 
              onClick={() => window.location.href = '/contact'}
              className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-white/10 dark:bg-gray-700/30 text-white dark:text-gray-100 border-2 border-white/20 dark:border-gray-600/30 hover:bg-white/20 dark:hover:bg-gray-600/40 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-sm sm:text-base lg:text-lg cursor-pointer transition-all duration-300 min-h-[56px] touch-manipulation w-full sm:w-auto"
            >
              <Calendar size={20} />
              Schedule Demo
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(-10px) rotate(-1deg); }
        }
        
        .feature-card {
          opacity: 0;
          transform: translateY(50px) scale(0.9);
          animation: none;
        }
        
        .feature-card.animate-in {
          animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @media (max-width: 640px) {
          .feature-card {
            min-height: 320px !important;
            padding: 1.5rem !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 768px) {
          .feature-card {
            min-height: 360px !important;
          }
        }
      `}</style>
    </section>
  )
}

export default Features