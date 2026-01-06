'use client'

import Link from 'next/link'
import { Scale, Brain, FileText, Clock, Users, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'

export default function IndianLawAIPage() {
  useEffect(() => {
    document.title = 'How AI is Transforming Indian Legal System | LAW.AI'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover how AI technology is revolutionizing Indian law, addressing weaknesses in the legal system, and creating opportunities for faster, more accessible justice.')
    }
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Back Navigation */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors no-underline group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors no-underline text-sm font-medium"
              >
                <span>Try LAW.AI</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <Scale className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI Revolution in <span className="text-blue-600">Indian Law</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            How Artificial Intelligence is transforming India's legal landscape, addressing systemic weaknesses, and creating a more accessible justice system for all.
          </p>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a href="#challenges" className="px-4 py-2 bg-white/80 backdrop-blur text-gray-700 rounded-lg hover:bg-white transition-colors no-underline text-sm font-medium">
              Current Challenges
            </a>
            <a href="#solutions" className="px-4 py-2 bg-white/80 backdrop-blur text-gray-700 rounded-lg hover:bg-white transition-colors no-underline text-sm font-medium">
              AI Solutions
            </a>
            <a href="#impact" className="px-4 py-2 bg-white/80 backdrop-blur text-gray-700 rounded-lg hover:bg-white transition-colors no-underline text-sm font-medium">
              Impact Statistics
            </a>
          </div>
        </div>
      </section>

      {/* Current Challenges */}
      <section id="challenges" className="py-16 px-4 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Current Challenges in Indian Legal System
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Understanding the weaknesses that AI can help address
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <Clock className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Delayed Justice</h3>
              <p className="text-gray-600">
                Over 4.7 crore pending cases in Indian courts. Average case resolution time: 3-5 years for civil cases, 2-3 years for criminal cases.
              </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
              <Users className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Limited Access</h3>
              <p className="text-gray-600">
                Only 20 judges per 10 lakh population (WHO recommends 50). Rural areas severely underserved with limited legal representation.
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <FileText className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Complex Procedures</h3>
              <p className="text-gray-600">
                Overwhelming paperwork, complex legal language, and procedural delays make justice inaccessible to common citizens.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <TrendingUp className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">High Costs</h3>
              <p className="text-gray-600">
                Legal fees, court costs, and time investment make justice expensive. 70% of Indians cannot afford quality legal representation.
              </p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
              <Brain className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Information Gap</h3>
              <p className="text-gray-600">
                Lack of legal awareness, difficulty in finding relevant laws and precedents, and language barriers in legal documents.
              </p>
            </div>

            <div className="bg-pink-50 p-6 rounded-xl border border-pink-200">
              <Scale className="w-8 h-8 text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Inconsistent Judgments</h3>
              <p className="text-gray-600">
                Similar cases often receive different judgments across courts, leading to unpredictability and loss of faith in the system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Solutions */}
      <section id="solutions" className="py-16 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How AI is Transforming Indian Law
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Revolutionary solutions addressing each challenge systematically
            </p>
          </div>

          <div className="space-y-12">
            {/* Speed & Efficiency */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Speed & Efficiency Revolution
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Automated Document Processing</h4>
                      <p className="text-gray-600">AI can process legal documents 100x faster than humans, reducing case preparation time from weeks to hours.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Intelligent Case Scheduling</h4>
                      <p className="text-gray-600">Smart algorithms optimize court schedules, reducing delays and maximizing judicial productivity.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Instant Legal Research</h4>
                      <p className="text-gray-600">AI searches through millions of cases and laws in seconds, providing relevant precedents instantly.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Predictive Analytics</h4>
                      <p className="text-gray-600">AI predicts case outcomes and timelines, helping lawyers and clients make informed decisions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accessibility */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Universal Access to Justice
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">24/7 AI Legal Assistant</h4>
                      <p className="text-gray-600">Citizens can get legal guidance anytime, anywhere, breaking geographical and time barriers.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Multi-language Support</h4>
                      <p className="text-gray-600">AI translates legal documents into regional languages, making law accessible to all Indians.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Virtual Court Proceedings</h4>
                      <p className="text-gray-600">AI-powered virtual courts reduce travel costs and time, especially benefiting rural populations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Self-Help Legal Tools</h4>
                      <p className="text-gray-600">AI guides citizens through legal procedures, reducing dependency on expensive lawyers for simple matters.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Reduction */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Affordable Legal Solutions
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Automated Document Generation</h4>
                      <p className="text-gray-600">AI creates legal documents at 90% lower cost than traditional methods, making legal services affordable.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Efficient Case Management</h4>
                      <p className="text-gray-600">AI reduces administrative overhead, allowing lawyers to focus on core legal work and reduce fees.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Preventive Legal Care</h4>
                      <p className="text-gray-600">AI identifies potential legal issues early, preventing costly litigation through proactive solutions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Subscription-based Legal Services</h4>
                      <p className="text-gray-600">AI enables affordable monthly legal service plans, making justice accessible to middle-class families.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section id="impact" className="py-16 px-4 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Projected Impact of AI in Indian Legal System
            </h2>
            <p className="text-gray-600">
              Conservative estimates of transformation potential
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">80%</div>
              <div className="text-gray-900 font-semibold mb-1">Faster Case Resolution</div>
              <div className="text-sm text-gray-600">From years to months</div>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">70%</div>
              <div className="text-gray-900 font-semibold mb-1">Cost Reduction</div>
              <div className="text-sm text-gray-600">Making justice affordable</div>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl font-bold text-purple-600 mb-2">10x</div>
              <div className="text-gray-900 font-semibold mb-1">Increased Access</div>
              <div className="text-sm text-gray-600">Reaching rural India</div>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-900 font-semibold mb-1">Accuracy Improvement</div>
              <div className="text-sm text-gray-600">Consistent judgments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">
            The Future of Indian Justice System
          </h2>
          <p className="text-xl mb-8 opacity-90">
            AI will transform India's legal landscape from a system of delayed, expensive, and inaccessible justice to one that is fast, affordable, and available to every citizen. This is not just technological advancement—it's a fundamental shift towards true democratic justice.
          </p>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Join the Legal Revolution</h3>
            <p className="opacity-90 mb-6">
              LAW.AI is pioneering this transformation, making advanced legal technology accessible to lawyers, law firms, and citizens across India. Together, we're building a justice system that truly serves the people.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors no-underline font-semibold"
              >
                <span>Start Free Trial</span>
                <span>→</span>
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors no-underline font-semibold"
              >
                <span>Contact Sales</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Back to Top */}
      <div className="fixed bottom-6 right-6 z-20">
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
          className="p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          aria-label="Back to top"
        >
          <ArrowLeft className="w-5 h-5 rotate-90" />
        </button>
      </div>

    </div>
  )
}
