'use client'

import { useState } from 'react'
import { Download, Share2, AlertCircle, AlertTriangle, CheckCircle, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

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

interface RiskReportProps {
  analysis: RiskAnalysis
  contractText: string
}

export default function RiskReport({ analysis, contractText }: RiskReportProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const text = `I just analyzed a contract with LAW.AI Contract Risk Analyzer. Risk Score: ${analysis.overallRisk}% (${analysis.riskLevel}). Try it free: ${window.location.origin}/contract-analyzer`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPDF = () => {
    toast.info('PDF download available for Pro users. Upgrade to Pro to download.')
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          {copied ? 'Copied!' : 'Share'}
        </Button>
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Link href="/auth/signup" className="ml-auto">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Sign Up Free
          </Button>
        </Link>
      </div>

      {/* Red Flags */}
      {analysis.redFlags.length > 0 && (
        <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">
              Red Flags ({analysis.redFlags.length})
            </h3>
          </div>
          <div className="space-y-4">
            {analysis.redFlags.map((flag, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{flag.clause}</p>
                    <p className="text-sm text-slate-600 mt-1">Section: {flag.section}</p>
                    <p className="text-sm text-red-700 mt-2">
                      <strong>Issue:</strong> {flag.issue}
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      <strong>Suggestion:</strong> {flag.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div className="border-l-4 border-yellow-500 bg-yellow-50 p-6 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">
              Warnings ({analysis.warnings.length})
            </h3>
          </div>
          <div className="space-y-4">
            {analysis.warnings.map((warning, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{warning.clause}</p>
                    <p className="text-sm text-slate-600 mt-1">Section: {warning.section}</p>
                    <p className="text-sm text-yellow-700 mt-2">
                      <strong>Issue:</strong> {warning.issue}
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      <strong>Suggestion:</strong> {warning.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Revisions */}
      {analysis.suggestedRevisions.length > 0 && (
        <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">
              Suggested Revisions
            </h3>
          </div>
          <ul className="space-y-3">
            {analysis.suggestedRevisions.map((revision, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  {idx + 1}
                </span>
                <span className="text-slate-700">{revision}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pro Features CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-2">Unlock Pro Features</h3>
        <p className="text-slate-600 mb-4">
          Upgrade to Pro to download PDF reports, analyze unlimited contracts, and get email support.
        </p>
        <Link href="/pricing">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            View Pricing
          </Button>
        </Link>
      </div>
    </div>
  )
}
