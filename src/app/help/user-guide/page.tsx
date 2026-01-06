'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, Search, FileText, MessageSquare, Scale, Users, Newspaper, Bell, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function UserGuidePage() {
  const features = [
    {
      icon: MessageSquare,
      title: 'AI Assistant',
      description: 'Get instant legal advice and answers to your questions',
      steps: [
        'Navigate to AI Assistant from dashboard',
        'Type your legal question in the chat box',
        'Review the AI-generated response',
        'Use quick prompts for common queries'
      ]
    },
    {
      icon: FileText,
      title: 'Document Generator',
      description: 'Create professional legal documents automatically',
      steps: [
        'Go to Drafts section',
        'Select document type (contract, notice, etc.)',
        'Fill in required details',
        'Generate and download your document'
      ]
    },
    {
      icon: Scale,
      title: 'Judgment Summarizer',
      description: 'Analyze and summarize court judgments quickly',
      steps: [
        'Open Summarizer tool',
        'Upload judgment document or paste text',
        'Wait for AI analysis to complete',
        'Review key points and summary'
      ]
    },
    {
      icon: Users,
      title: 'CRM System',
      description: 'Manage your clients and cases efficiently',
      steps: [
        'Access CRM from dashboard',
        'Add new clients with contact details',
        'Create and assign cases',
        'Track client interactions and progress'
      ]
    },
    {
      icon: Search,
      title: 'Legal Research',
      description: 'Search through legal databases and case laws',
      steps: [
        'Go to Research section',
        'Enter search terms or case details',
        'Filter results by jurisdiction or date',
        'Save important findings for later'
      ]
    },
    {
      icon: Newspaper,
      title: 'Legal News',
      description: 'Stay updated with latest legal developments',
      steps: [
        'Visit News section',
        'Browse latest legal updates',
        'Filter by practice area',
        'Bookmark important articles'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Guide</h1>
              <p className="text-gray-600 dark:text-gray-400">Complete documentation for LAW.AI platform</p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🚀 Quick Start Guide</CardTitle>
            <CardDescription>Get started with LAW.AI in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Sign Up & Login</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create your account and access the dashboard</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Choose Your Plan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Select a plan that fits your needs</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Start Using Features</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Explore AI tools and boost productivity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Guides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feature.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium">{stepIndex + 1}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Additional Resources</CardTitle>
            <CardDescription>More ways to get help and learn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/help/tutorials">
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <FileText className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold mb-1">Video Tutorials</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Step-by-step video guides</p>
                </div>
              </Link>
              
              <Link href="/help/community">
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <Users className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-semibold mb-1">Community Forum</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connect with other users</p>
                </div>
              </Link>
              
              <Link href="/contact">
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <MessageSquare className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold mb-1">Contact Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get direct help from our team</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}