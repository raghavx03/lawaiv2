'use client'

import Link from 'next/link'

const navigation = {
  product: [
    { name: 'AI Assistant', href: '/ai-assistant' },
    { name: 'Legal Research', href: '/research' },
    { name: 'Case Tracker', href: '/case-tracker' },
    { name: 'Document Generator', href: '/drafts' },
  ],
  tools: [
    { name: 'Judgment Summarizer', href: '/summarizer' },
    { name: 'Legal Notices', href: '/notices' },
    { name: 'CRM System', href: '/crm' },
    { name: 'Legal News', href: '/news' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Acts Explorer', href: '/acts' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Login', href: '/auth/sign-in' },
    { name: 'Register', href: '/auth/sign-up' },
  ],
}

export function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>


          {/* Navigation Links */}
          {Object.entries(navigation).map(([category, links]) => (
            <div key={category}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem'
              }}>
                {category}
              </h3>
              <ul style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {links.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      style={{
                        color: '#9ca3af',
                        textDecoration: 'none',
                        transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontSize: '0.875rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9ca3af'
                      }}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid #374151',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              © 2025 RagsPro. All rights reserved.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              <span>Developed by</span>
              <span style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                RagsPro
              </span>
              <span>• Professional Legal Solutions</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}