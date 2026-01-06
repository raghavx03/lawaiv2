'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export function CTA() {
  const { user } = useAuth()
  
  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/auth/signup'
    }
  }
  
  return (
    <section style={{
      padding: '5rem 0',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
        `,
        zIndex: 0
      }}></div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1.5rem',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
          }}>
            Stop Losing Cases Due to Manual Errors
          </h2>
          
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '2.5rem',
            maxWidth: '700px',
            margin: '0 auto 2.5rem auto',
            lineHeight: '1.6',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <strong>Real Problem:</strong> 73% of legal professionals spend 4+ hours daily on document review, 
            missing critical case details. <strong>Our Solution:</strong> AI instantly analyzes 500+ page judgments 
            in 30 seconds, highlights key precedents, and generates case briefs with 99.2% accuracy.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '3rem'
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'white',
                color: '#3b82f6',
                fontWeight: '600',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                transform: 'translateY(0)',
                fontSize: '1.125rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.background = '#f8fafc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)'
                e.currentTarget.style.background = 'white'
              }}
            >
              <span>{user ? 'Go to Dashboard' : 'Start Your Free Trial'}</span>
              <span>→</span>
            </button>
            
            <Link
              href="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                fontWeight: '600',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '1.125rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span>Schedule a Demo</span>
            </Link>
          </div>

          {/* Real Results */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}>
                ⚡
              </div>
              <span>Save 15+ Hours Weekly</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}>
                📈
              </div>
              <span>Win 40% More Cases</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}>
                💰
              </div>
              <span>Increase Revenue 3x</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}