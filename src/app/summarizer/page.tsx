'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCase } from '@/context/CaseContext'
import { useUsageTracking } from '@/hooks/useUsageTracking'
import { toast, Toaster } from 'react-hot-toast'
import { FileText, Upload, Sparkles, Copy, Download, History, Eye, Briefcase, X, Loader2, AlertTriangle } from 'lucide-react'
import { FileUpload } from '@/components/shared/FileUpload'
import { CaseRequiredPrompt, useCaseRequired } from '@/components/shared/CaseRequiredPrompt'
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Judgment Summarizer</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCase 
              ? `Linked to: ${activeCase.cnrNumber}` 
              : 'AI-powered legal document summarization'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </button>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {profile?.plan || 'FREE'}
          </span>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Recent Summaries</h3>
            {activeCase && (
              <button
                onClick={() => setFilterByCase(!filterByCase)}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                  filterByCase ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                This Case Only
              </button>
            )}
          </div>
          {savedSummaries.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedSummaries.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer"
                  onClick={() => { setViewingSummary(item); setShowHistory(false); }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                      {item.caseId && <Briefcase className="h-3 w-3 text-gray-400" />}
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No summaries yet</p>
          )}
        </div>
      )}

      {/* Viewing Saved Summary */}
      {viewingSummary ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{viewingSummary.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">{new Date(viewingSummary.createdAt).toLocaleDateString()}</p>
                {viewingSummary.caseId && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Briefcase className="h-3 w-3" />
                    Case linked
                  </span>
                )}
              </div>
            </div>
            <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700">
              Back
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Summary</h3>
              <button 
                onClick={() => copyToClipboard(viewingSummary.summary)}
                className="p-2 rounded-lg hover:bg-gray-200"
              >
                <Copy className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {viewingSummary.summary}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Case Banner */}
          {activeCase && (
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl text-sm">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Summary will be saved to: <strong>{activeCase.cnrNumber}</strong></span>
            </div>
          )}

          {/* File Upload */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Upload Document</h2>
            <FileUpload 
              linkedFeature="summarizer"
              onFileUploaded={handleFileUploaded}
              accept=".pdf,.txt,.doc,.docx"
            />
          </div>

          {/* Or Text Input */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-gray-500">or paste text</span>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Judgment / Legal Document Text
              </label>
              {text && (
                <span className="text-xs text-gray-400">{text.length.toLocaleString()} characters</span>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the judgment or legal document text here..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none"
              rows={8}
            />
          </div>

          {/* Summarize Button */}
          <button
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Summary
              </>
            )}
          </button>

          {/* Generated Summary */}
          {summary && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  AI Summary
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(summary)}
                    className="p-2 rounded-lg hover:bg-green-100"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {summary}
              </p>
              {activeCase && (
                <p className="text-xs text-green-600 mt-4 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Saved to case: {activeCase.cnrNumber}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
