'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Menu, X } from 'lucide-react'

export function LegalNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'FAQ', href: '#faq' },
  ]

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div 
        className={`
          max-w-6xl mx-auto px-6 transition-all duration-300 ease-out
          ${scrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200/60' 
            : 'bg-white/70 backdrop-blur-md border border-gray-100/50'
          }
          rounded-2xl
        `}
      >
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-serif text-lg">⚖</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl text-gray-900 tracking-tight">
                LAW.AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium group"
              >
                {link.name}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left rounded-full" />
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-10 bg-gray-100 rounded-xl" />
            ) : user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-300 text-sm shadow-sm hover:shadow-md"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-300 text-sm shadow-sm hover:shadow-md"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden overflow-hidden">
            <div className="py-4 border-t border-gray-100">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href} 
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 py-3 px-4 rounded-xl block transition-colors" 
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-gray-100">
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="px-5 py-3 bg-gray-900 text-white font-medium rounded-xl text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="px-5 py-3 text-gray-600 text-center font-medium hover:bg-gray-50 rounded-xl transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="px-5 py-3 bg-gray-900 text-white font-medium rounded-xl text-center"
                        onClick={() => setIsOpen(false)}
                      >
                        Start Free Trial
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
