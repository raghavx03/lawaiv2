'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, ExternalLink, Newspaper } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { sanitizeText, sanitizeHtml, isValidUrl, generateSecureId, isValidDateString } from '@/lib/security-utils'

interface LegalInsight {
  id: string
  title: string
  summary: string
  category: string
  source: string
  url: string
  publishedAt: string
  trending: boolean
}

export function LegalInsightsWidget() {
  const [insights, setInsights] = useState<LegalInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/news?limit=3&trending=true')
        if (response.ok) {
          const data = await response.json()
          // Transform news data to insights format with security sanitization
          const transformedInsights = data.slice(0, 3).map((item: any) => ({
            id: item.id || generateSecureId(),
            title: sanitizeText(item.title || ''),
            summary: sanitizeText(item.summary || item.content?.substring(0, 150) + '...' || ''),
            category: sanitizeText(item.category || 'Legal News'),
            source: sanitizeText(item.source || ''),
            url: isValidUrl(item.url) ? item.url : '#',
            publishedAt: item.publishedAt || item.createdAt,
            trending: true
          }))
          setInsights(transformedInsights)
        } else {
          // Fallback to mock data if API fails
          setInsights([
            {
              id: '1',
              title: 'Supreme Court Ruling on Digital Privacy Rights',
              summary: 'New landmark judgment establishes stronger protections for digital privacy in the modern era...',
              category: 'Constitutional Law',
              source: 'Legal Tribune',
              url: '#',
              publishedAt: new Date().toISOString(),
              trending: true
            },
            {
              id: '2',
              title: 'Corporate Law Updates: New Compliance Requirements',
              summary: 'Recent amendments to corporate governance rules introduce stricter compliance measures...',
              category: 'Corporate Law',
              source: 'Business Legal',
              url: '#',
              publishedAt: new Date(Date.now() - 86400000).toISOString(),
              trending: true
            },
            {
              id: '3',
              title: 'Environmental Law: Climate Change Litigation Trends',
              summary: 'Analysis of emerging patterns in climate-related legal cases across various jurisdictions...',
              category: 'Environmental Law',
              source: 'Green Legal Review',
              url: '#',
              publishedAt: new Date(Date.now() - 172800000).toISOString(),
              trending: true
            }
          ])
        }
      } catch (error) {
        console.error('Failed to fetch legal insights:', error)
        // Use fallback data
        setInsights([
          {
            id: '1',
            title: 'Latest Legal Developments',
            summary: 'Stay updated with the latest legal news and insights relevant to your practice...',
            category: 'General',
            source: 'Legal Updates',
            url: '#',
            publishedAt: new Date().toISOString(),
            trending: false
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
    const interval = setInterval(fetchInsights, 300000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const getCategoryColor = (category: string) => {
    const colors = {
      'Constitutional Law': 'bg-blue-100 text-blue-800',
      'Corporate Law': 'bg-green-100 text-green-800',
      'Environmental Law': 'bg-emerald-100 text-emerald-800',
      'Criminal Law': 'bg-red-100 text-red-800',
      'Civil Law': 'bg-purple-100 text-purple-800',
      'Legal News': 'bg-orange-100 text-orange-800',
      'General': 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Legal Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Newspaper className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No legal insights available</p>
              <p className="text-sm">Check back later for updates</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => isValidUrl(insight.url) && window.open(insight.url, '_blank')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getCategoryColor(insight.category)}`}>
                        {insight.category}
                      </Badge>
                      {insight.trending && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    {insight.url !== '#' && (
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    )}
                  </div>
                  
                  <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                    {insight.title}
                  </h4>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {insight.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{insight.source}</span>
                    <span>
                      {isValidDateString(insight.publishedAt) 
                        ? formatDistanceToNow(new Date(insight.publishedAt), { addSuffix: true })
                        : 'Recently'
                      }
                    </span>
                  </div>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="text-center pt-2"
              >
                <button 
                  onClick={() => window.location.href = '/news'}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  View all legal news →
                </button>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}