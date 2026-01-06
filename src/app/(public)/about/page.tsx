'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Zap, Shield, Clock, Users } from 'lucide-react'

export default function AboutPage() {
  const benefits = [
    { icon: Clock, title: 'Save 15+ Hours Weekly', desc: 'Automated document analysis and case research' },
    { icon: Zap, title: '99.2% Accuracy', desc: 'AI-powered legal insights with human-level precision' },
    { icon: Shield, title: 'Secure & Compliant', desc: 'Bank-grade security with legal industry standards' },
    { icon: Users, title: '10,000+ Users', desc: 'Trusted by legal professionals across India' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-6xl mx-auto px-6 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200/60 rounded-2xl">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-serif text-lg">⚖</span>
              </div>
              <span className="font-serif font-bold text-xl text-gray-900">LAW.AI</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Home</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Contact</Link>
              <Link href="/auth/login" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
              <ArrowLeft size={16} />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
              About LAW.AI
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Empowering legal professionals with AI-driven solutions that save time, reduce errors, and deliver superior client outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              LAW.AI transforms legal practice by eliminating the 15+ hours lawyers spend weekly on manual document review. 
              Our AI instantly analyzes complex legal documents, identifies critical precedents, and generates accurate case briefs—
              helping legal professionals win more cases while increasing their efficiency.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We believe every lawyer deserves access to cutting-edge technology that enhances their expertise, 
              not replaces it. From judgment summarization to contract analysis, LAW.AI serves as your intelligent legal assistant.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 text-center">Why Choose LAW.AI?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4">
                    <benefit.icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creator */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                RS
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Made by Raghav Shah</h3>
                <p className="text-gray-500 text-sm">AI Innovation Specialist & Legal Tech Entrepreneur</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Raghav Shah combines deep expertise in artificial intelligence with a passion for legal innovation. 
              Through his agency <a href="https://ragspro.com" target="_blank" rel="noopener noreferrer" className="text-gray-900 underline">RAGSPRO</a>, he has helped numerous law firms modernize their practice with cutting-edge AI solutions, 
              delivering measurable results and competitive advantages in today's digital legal landscape.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Ready to Transform Your Legal Practice?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of legal professionals already using LAW.AI to deliver better results for their clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl hover:bg-gray-100 transition-all"
              >
                Start Free Trial
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-gray-700 text-white font-medium rounded-2xl hover:bg-white/10 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
