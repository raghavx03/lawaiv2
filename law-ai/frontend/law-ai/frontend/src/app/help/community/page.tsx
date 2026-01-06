'use client'

import Link from 'next/link'
import { ArrowLeft, Users, MessageSquare, Heart, Star, TrendingUp, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function CommunityPage() {
  const discussions = [
    {
      title: 'Best practices for contract analysis using AI',
      author: 'Legal Expert',
      replies: 24,
      likes: 45,
      category: 'AI Assistant',
      time: '2 hours ago',
      trending: true
    },
    {
      title: 'How to optimize document generation workflow',
      author: 'Practice Manager',
      replies: 18,
      likes: 32,
      category: 'Document Generator',
      time: '5 hours ago',
      trending: false
    },
    {
      title: 'Case management tips for solo practitioners',
      author: 'Solo Lawyer',
      replies: 31,
      likes: 67,
      category: 'CRM',
      time: '1 day ago',
      trending: true
    },
    {
      title: 'Legal research shortcuts and techniques',
      author: 'Research Specialist',
      replies: 15,
      likes: 28,
      category: 'Research',
      time: '2 days ago',
      trending: false
    }
  ]

  const categories = [
    { name: 'AI Assistant', count: 156, color: 'bg-blue-100 text-blue-800' },
    { name: 'Document Generator', count: 89, color: 'bg-green-100 text-green-800' },
    { name: 'CRM', count: 67, color: 'bg-purple-100 text-purple-800' },
    { name: 'Research', count: 45, color: 'bg-orange-100 text-orange-800' },
    { name: 'General', count: 234, color: 'bg-gray-100 text-gray-800' }
  ]

  const stats = [
    { label: 'Active Members', value: '2,847', icon: Users },
    { label: 'Discussions', value: '1,234', icon: MessageSquare },
    { label: 'Solutions Shared', value: '856', icon: Heart },
    { label: 'Average Rating', value: '4.8', icon: Star }
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
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Community Forum</h1>
              <p className="text-gray-600 dark:text-gray-400">Connect with fellow legal professionals</p>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-2">Welcome to LAW.AI Community! 👋</h2>
                <p className="mb-4 opacity-90">
                  Join thousands of legal professionals sharing knowledge, tips, and best practices.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" size="sm">
                    Start Discussion
                  </Button>
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-green-600">
                    Browse Topics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trending Discussions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Trending Discussions
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {discussions.map((discussion, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600">
                            {discussion.title}
                          </h3>
                          {discussion.trending && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                              🔥 Trending
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {discussion.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {discussion.replies} replies
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {discussion.likes} likes
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {discussion.time}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {discussion.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Community Guidelines</CardTitle>
                <CardDescription>Help us maintain a respectful and helpful environment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <p className="text-sm">Be respectful and professional in all interactions</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <p className="text-sm">Share knowledge and help others learn</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <p className="text-sm">Keep discussions relevant to legal practice and LAW.AI</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <p className="text-sm">No spam, self-promotion, or off-topic content</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Discussion Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <span className="font-medium">{category.name}</span>
                    <Badge className={category.color}>{category.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="default">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start New Discussion
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Find Members
                </Button>
                <Button className="w-full" variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  My Bookmarks
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}