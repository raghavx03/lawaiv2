'use client'

import { useState, useEffect } from 'react'
import { useCase } from '@/context/CaseContext'
import { Activity, FileText, MessageSquare, Upload, Clock, TrendingUp, CheckCircle } from 'lucide-react'

interface CaseHealth {
  documentsGenerated: number
  aiAssists: number
  filesUploaded: number
  lastActivity: string | null
  estimatedTimeSaved: number // in minutes
  healthScore: number // 0-100
}

export function CaseHealthWidget() {
  const { activeCase } = useCase()
  const [health, setHealth] = useState<CaseHealth | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeCase) {
      fetchCaseHealth()
    } else {
      setHealth(null)
    }
  }, [activeCase])

  const fetchCaseHealth = async () => {
    if (!activeCase) return
    setLoading(true)
    
    try {
      const response = await fetch(`/api/case-tracker/health?caseId=${activeCase.id}`)
      if (response.ok) {
        const data = await response.json()
        setHealth(data)
      } else {
        // Fallback to mock data if API not available
        setHealth({
          documentsGenerated: 0,
          aiAssists: 0,
          filesUploaded: 0,
          lastActivity: activeCase.createdAt,
          estimatedTimeSaved: 0,
          healthScore: 20
        })
      }
    } catch (error) {
      // Fallback
      setHealth({
        documentsGenerated: 0,
        aiAssists: 0,
        filesUploaded: 0,
        lastActivity: activeCase.createdAt,
        estimatedTimeSaved: 0,
        healthScore: 20
      })
    } finally {
      setLoading(false)
    }
  }

  if (!activeCase) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
        <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Select a case to see health metrics</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100'
    if (score >= 40) return 'text-amber-600 bg-amber-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getHealthLabel = (score: number) => {
    if (score >= 70) return 'Active'
    if (score >= 40) return 'Moderate'
    return 'New'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Case Health
        </h3>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getHealthColor(health?.healthScore || 0)}`}>
          {getHealthLabel(health?.healthScore || 0)}
        </span>
      </div>

      {/* Health Score Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-gray-600">Activity Score</span>
          <span className="text-sm font-medium text-gray-900">{health?.healthScore || 0}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              (health?.healthScore || 0) >= 70 ? 'bg-green-500' : 
              (health?.healthScore || 0) >= 40 ? 'bg-amber-500' : 'bg-gray-400'
            }`}
            style={{ width: `${health?.healthScore || 0}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <FileText className="h-3.5 w-3.5" />
            Documents
          </div>
          <p className="text-lg font-semibold text-gray-900">{health?.documentsGenerated || 0}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <MessageSquare className="h-3.5 w-3.5" />
            AI Assists
          </div>
          <p className="text-lg font-semibold text-gray-900">{health?.aiAssists || 0}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Upload className="h-3.5 w-3.5" />
            Files
          </div>
          <p className="text-lg font-semibold text-gray-900">{health?.filesUploaded || 0}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Clock className="h-3.5 w-3.5" />
            Time Saved
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {health?.estimatedTimeSaved ? `${Math.round(health.estimatedTimeSaved / 60)}h` : '0h'}
          </p>
        </div>
      </div>

      {/* Last Activity */}
      {health?.lastActivity && (
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Last activity: {new Date(health.lastActivity).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  )
}
