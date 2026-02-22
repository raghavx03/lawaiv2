'use client'

import Link from 'next/link'
import { ArrowLeft, ExternalLink, Linkedin, Twitter, Globe, Mail } from 'lucide-react'

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <Link href="/dashboard" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
              Try LawAI
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-gray-900 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative cursor-pointer group">
            <img
              src="/founder.jpg"
              alt="Raghav Shah"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // Fallback to initials if image doesn't exist yet
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="text-5xl text-white font-bold hidden absolute">RS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Raghav Shah
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Founder & CEO, LawAI
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://ragspro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
            >
              <Globe className="h-4 w-4" />
              ragspro.com
            </a>
            <a
              href="https://www.linkedin.com/in/ragspro"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/ragsproai"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* About Section */}
        <div className="prose prose-lg max-w-none mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Raghav Shah is a technology entrepreneur and the founder of <a href="https://ragspro.com" target="_blank" rel="noopener noreferrer" className="text-gray-900 font-medium hover:underline">RAGSPRO</a>, a digital agency specializing in building innovative software solutions. With a passion for leveraging technology to solve real-world problems, Raghav founded LawAI to revolutionize the legal industry in India.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Having witnessed the challenges faced by legal professionals in managing their practice efficiently, Raghav envisioned a platform that would bring the power of artificial intelligence to every lawyer's fingertips. LawAI is the culmination of this vision—a comprehensive legal tech solution designed specifically for the Indian legal ecosystem.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Under Raghav's leadership, LawAI has grown to serve thousands of lawyers across India, helping them draft documents, research case laws, track court cases, and manage their clients more efficiently than ever before.
          </p>
        </div>

        {/* Vision Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vision for LawAI</h2>
          <blockquote className="text-xl text-gray-700 italic border-l-4 border-gray-900 pl-6">
            "Our mission is to democratize access to legal technology. Every lawyer, whether in a metro city or a small town, should have access to the same powerful tools. AI is not here to replace lawyers—it's here to empower them to do their best work."
          </blockquote>
          <p className="text-gray-600 mt-4">— Raghav Shah</p>
        </div>

        {/* RAGSPRO Section */}
        <div className="border border-gray-200 rounded-2xl p-8 mb-12">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">RAGSPRO</h2>
              <p className="text-gray-600 mb-4">
                RAGSPRO is a full-service digital agency founded by Raghav Shah. We specialize in building custom software solutions, web applications, mobile apps, and AI-powered products for businesses across industries.
              </p>
              <a
                href="https://ragspro.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Visit RAGSPRO
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { number: '10,000+', label: 'Lawyers Using LawAI' },
              { number: '50,000+', label: 'Documents Generated' },
              { number: '100+', label: 'Law Firms Served' }
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gray-900 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
          <p className="text-gray-300 mb-6">
            Interested in partnering with LawAI or have questions? Reach out directly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:ragsproai@gmail.com"
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Mail className="h-5 w-5" />
              ragsproai@gmail.com
            </a>
            <a
              href="https://ragspro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border border-white text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              <Globe className="h-5 w-5" />
              ragspro.com
            </a>
          </div>
        </div>
      </main>

    </div>
  )
}
