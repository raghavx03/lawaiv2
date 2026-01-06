'use client'

import { useState, useEffect } from 'react'
import { FeatureModal } from '@/components/auth/FeatureModal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileText, Download, Loader2, Clock, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { toast } from 'react-hot-toast'

interface Summary {
  id: string
  title: string
  summary: string
  createdAt: string
}

function SummarizerContent() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null)
  const [previousSummaries, setPreviousSummaries] = useState<Summary[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPrevious, setLoadingPrevious] = useState(true)

  useEffect(() => {
    fetchPreviousSummaries()
  }, [])

  const fetchPreviousSummaries = async () => {
    try {
      const response = await fetch('/api/summarizer')
      if (response.ok) {
        const data = await response.json()
        setPreviousSummaries(data.summaries || [])
      }
    } catch (error) {
      console.error('Failed to fetch previous summaries:', error)
    } finally {
      setLoadingPrevious(false)
    }
  }

  const handleSummarize = async () => {
    if (!title.trim() || !text.trim()) {
      toast.error('Please enter both title and judgment text')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/summarizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), text: text.trim() })
      })

      const data = await response.json()
      
      if (data.ok) {
        setCurrentSummary({
          id: data.id,
          title: data.title,
          summary: data.summary,
          createdAt: data.createdAt
        })
        toast.success('Summary generated successfully!')
        fetchPreviousSummaries() // Refresh the list
      } else {
        toast.error(data.message || 'Failed to generate summary')
      }
    } catch (error) {
      toast.error('Error generating summary')
    } finally {
      setLoading(false)
    }
  }

  const downloadSummary = (summary: Summary) => {
    const content = `Title: ${summary.title}\n\nSummary:\n${summary.summary}\n\nGenerated on: ${new Date(summary.createdAt).toLocaleString()}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Summary downloaded successfully!')
  }

  const isFormValid = title.trim() && text.trim() && !loading

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-2"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div className="text-center flex-1 px-2">
              <div className="flex items-center justify-center mb-1">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors">Judgment Summarizer</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors hidden sm:block">AI-powered legal document analysis</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Input Section */}
          <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span>Enter Judgment Details</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Provide the title and full text of the legal judgment for AI-powered summarization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm sm:text-base font-medium">Case Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., ABC vs XYZ - Supreme Court Case"
                  className="h-11 sm:h-12 text-sm sm:text-base border-2 focus:border-blue-500 transition-colors dark:bg-[#1E1E1E] dark:border-[#333] dark:text-white dark:placeholder-[#aaa]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text" className="text-sm sm:text-base font-medium">Judgment Text</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the complete judgment text here..."
                  rows={8}
                  className="resize-none text-sm sm:text-base border-2 focus:border-blue-500 transition-colors min-h-[200px] sm:min-h-[300px] dark:bg-[#1E1E1E] dark:border-[#333] dark:text-white dark:placeholder-[#aaa]"
                />
              </div>
              <Button 
                onClick={handleSummarize}
                disabled={!isFormValid}
                className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Generating Summary...</span>
                    <span className="sm:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Current Summary Output */}
          {currentSummary && (
            <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-bottom-4">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span>Generated Summary</span>
                  </CardTitle>
                  <Button
                    onClick={() => downloadSummary(currentSummary)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 hover:border-green-300 transition-colors w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">Download Summary</span>
                  </Button>
                </div>
                <CardDescription className="text-sm sm:text-base break-words">
                  <span className="font-medium">{currentSummary.title}</span>
                  <span className="block sm:inline sm:ml-2 text-xs sm:text-sm text-gray-500">
                    Generated {new Date(currentSummary.createdAt).toLocaleString()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-6 rounded-xl border-2 border-green-200 dark:border-green-700">
                  <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {currentSummary.summary}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous Summaries */}
          <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span>Previous Summaries</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Your recent judgment summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPrevious ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Loading previous summaries...</span>
                </div>
              ) : previousSummaries.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />
                  </div>
                  <p className="text-base sm:text-lg font-medium mb-2">No previous summaries found</p>
                  <p className="text-sm sm:text-base">Generate your first summary above</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {previousSummaries.map((summary, index) => (
                    <div key={summary.id}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700 dark:to-purple-900/20 rounded-xl hover:from-gray-100 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:to-purple-800/30 transition-all duration-200 border border-gray-200 dark:border-gray-600">
                        <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base break-words">{summary.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {summary.summary.substring(0, 120)}...
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {new Date(summary.createdAt).toLocaleDateString()} at {new Date(summary.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <Button
                          onClick={() => downloadSummary(summary)}
                          variant="ghost"
                          size="sm"
                          className="ml-0 sm:ml-4 hover:bg-white dark:hover:bg-gray-700 w-full sm:w-auto transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          <span className="sm:hidden">Download</span>
                        </Button>
                      </div>
                      {index < previousSummaries.length - 1 && <Separator className="my-2 opacity-50" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SummarizerPage() {
  return <SummarizerContent />
}