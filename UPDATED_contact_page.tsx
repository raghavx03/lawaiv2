'use client'

import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resolvedTheme } = useTheme()

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold theme-text-primary mb-6">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl theme-text-secondary max-w-3xl mx-auto">
            Get in touch with our team. We're here to help you with any questions about LAW.AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="theme-bg-primary/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border theme-border-primary/20">
            <h2 className="text-2xl font-bold theme-text-primary mb-8">
              Get in Touch
            </h2>

            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                  📧
                </div>
                <div>
                  <h3 className="font-semibold theme-text-primary">Email</h3>
                  <p className="theme-text-secondary">ragsproai@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                  📱
                </div>
                <div>
                  <h3 className="font-semibold theme-text-primary">Phone</h3>
                  <p className="theme-text-secondary">+91 8700048490</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                  📍
                </div>
                <div>
                  <h3 className="font-semibold theme-text-primary">Location</h3>
                  <p className="theme-text-secondary">South West Delhi, India</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-3">Business Hours</h3>
              <div className="space-y-2 text-sm opacity-90">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="theme-bg-primary/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border theme-border-primary/20">
            <h2 className="text-2xl font-bold theme-text-primary mb-8">
              Send us a Message
            </h2>

            {submitted ? (
              <div className="text-center p-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl text-white">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-3">
                  📧 Email Client Opened!
                </h3>
                <p className="mb-6">Your email client should open with a pre-filled message to <strong>ragsproai@gmail.com</strong>. Please click <strong>Send</strong> in your email app to complete the contact request.</p>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-sm space-y-2">
                  <p><strong>📧 To:</strong> ragsproai@gmail.com</p>
                  <p><strong>📱 Direct Contact:</strong> +91 8700048490</p>
                  <p><strong>ℹ️ Note:</strong> If email client didn't open, send manually to the above email</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-lg border theme-border-primary px-4 py-3 text-base theme-text-primary transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      appearance: 'none',
                      backgroundColor: 'var(--theme-input-bg)',
                      borderColor: 'var(--theme-input-border)',
                      color: 'var(--theme-input-text)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-lg border theme-border-primary px-4 py-3 text-base theme-text-primary transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      appearance: 'none',
                      backgroundColor: 'var(--theme-input-bg)',
                      borderColor: 'var(--theme-input-border)',
                      color: 'var(--theme-input-text)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="What's this about?"
                    required
                    className="w-full rounded-lg border theme-border-primary px-4 py-3 text-base theme-text-primary transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      appearance: 'none',
                      backgroundColor: 'var(--theme-input-bg)',
                      borderColor: 'var(--theme-input-border)',
                      color: 'var(--theme-input-text)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    required
                    className="w-full rounded-lg border theme-border-primary px-4 py-3 text-base theme-text-primary transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 resize-vertical"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      appearance: 'none',
                      backgroundColor: 'var(--theme-input-bg)',
                      borderColor: 'var(--theme-input-border)',
                      color: 'var(--theme-input-text)'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}