'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

// Add your admin emails here
const ADMIN_EMAILS = [
  'raghav@ragspro.com',
  'admin@lawai.in',
]

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [loading, user, router])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-500">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) return null

  // Check admin access
  const isAdmin = ADMIN_EMAILS.includes(user.email || '') || (profile?.plan as string) === 'ADMIN'

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div style={{
          textAlign: 'center',
          maxWidth: '400px',
          background: 'white',
          borderRadius: '1rem',
          padding: '3rem 2rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '1.5rem'
          }}>
            🔒
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            Access Denied
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.95rem' }}>
            You don&#39;t have admin privileges. Contact the administrator if you believe this is an error.
          </p>
          <Link href="/dashboard" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.95rem'
          }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}>
            Admin Dashboard
          </h1>
          <p style={{
            fontSize: '1.125rem',
            marginBottom: '0.5rem',
            opacity: 0.9
          }}>
            Welcome, {profile?.fullName || user.email}!
          </p>
          <p style={{
            fontSize: '0.875rem',
            opacity: 0.7
          }}>
            Role: admin
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/dashboard" style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            Main Dashboard
          </Link>
          <Link href="/about" style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            About
          </Link>
          <Link href="/contact" style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            Contact
          </Link>

        </div>
      </div>

      {/* Content */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
          Admin Controls
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {[
            { title: 'User Management', desc: 'Manage users and roles', icon: '👥' },
            { title: 'System Settings', desc: 'Configure system settings', icon: '⚙️' },
            { title: 'Analytics', desc: 'View system analytics', icon: '📈' },
            { title: 'Reports', desc: 'Generate reports', icon: '📄' }
          ].map((feature, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}