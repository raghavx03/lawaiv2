'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCase } from '@/context/CaseContext'
import { useUsageTracking } from '@/hooks/useUsageTracking'
import { toast, Toaster } from 'react-hot-toast'
import { FileText, Upload, Sparkles, Copy, Download, History, Eye, Briefcase, X, Loader2, AlertTriangle } from 'lucide-react'
import { FileUpload } from '@/components/shared/FileUpload'
import { CaseRequiredPrompt, useCaseRequired } from '@/components/shared/CaseRequiredPrompt'
import { PremiumButton, PremiumCard, StatCard } from '@/components/premium'
import Link from 'next/link'

interface Summary {
  id: string
  title: string
  originalText: string
  summary: string
  createdAt: string
  caseId?: string
}

export default function SummarizerPage() {
  const { user, profile } = useAuth()
  const { activeCase } = useCase()
  const { shouldPrompt } = useCaseRequired()
  const { trackUsage, canUse, getRemainingMessage, isPro } = useUsageTracking()
  const [text, setText] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedSummaries, setSavedSummaries] = useState<Summary[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [viewingSummary, setViewingSummary] = useState<Summary | null>(null)
  const [filterByCase, setFilterByCase] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [showCasePrompt, setShowCasePrompt] = useState(false)

  useEffect(() => {
    if (user) {
      loadSavedSummaries()
    }
  }, [user, activeCase, filterByCase])

  const loadSavedSummaries = async () => {
    try {
      const url = filterByCase && activeCase 
        ? `/api/summarizer?caseId=${activeCase.id}`
        : '/api/summarizer'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setSavedSummaries(Array.isArray(data) ? data.slice(0, 20) : [])
      }
    } catch (error) {
      console.error('Failed to load summaries:', error)
    }
  }

  const handleFileUploaded = (file: { filename: string; extractedText?: string }) => {
    setUploadedFileName(file.filename)
    if (file.extractedText) {
      setText(file.extractedText)
      toast.success('Text extracted from file')
    }
  }

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error('Please enter or upload text to summarize')
      return
    }

    // Check if case is required (soft prompt)
    if (shouldPrompt && !showCasePrompt) {
      setShowCasePrompt(true)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/summarizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.substring(0, 15000),
          title: uploadedFileName || 'Manual Input',
          caseId: activeCase?.id
        })
      })

      const data = await response.json()
      if (response.ok && data.summary) {
        setSummary(data.summary)
        toast.success('Summary generated!')
        loadSavedSummaries()

        // Track usage
        await trackUsage('summary')
      } else {
        throw new Error(data.error || 'Failed to generate summary')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to summarize')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  const reset = () => {
    setText('')
    setSummary('')
    setUploadedFileName('')
    setViewingSummary(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />

      {/* Case Required Prompt Modal */}
      {showCasePrompt && shouldPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <CaseRequiredPrompt 
              feature="Summarizer" 
              onCaseSelected={() => {
                setShowCasePrompt(false)
                // Retry summarize after case selected
                handleSummarize()
              }}
            />
            <button
              onClick={() => {
                setShowCasePrompt(false)
                // Continue without case
                setLoading(true)
                fetch('/api/summarizer', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    text: text.substring(0, 15000),
                    title: uploadedFileName || 'Manual Input'
                  })
                })
                  .then(res => res.json())
                  .then(data => {
                    if (data.summary) {
                      setSummary(data.summary)
                      toast.success('Summary generated!')
                      loadSavedSummaries()
                    }
                  })
                  .catch(() => toast.error('Failed to summarize'))
                  .finally(() => setLoading(false))
              }}
              className="w-full mt-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm"
            >
              Continue without case
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-premium-h1 text-gray-900 dark:text-white">Judgment Summarizer</h1>
            <p className="text-premium-body text-gray-600 dark:text-gray-400 mt-2">
              {activeCase 
                ? `Linked to: ${activeCase.cnrNumber}` 
                : 'AI-powered legal document summarization'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PremiumButton
              variant="secondary"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              icon={<History className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">History</span>
            </PremiumButton>
            <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
              {profile?.plan || 'FREE'}
            </span>
          </div>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <PremiumCard className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-premium-h3 text-gray-900 dark:text-white">Recent Summaries</h3>
            {activeCase && (
              <PremiumButton
                variant={filterByCase ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterByCase(!filterByCase)}
              >
                This Case Only
              </PremiumButton>
            )}
          </div>
          {savedSummaries.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedSummaries.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer transition-colors"
                  onClick={() => { setViewingSummary(item); setShowHistory(false); }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-premium-body font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                      {item.caseId && <Briefcase className="h-3 w-3 text-gray-400 dark:text-gray-500" />}
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-premium-body text-gray-500 dark:text-gray-400">No summaries yet</p>
          )}
        </PremiumCard>
      )}

      {/* Viewing Saved Summary */}
      {viewingSummary ? (
        <div className="space-y-4">
          <PremiumCard>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-premium-h2 text-gray-900 dark:text-white">{viewingSummary.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-premium-body text-gray-600 dark:text-gray-400">{new Date(viewingSummary.createdAt).toLocaleDateString()}</p>
                  {viewingSummary.caseId && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Briefcase className="h-3 w-3" />
                      Case linked
                    </span>
                  )}
                </div>
              </div>
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={reset}
              >
                Back
              </PremiumButton>
            </div>
          </PremiumCard>
          
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-premium-h3 text-gray-900 dark:text-white">Summary</h3>
              <PremiumButton
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(viewingSummary.summary)}
                icon={<Copy className="h-4 w-4" />}
              />
            </div>
            <p className="text-premium-body text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {viewingSummary.summary}
            </p>
          </PremiumCard>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Case Banner */}
          {activeCase && (
            <PremiumCard className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-premium-body text-indigo-700 dark:text-indigo-300">Summary will be saved to: <strong>{activeCase.cnrNumber}</strong></span>
              </div>
            </PremiumCard>
          )}

          {/* File Upload */}
          <div>
            <h2 className="text-premium-h2 text-gray-900 dark:text-white mb-4">Upload Document</h2>
            <FileUpload 
              linkedFeature="summarizer"
              onFileUploaded={handleFileUploaded}
              accept=".pdf,.txt,.doc,.docx"
            />
          </div>

          {/* Or Text Input */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-400">or paste text</span>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-premium-body font-medium text-gray-900 dark:text-white">
                Judgment / Legal Document Text
              </label>
              {text && (
                <span className="text-xs text-gray-400 dark:text-gray-500">{text.length.toLocaleString()} characters</span>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the judgment or legal document text here..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={8}
            />
          </div>

          {/* Summarize Button */}
          <PremiumButton
            variant="primary"
            size="lg"
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
            icon={loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            className="w-full"
          >
            {loading ? 'Summarizing...' : 'Generate Summary'}
          </PremiumButton>

          {/* Generated Summary */}
          {summary && (
            <PremiumCard className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-premium-h3 text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  AI Summary
                </h3>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(summary)}
                  icon={<Copy className="h-4 w-4" />}
                />
              </div>
              <p className="text-premium-body text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {summary}
              </p>
              {activeCase && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-4 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Saved to case: {activeCase.cnrNumber}
                </p>
              )}
            </PremiumCard>
          )}
        </div>
      )}
    </div>
  )
}
