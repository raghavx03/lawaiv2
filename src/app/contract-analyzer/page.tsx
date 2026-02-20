'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, CheckCircle, Download, Loader } from 'lucide-react'
import FileUpload from '@/components/contract-analyzer/FileUpload'
import RiskMeter from '@/components/contract-analyzer/RiskMeter'
import RiskReport from '@/components/contract-analyzer/RiskReport'
import PricingTable from '@/components/contract-analyzer/PricingTable'
import { StatCard, PremiumButton, PremiumCard, SkeletonLoader } from '@/components/premium'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { getSubscription } from '@/lib/subscription-service'

interface RiskAnalysis {
  overallRisk: number
  riskLevel: string
  confidence: number
  analysisTime: number
  redFlags: Array<{
    clause: string
    section: string
    issue: string
    suggestion: string
  }>
  warnings: Array<{
    clause: string
    section: string
    issue: string
    suggestion: string
  }>
  suggestedRevisions: string[]
}

export default function ContractAnalyzerPage() {
  const router = useRouter()
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null)
  const [contractText, setContractText] = useState('')
  const [queryCount, setQueryCount] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'enterprise'>('free')

  // Get user subscription tier
  useEffect(() => {
    if (userId) {
      const fetchSubscription = async () => {
        try {
          const response = await fetch('/api/subscription', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          if (response.ok) {
            const data = await response.json()
            setUserTier(data.tier)
          }
        } catch (error) {
          console.error('Error fetching subscription:', error)
        }
      }
      fetchSubscription()
    }
  }, [userId])

  // Track query count
  useEffect(() => {
    if (analysis) {
      setQueryCount(prev => prev + 1)
      // Show paywall after 5 free queries
      if (queryCount >= 4 && !userId) {
        setShowPaywall(true)
      }
    }
  }, [analysis, userId, queryCount])

  const handleAnalyze = async (text: string) => {
    if (!text.trim()) {
      toast.error('Please upload or paste a contract')
      return
    }

    setLoading(true)
    setContractText(text)

    try {
      const startTime = Date.now()
      const response = await fetch('/api/contract-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText: text,
          contractType: 'general',
          userId, // Pass userId for query limit enforcement
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 429) {
          toast.error('Daily query limit reached. Upgrade to Pro for unlimited access.')
          setShowPaywall(true)
        } else {
          toast.error(data.error || 'Failed to analyze contract')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      const analysisTime = (Date.now() - startTime) / 1000

      setAnalysis({
        ...data,
        analysisTime,
      })

      toast.success('Contract analyzed successfully!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Error analyzing contract')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!analysis || !contractText) {
      toast.error('No analysis to download')
      return
    }

    if (userTier !== 'pro' && userTier !== 'enterprise') {
      toast.error('PDF download is only available for Pro tier users')
      setShowPaywall(true)
      return
    }

    setDownloadingPDF(true)

    try {
      const response = await fetch('/api/contract-analyzer/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          analysis,
          contractText,
          contractType: 'general',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to download PDF')
        return
      }

      // Get the PDF blob
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `contract-risk-analysis-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('PDF download error:', error)
      toast.error('Failed to download PDF')
    } finally {
      setDownloadingPDF(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <PremiumButton
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </PremiumButton>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h1 className="text-premium-h1 text-slate-900 dark:text-white">Contract Risk Analyzer</h1>
            <p className="text-premium-body text-slate-600 dark:text-slate-400 mt-2">
              Analyze your contract in 3 seconds with AI-powered risk assessment
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <PremiumCard title="Upload Your Contract">
              <FileUpload onAnalyze={handleAnalyze} loading={loading} />
            </PremiumCard>

            {/* Results Section */}
            {analysis && (
              <div className="space-y-6">
                <PremiumCard title="Risk Analysis Results">
                  <RiskMeter analysis={analysis} />
                </PremiumCard>

                <PremiumCard>
                  <RiskReport analysis={analysis} contractText={contractText} />
                </PremiumCard>

                {/* PDF Download Button */}
                {(userTier === 'pro' || userTier === 'enterprise') && (
                  <div className="flex gap-3">
                    <PremiumButton
                      onClick={handleDownloadPDF}
                      disabled={downloadingPDF}
                      className="flex-1"
                    >
                      {downloadingPDF ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download PDF Report
                        </>
                      )}
                    </PremiumButton>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <PremiumCard>
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 animate-spin mb-4" />
                  <p className="text-slate-700 dark:text-slate-300 font-medium">Analyzing your contract...</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">This usually takes 2-3 seconds</p>
                </div>
              </PremiumCard>
            )}
          </div>

          {/* Right Column - Pricing */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PricingTable />
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      {!analysis && !loading && (
        <div className="mt-16 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-indigo-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-premium-h1 text-white mb-4">Ready to analyze your contracts?</h2>
            <p className="text-premium-body text-indigo-100 mb-8">
              Get instant risk assessment and protect your business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton
                size="lg"
                variant="secondary"
                onClick={() => document.querySelector('input[type="file"]')?.click()}
              >
                <Sparkles className="h-4 w-4" />
                Start Analyzing
              </PremiumButton>
              <Link href="/auth/signup">
                <PremiumButton
                  size="lg"
                  variant="ghost"
                  className="text-white border-white hover:bg-white/10"
                >
                  Create Free Account
                </PremiumButton>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PremiumCard className="max-w-md w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-premium-h2 text-slate-900 dark:text-white mb-2">
                Upgrade to Pro
              </h2>
              <p className="text-premium-body text-slate-600 dark:text-slate-400 mb-6">
                You've used your 5 free daily queries. Upgrade to Pro for unlimited access.
              </p>

              <div className="space-y-3 mb-6 text-left">
                {['Unlimited queries', 'PDF downloads', 'Email support', 'API access'].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-premium-h2 text-slate-900 dark:text-white">$29<span className="text-sm text-slate-600 dark:text-slate-400">/month</span></p>
              </div>

              <div className="space-y-3">
                <Link href="/auth/signup?plan=pro" className="block">
                  <PremiumButton className="w-full">
                    Start Free Trial
                  </PremiumButton>
                </Link>
                <PremiumButton
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowPaywall(false)}
                >
                  Continue with Free
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}
    </div>
  )
}
