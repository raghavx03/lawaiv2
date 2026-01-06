'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  url: string
  publishedAt: string
  category: string
}

export default function NewsWidget() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNews = async () => {
    try {
      setLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      
      const response = await fetch('/api/news', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'max-age=600'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        if (data.ok && Array.isArray(data.news)) {
          setNews(data.news.slice(0, 5))
        } else {
          setNews([])
        }
      } else {
        console.error('News API error:', response.status, response.statusText)
        setNews([])
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Failed to fetch news:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Latest Legal News</CardTitle>
          <Newspaper className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Latest Legal News</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNews}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
          <Newspaper className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.length > 0 ? (
            news.map((article) => (
              <div key={article.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium leading-tight line-clamp-2 text-gray-900 dark:text-gray-100">
                    {article.title}
                  </h4>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 flex-shrink-0"
                  >
                    <ExternalLink className="h-3 w-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {article.source}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No news available</p>
          )}
        </div>
        <div className="mt-4">
          <Link href="/news">
            <Button variant="outline" size="sm" className="w-full">
              View All News
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}