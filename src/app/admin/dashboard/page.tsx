'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Users, BarChart3, DollarSign, Activity, AlertCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard, PremiumButton, PremiumCard, SkeletonLoader } from '@/components/premium'
import MetricsCard from '@/components/admin/MetricsCard'
import AnalyticsChart from '@/components/admin/AnalyticsChart'
import HeatmapChart from '@/components/admin/HeatmapChart'
import ConversionFunnel from '@/components/admin/ConversionFunnel'
import RevenueMetrics from '@/components/admin/RevenueMetrics'
import { toast } from 'react-hot-toast'

interface Metrics {
  totalQueries: number
  dailyQueries: number
  activeUsers: number
  conversionRate: number
  mrr: number
  growthRate: number
  domainDistribution: Array<{ domain: string; count: number; percentage: number }>
  errorRate: number
  avgAnalysisTime: number
  userRetention: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/analytics')

        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }

        const data = await response.json()
        setMetrics(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching metrics:', err)
        setError('Failed to load analytics')
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()

    // Auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const handleExport = async (format: 'csv' | 'pdf', dataType: string) => {
    try {
      setExporting(true)
      const response = await fetch(
        `/api/admin/analytics/export?format=${format}&dataType=${dataType}`,
        { method: 'GET' }
      )

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${dataType}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`${format.toUpperCase()} exported successfully!`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="h-10 w-48 skeleton-premium rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 skeleton-premium rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <PremiumCard className="text-center">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">{error || 'Failed to load analytics'}</p>
            <PremiumButton
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </PremiumButton>
          </PremiumCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <PremiumButton
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </PremiumButton>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-premium-h1 text-slate-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-premium-body text-slate-600 dark:text-slate-400 mt-1">Real-time analytics and metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (30s)
              </label>
              <PremiumButton
                onClick={() => window.location.reload()}
                variant="secondary"
                size="sm"
              >
                Refresh
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Total Queries"
            value={metrics.totalQueries.toLocaleString()}
            icon={<BarChart3 className="h-5 w-5" />}
            color="indigo"
            trend={{ value: 12, isPositive: true, label: 'from last month' }}
          />
          <StatCard
            label="Queries Today"
            value={metrics.dailyQueries.toLocaleString()}
            icon={<Activity className="h-5 w-5" />}
            color="emerald"
            trend={{ value: 8, isPositive: true, label: 'today' }}
          />
          <StatCard
            label="Active Users"
            value={metrics.activeUsers.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
            color="blue"
            trend={{ value: 5, isPositive: true, label: 'this week' }}
          />
          <StatCard
            label="Conversion Rate"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            color="amber"
            trend={{ value: 2, isPositive: true, label: 'improvement' }}
          />
          <StatCard
            label="MRR"
            value={`₹${metrics.mrr.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            color="emerald"
            trend={{ value: metrics.growthRate, isPositive: true, label: 'growth' }}
          />
          <StatCard
            label="Growth Rate"
            value={`${metrics.growthRate.toFixed(1)}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            color="indigo"
            trend={{ value: 3, isPositive: true, label: 'MoM' }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Time Series Charts */}
          <div className="lg:col-span-2 space-y-6">
            <AnalyticsChart title="Queries per Day" metric="queries" />
            <AnalyticsChart title="Revenue Trend" metric="revenue" />
          </div>

          {/* Heatmap */}
          <div>
            <HeatmapChart domains={metrics.domainDistribution} />
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ConversionFunnel />
          <RevenueMetrics />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <PremiumCard title="Error Rate" hoverable>
            <p className="text-premium-h2 text-slate-900 dark:text-white">{metrics.errorRate}%</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">✓ Excellent</p>
          </PremiumCard>
          <PremiumCard title="Avg Analysis Time" hoverable>
            <p className="text-premium-h2 text-slate-900 dark:text-white">{metrics.avgAnalysisTime}s</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">✓ Fast</p>
          </PremiumCard>
          <PremiumCard title="User Retention" hoverable>
            <p className="text-premium-h2 text-slate-900 dark:text-white">{metrics.userRetention}%</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">✓ Strong</p>
          </PremiumCard>
        </div>

        {/* Export Section */}
        <PremiumCard title="Export Analytics" hoverable>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Export as CSV</h3>
              <div className="space-y-2">
                <PremiumButton
                  onClick={() => handleExport('csv', 'queries')}
                  disabled={exporting}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Download className="w-4 h-4" />
                  Query Logs
                </PremiumButton>
                <PremiumButton
                  onClick={() => handleExport('csv', 'analytics')}
                  disabled={exporting}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Download className="w-4 h-4" />
                  Analytics Events
                </PremiumButton>
                <PremiumButton
                  onClick={() => handleExport('csv', 'subscriptions')}
                  disabled={exporting}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Download className="w-4 h-4" />
                  Subscriptions
                </PremiumButton>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Export as PDF</h3>
              <div className="space-y-2">
                <PremiumButton
                  onClick={() => handleExport('pdf', 'queries')}
                  disabled={exporting}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Download className="w-4 h-4" />
                  Monthly Report
                </PremiumButton>
                <PremiumButton
                  onClick={() => handleExport('pdf', 'analytics')}
                  disabled={exporting}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Download className="w-4 h-4" />
                  Analytics Report
                </PremiumButton>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Footer Note */}
        <PremiumCard className="mt-8 border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/30">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            💡 <strong>Tip:</strong> This dashboard updates every 30 seconds. Use these metrics to track product performance and demonstrate traction to investors.
          </p>
        </PremiumCard>
      </div>
    </div>
  )
}
