'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simple and guaranteed approach - just show success and use mailto
    console.log('📧 Contact Form Submission:', {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    })

    // Create mailto link
    const subject = encodeURIComponent(`LAW-AI Contact: ${formData.subject}`)
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}\n\n---\nSent from LAW-AI Contact Form\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
    )
    const mailtoLink = `mailto:ragsproai@gmail.com?subject=${subject}&body=${body}`
    
    // Open email client
    window.location.href = mailtoLink
    
    // Show success message
    setSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSubmitted(false), 8000)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                ⚖
              </div>
              <span className="font-bold text-lg sm:text-xl lg:text-2xl text-white">
                LAW.AI
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/" className="text-white/80 hover:text-white no-underline transition-colors font-medium">Home</Link>
              <Link href="/about" className="text-white/80 hover:text-white no-underline transition-colors font-medium">About</Link>
              <Link href="/contact" className="text-white no-underline transition-colors font-medium">Contact</Link>
              <Link href="/auth/login" className="text-white/80 hover:text-white no-underline transition-colors font-medium">Login</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Get in touch with our team. We're here to help you with any questions about LAW.AI.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-gray-700/30 transition-colors duration-300">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">
                Get in Touch
              </h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                    📧
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">Email</h3>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors">ragsproai@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                    📱
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors">+91 8700048490</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                    📍
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">Location</h3>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors">South West Delhi, India</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-3">Business Hours</h3>
                <div className="space-y-1 text-sm opacity-90">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-gray-700/30 transition-colors duration-300">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">
                Send us a Message
              </h2>

              {submitted ? (
                <div className="text-center p-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold mb-2">
                    📧 Email Client Opened!
                  </h3>
                  <p className="mb-4">Your email client should open with a pre-filled message to <strong>ragsproai@gmail.com</strong>. Please click <strong>Send</strong> in your email app to complete the contact request.</p>
                  <div className="bg-blue-600/20 backdrop-blur-sm p-4 rounded-lg border border-blue-400/30">
                    <p className="text-sm mb-2"><strong>📧 To:</strong> ragsproai@gmail.com</p>
                    <p className="text-sm mb-2"><strong>📱 Direct Contact:</strong> +91 8700048490</p>
                    <p className="text-sm"><strong>ℹ️ Note:</strong> If email client didn't open, send manually to the above email</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px]"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px]"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px]"
                      placeholder="What's this about?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-lg font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed min-h-[48px] touch-manipulation"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}