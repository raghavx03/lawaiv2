'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HelpCircle, MessageCircle, AlertTriangle, Mail, Send, Camera, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

interface HelpSupportModalProps {
  open: boolean
  onClose: () => void
}

export function HelpSupportModal({ open, onClose }: HelpSupportModalProps) {
  const { user } = useAuth()
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' })
  const [bugForm, setBugForm] = useState({ description: '', steps: '' })
  const [loading, setLoading] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)

  const faqs = [
    {
      question: "How do I upgrade my plan?",
      answer: "Click on your profile menu and select 'Upgrade Plan' to view available options."
    },
    {
      question: "What features are included in each plan?",
      answer: "FREE: 10 queries/month. BASIC: Unlimited core features. PLUS: 6 features. PRO: All 9 features."
    },
    {
      question: "How do I reset my password?",
      answer: "Go to Settings > Password Management to update your password securely."
    }
  ]

  const captureScreenshot = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const video = document.createElement('video')
        video.srcObject = stream
        video.play()
        
        video.addEventListener('loadedmetadata', () => {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(video, 0, 0)
          
          const dataURL = canvas.toDataURL('image/png')
          setScreenshot(dataURL)
          stream.getTracks().forEach(track => track.stop())
          toast.success('Screenshot captured successfully')
        })
      } else {
        toast.error('Screenshot capture not supported in this browser')
      }
    } catch (error) {
      toast.error('Failed to capture screenshot')
    }
  }

  const sendEmail = async (type: 'support' | 'bug') => {
    setLoading(true)
    try {
      const payload = {
        type,
        userEmail: user?.email || 'anonymous@example.com',
        subject: type === 'support' ? emailForm.subject : 'Bug Report',
        message: type === 'support' ? emailForm.message : `Description: ${bugForm.description}\n\nSteps to reproduce: ${bugForm.steps}`,
        screenshot: type === 'bug' ? screenshot : null
      }

      const response = await fetch('/api/support/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success('Email sent successfully!')
        if (type === 'support') {
          setEmailForm({ subject: '', message: '' })
        } else {
          setBugForm({ description: '', steps: '' })
          setScreenshot(null)
        }
      } else {
        toast.error('Failed to send email')
      }
    } catch (error) {
      toast.error('Error sending email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Help & Support</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="report">Report Bug</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Frequently Asked Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Send Email Support</span>
                </CardTitle>
                <CardDescription>
                  Send us a message and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={emailForm.message}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue in detail..."
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={() => sendEmail('support')}
                  disabled={loading || !emailForm.subject || !emailForm.message}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Email'}
                </Button>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>To:</strong> ragsproai@gmail.com<br/>
                    <strong>From:</strong> {user?.email || 'Your account email'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Report Bug or Issue</span>
                </CardTitle>
                <CardDescription>
                  Help us improve by reporting bugs with screenshots
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Bug Description</Label>
                  <Textarea
                    id="description"
                    value={bugForm.description}
                    onChange={(e) => setBugForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What went wrong? What did you expect to happen?"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="steps">Steps to Reproduce</Label>
                  <Textarea
                    id="steps"
                    value={bugForm.steps}
                    onChange={(e) => setBugForm(prev => ({ ...prev, steps: e.target.value }))}
                    placeholder="1. Go to...\n2. Click on...\n3. See error"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={captureScreenshot}
                    variant="outline"
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Screenshot
                  </Button>
                  <Button 
                    onClick={() => sendEmail('bug')}
                    disabled={loading || !bugForm.description}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Bug Report'}
                  </Button>
                </div>
                {screenshot && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">✓ Screenshot captured and will be attached</p>
                  </div>
                )}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Tip:</strong> Include browser info, device type, and any error messages you see.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📚 Learning Resources</CardTitle>
                <CardDescription>Comprehensive guides and community support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a href="/help/user-guide" target="_blank" className="block p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center group">
                    <FileText className="h-10 w-10 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">User Guide</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Complete documentation with step-by-step instructions</p>
                    <div className="text-xs text-blue-600 font-medium">Read Documentation →</div>
                  </a>
                  
                  <a href="/help/community" target="_blank" className="block p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center group">
                    <MessageCircle className="h-10 w-10 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Community Forum</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Connect with 2,800+ legal professionals</p>
                    <div className="text-xs text-green-600 font-medium">Join Community →</div>
                  </a>
                  
                  <a href="/help/tutorials" target="_blank" className="block p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center group">
                    <HelpCircle className="h-10 w-10 mx-auto mb-3 text-purple-600 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Video Tutorials</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">24+ step-by-step video guides</p>
                    <div className="text-xs text-purple-600 font-medium">Watch Tutorials →</div>
                  </a>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">💡</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Quick Start Tip</h5>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        New to LAW.AI? Start with our <strong>Getting Started</strong> tutorial, then explore the User Guide for detailed feature explanations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}