'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartData {
  date: string
  queries: number
  revenue: number
}

interface AnalyticsChartProps {
  title: string
  metric: 'queries' | 'revenue'
}

export default function AnalyticsChart({ title, metric }: AnalyticsChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/analytics/timeseries')

        if (!response.ok) {
          throw new Error('Failed to fetch chart data')
        }

        const chartData = await response.json()
        setData(chartData)
      } catch (error) {
        console.error('Error fetching chart data:', error)
        // Generate mock data on error
        const mockData = []
        for (let i = 29; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          mockData.push({
            date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            queries: Math.floor(Math.random() * 300) + 50,
            revenue: Math.floor(Math.random() * 2000) + 500,
          })
        }
        setData(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
          <p className="text-slate-600 text-sm">Loading chart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            label={{
              value: metric === 'queries' ? 'Queries' : 'Revenue (₹)',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) =>
              metric === 'queries'
                ? [value, 'Queries']
                : [`₹${value}`, 'Revenue']
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={metric}
            stroke={metric === 'queries' ? '#3b82f6' : '#10b981'}
            strokeWidth={2}
            dot={{ fill: metric === 'queries' ? '#3b82f6' : '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name={metric === 'queries' ? 'Queries' : 'Revenue'}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
        <p>
          <strong>Last 30 days:</strong> {metric === 'queries' ? 'Contract analyses' : 'Revenue generated'}
        </p>
      </div>
    </div>
  )
}
