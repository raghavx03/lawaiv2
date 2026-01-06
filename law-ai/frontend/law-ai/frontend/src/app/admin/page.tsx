'use client'



import Link from 'next/link'

export default function AdminPage() {


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
            Welcome, Admin!
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