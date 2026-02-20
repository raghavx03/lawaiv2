'use client'

import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

interface RiskAnalysis {
  overallRisk: number
  riskLevel: string
  confidence: number
  analysisTime: number
  redFlags: any[]
  warnings: any[]
  suggestedRevisions: string[]
}

interface RiskMeterProps {
  analysis: RiskAnalysis
}

export default function RiskMeter({ analysis }: RiskMeterProps) {
  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'from-green-500 to-emerald-500'
    if (risk < 70) return 'from-yellow-500 to-amber-500'
    return 'from-red-500 to-rose-500'
  }

  const getRiskBgColor = (risk: number) => {
    if (risk < 30) return 'bg-green-50'
    if (risk < 70) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const getRiskTextColor = (risk: number) => {
    if (risk < 30) return 'text-green-700'
    if (risk < 70) return 'text-yellow-700'
    return 'text-red-700'
  }

  const getRiskIcon = (risk: number) => {
    if (risk < 30) return <CheckCircle className="w-6 h-6 text-green-600" />
    if (risk < 70) return <AlertTriangle className="w-6 h-6 text-yellow-600" />
    return <AlertCircle className="w-6 h-6 text-red-600" />
  }

  return (
    <div className={`rounded-lg p-8 ${getRiskBgColor(analysis.overallRisk)}`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {getRiskIcon(analysis.overallRisk)}
        <div>
          <h3 className="text-sm font-medium text-slate-600">Overall Risk Score</h3>
          <p className={`text-3xl font-bold ${getRiskTextColor(analysis.overallRisk)}`}>
            {analysis.overallRisk}%
          </p>
        </div>
      </div>

      {/* Risk Level */}
      <p className={`text-lg font-semibold mb-6 ${getRiskTextColor(analysis.overallRisk)}`}>
        {analysis.riskLevel}
      </p>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Risk Level</span>
          <span className="text-sm text-slate-600">
            {analysis.overallRisk < 30 ? 'Low' : analysis.overallRisk < 70 ? 'Moderate' : 'High'}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getRiskColor(analysis.overallRisk)} transition-all duration-1000 ease-out`}
            style={{ width: `${analysis.overallRisk}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/50 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">Red Flags</p>
          <p className="text-2xl font-bold text-red-600">{analysis.redFlags.length}</p>
        </div>
        <div className="bg-white/50 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">Warnings</p>
          <p className="text-2xl font-bold text-yellow-600">{analysis.warnings.length}</p>
        </div>
        <div className="bg-white/50 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">Confidence</p>
          <p className="text-2xl font-bold text-blue-600">{analysis.confidence}%</p>
        </div>
      </div>

      {/* Analysis Time */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          Analysis completed in <span className="font-semibold">{analysis.analysisTime.toFixed(2)}s</span>
        </p>
      </div>
    </div>
  )
}
