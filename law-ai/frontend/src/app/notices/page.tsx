'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Bell, Send, Download, AlertTriangle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { FeatureModal } from '@/components/auth/FeatureModal'

interface Notice {
  id: string
  type: string
  recipient: string
  subject: string
  content: string
  createdAt: string
}

function NoticesContent() {
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    noticeType: '',
    recipient: '',
    subject: '',
    details: ''
  })
  const [generatedNotice, setGeneratedNotice] = useState('')
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(false)

  const noticeTypes = [
    { value: 'payment', label: 'Payment Default Notice' },
    { value: 'breach', label: 'Contract Breach Notice' },
    { value: 'termination', label: 'Termination Notice' },
    { value: 'demand', label: 'Legal Demand Notice' },
    { value: 'cease', label: 'Cease and Desist Notice' }
  ]

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices', {
        headers: { 'x-user-id': 'demo-user' }
      })
      if (response.ok) {
        const data = await response.json()
        setNotices(data)
      }
    } catch (error) {
      toast.error('Failed to fetch notices')
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [])

  const handleGenerate = async () => {
    if (!formData.noticeType || !formData.recipient || !formData.subject) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedNotice(data.content)
        toast.success('Legal notice generated successfully')
        fetchNotices()
      }
    } catch (error) {
      toast.error('Failed to generate notice')
    } finally {
      setLoading(false)
    }
  }

  const downloadNotice = () => {
    if (!generatedNotice) return
    const blob = new Blob([generatedNotice], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    try {
      const a = document.createElement('a')
      a.href = url
      a.download = `${formData.noticeType}-notice.txt`
      a.click()
      toast.success('Notice downloaded successfully')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  if (!user && !authLoading) {
    window.location.href = '/auth/sign-in'
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-2 mr-2 sm:mr-4"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 sm:p-3 rounded-xl shadow-lg">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Legal Notice Generator</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">Create professional legal notices</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs sm:text-sm px-2 py-1">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Legal Notice</span>
                <span className="sm:hidden">Notice</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Form */}
          <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span>Generate Notice</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="noticeType" className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">Notice Type</Label>
                <select
                  id="noticeType"
                  className="w-full mt-1 p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 rounded-xl transition-colors text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={formData.noticeType}
                  onChange={(e) => setFormData({...formData, noticeType: e.target.value})}
                >
                  <option value="">Select notice type</option>
                  {noticeTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">Recipient</Label>
                <Input
                  id="recipient"
                  value={formData.recipient}
                  onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                  placeholder="Enter recipient name"
                  className="h-11 sm:h-12 text-sm sm:text-base border-2 focus:border-orange-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm sm:text-base font-medium">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Enter notice subject"
                  className="h-11 sm:h-12 text-sm sm:text-base border-2 focus:border-orange-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="details" className="text-sm sm:text-base font-medium">Details</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  placeholder="Enter additional details"
                  rows={4}
                  className="resize-none text-sm sm:text-base border-2 focus:border-orange-500 transition-colors min-h-[100px] sm:min-h-[120px]"
                />
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {loading ? (
                  <>
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Generate Notice</span>
                    <span className="sm:hidden">Generate</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span>Notice Preview</span>
                </CardTitle>
                {generatedNotice && (
                  <Button onClick={downloadNotice} variant="outline" size="sm" className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">Download Notice</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-800 dark:to-orange-900/20 p-4 sm:p-6 rounded-xl border-2 border-orange-200 dark:border-orange-700 min-h-[300px] sm:min-h-[400px]">
                <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {generatedNotice || 'Generated notice will appear here...'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Notices */}
        {notices.length > 0 && (
          <Card className="mt-6 sm:mt-8 shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span>Recent Notices</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {notices.slice(0, 5).map((notice) => (
                  <div key={notice.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-orange-50 dark:from-gray-700 dark:to-orange-900/20 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{notice.subject}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">To: {notice.recipient}</p>
                    </div>
                    <Badge variant="outline" className="w-fit text-xs sm:text-sm">{notice.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function NoticesPage() {
  return (
    <FeatureModal feature="NOTICES">
      <NoticesContent />
    </FeatureModal>
  )
}