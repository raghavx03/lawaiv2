'use client'

import Link from 'next/link'
import { ArrowLeft, Play, Clock, User, BookOpen, Video, FileText, MessageSquare, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TutorialsPage() {
  const tutorials = [
    {
      id: 1,
      title: 'Getting Started with LAW.AI',
      description: 'Complete walkthrough of the platform and its features',
      duration: '12:45',
      level: 'Beginner',
      category: 'Getting Started',
      thumbnail: '🚀',
      views: '2.1k',
      featured: true
    },
    {
      id: 2,
      title: 'AI Assistant: Advanced Query Techniques',
      description: 'Learn how to craft effective legal queries for better results',
      duration: '8:30',
      level: 'Intermediate',
      category: 'AI Assistant',
      thumbnail: '🤖',
      views: '1.8k',
      featured: true
    },
    {
      id: 3,
      title: 'Document Generation Masterclass',
      description: 'Create professional legal documents with AI assistance',
      duration: '15:20',
      level: 'Intermediate',
      category: 'Document Generator',
      thumbnail: '📄',
      views: '1.5k',
      featured: false
    },
    {
      id: 4,
      title: 'Judgment Analysis & Summarization',
      description: 'Extract key insights from court judgments efficiently',
      duration: '10:15',
      level: 'Beginner',
      category: 'Summarizer',
      thumbnail: '⚖️',
      views: '1.2k',
      featured: false
    },
    {
      id: 5,
      title: 'Client Management Best Practices',
      description: 'Organize and manage your clients using the CRM system',
      duration: '11:40',
      level: 'Beginner',
      category: 'CRM',
      thumbnail: '👥',
      views: '980',
      featured: false
    },
    {
      id: 6,
      title: 'Legal Research Strategies',
      description: 'Advanced techniques for comprehensive legal research',
      duration: '13:25',
      level: 'Advanced',
      category: 'Research',
      thumbnail: '🔍',
      views: '756',
      featured: false
    }
  ]

  const categories = [
    { name: 'All Tutorials', count: 24, active: true },
    { name: 'Getting Started', count: 6, active: false },
    { name: 'AI Assistant', count: 8, active: false },
    { name: 'Document Generator', count: 5, active: false },
    { name: 'CRM', count: 3, active: false },
    { name: 'Research', count: 2, active: false }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Video Tutorials</h1>
              <p className="text-gray-600 dark:text-gray-400">Step-by-step guides to master LAW.AI</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      category.active 
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Path */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📚 Recommended Learning Path</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                  <span className="text-sm">Getting Started</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                  <span className="text-sm">AI Assistant Basics</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                  <span className="text-sm">Document Generation</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                  <span className="text-sm">Advanced Features</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Featured Tutorials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-purple-600" />
                  Featured Tutorials
                </CardTitle>
                <CardDescription>Most popular and recommended tutorials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutorials.filter(t => t.featured).map((tutorial) => (
                    <div key={tutorial.id} className="group cursor-pointer">
                      <div className="relative bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-8 mb-3 text-center">
                        <div className="text-4xl mb-2">{tutorial.thumbnail}</div>
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Play className="h-6 w-6 text-white ml-1" />
                          </div>
                        </div>
                        <Badge className="absolute top-2 right-2 bg-white/20 text-white">Featured</Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-purple-600 transition-colors">
                        {tutorial.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{tutorial.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tutorial.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {tutorial.views} views
                        </div>
                        <Badge className={getLevelColor(tutorial.level)} variant="secondary">
                          {tutorial.level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Tutorials */}
            <Card>
              <CardHeader>
                <CardTitle>All Tutorials</CardTitle>
                <CardDescription>Browse our complete tutorial library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tutorials.map((tutorial) => (
                    <div key={tutorial.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                        {tutorial.thumbnail}
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-purple-600 transition-colors">
                          {tutorial.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                          {tutorial.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tutorial.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {tutorial.views} views
                          </div>
                          <Badge className={getLevelColor(tutorial.level)} variant="secondary">
                            {tutorial.level}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Resources */}
            <Card>
              <CardHeader>
                <CardTitle>📖 Additional Learning Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/help/user-guide">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                      <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">User Guide</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Written documentation</p>
                    </div>
                  </Link>
                  
                  <Link href="/help/community">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                      <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Community</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ask questions & share tips</p>
                    </div>
                  </Link>
                  
                  <Link href="/contact">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                      <Scale className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Support</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized help</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}