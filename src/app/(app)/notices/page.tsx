'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Bell, Send, Download, ArrowLeft } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { FeatureModal } from '@/components/auth/FeatureModal'
import { PremiumButton, PremiumCard } from '@/components/premium'

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
        toast.success('Notice generated successfully')
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
      toast.success('Notice downloaded')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  if (!user && !authLoading) {
    window.location.href = '/auth/login'
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                icon={<ArrowLeft className="h-5 w-5" />}
              >
              </PremiumButton>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950/30 rounded-lg">
                <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-premium-h1 text-slate-900 dark:text-white">Legal Notices</h1>
                <p className="text-premium-body text-slate-600 dark:text-slate-400 hidden sm:block">Generate professional legal notices</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <PremiumCard title="Generate Notice">
            <div className="space-y-4">
              <div>
                <Label className="text-premium-body text-slate-700 dark:text-slate-300">Notice Type *</Label>
                <select
                  className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={formData.noticeType}
                  onChange={(e) => setFormData({...formData, noticeType: e.target.value})}
                >
                  <option value="">Select notice type</option>
                  {noticeTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label className="text-premium-body text-slate-700 dark:text-slate-300">Recipient *</Label>
                <Input
                  value={formData.recipient}
                  onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                  placeholder="Enter recipient name"
                  className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-indigo-600"
                />
              </div>
              
              <div>
                <Label className="text-premium-body text-slate-700 dark:text-slate-300">Subject *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Enter notice subject"
                  className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-indigo-600"
                />
              </div>
              
              <div>
                <Label className="text-premium-body text-slate-700 dark:text-slate-300">Details</Label>
                <Textarea
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  placeholder="Enter additional details"
                  rows={4}
                  className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-indigo-600"
                />
              </div>
              
              <PremiumButton 
                onClick={handleGenerate} 
                disabled={loading}
                variant="primary"
                size="md"
                className="w-full"
                icon={loading ? undefined : <Send className="h-4 w-4" />}
              >
                {loading ? 'Generating...' : 'Generate Notice'}
              </PremiumButton>
            </div>
          </PremiumCard>

          {/* Preview */}
          <PremiumCard title="Preview">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-premium-h3 text-slate-900 dark:text-white">Preview</h3>
              {generatedNotice && (
                <PremiumButton onClick={downloadNotice} variant="secondary" size="sm" icon={<Download className="h-4 w-4" />}>
                  Download
                </PremiumButton>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[300px]">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {generatedNotice || 'Generated notice will appear here...'}
              </pre>
            </div>
          </PremiumCard>
        </div>

        {/* Recent Notices */}
        {notices.length > 0 && (
          <PremiumCard className="mt-6" title="Recent Notices">
            <div className="space-y-3">
              {notices.slice(0, 5).map((notice) => (
                <div key={notice.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{notice.subject}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">To: {notice.recipient}</p>
                  </div>
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">{notice.type}</Badge>
                </div>
              ))}
            </div>
          </PremiumCard>
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
