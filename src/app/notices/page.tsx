'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Bell, Send, Download, ArrowLeft } from 'lucide-react'
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
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 bg-gray-900 rounded-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Legal Notices</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Generate professional legal notices</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Send className="h-5 w-5 text-gray-600" />
                </div>
                <span>Generate Notice</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notice Type *</Label>
                <select
                  className="w-full mt-1 p-3 border border-gray-200 rounded-lg text-sm"
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
                <Label>Recipient *</Label>
                <Input
                  value={formData.recipient}
                  onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                  placeholder="Enter recipient name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Subject *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Enter notice subject"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Details</Label>
                <Textarea
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  placeholder="Enter additional details"
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Generate Notice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Bell className="h-5 w-5 text-gray-600" />
                  </div>
                  <span>Preview</span>
                </CardTitle>
                {generatedNotice && (
                  <Button onClick={downloadNotice} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[300px]">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {generatedNotice || 'Generated notice will appear here...'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Notices */}
        {notices.length > 0 && (
          <Card className="mt-6 border border-gray-200">
            <CardHeader>
              <CardTitle>Recent Notices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notices.slice(0, 5).map((notice) => (
                  <div key={notice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{notice.subject}</p>
                      <p className="text-sm text-gray-500">To: {notice.recipient}</p>
                    </div>
                    <Badge variant="outline">{notice.type}</Badge>
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
