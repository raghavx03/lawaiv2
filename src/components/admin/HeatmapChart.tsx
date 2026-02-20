'use client'

interface Domain {
  domain: string
  count: number
  percentage: number
}

interface HeatmapChartProps {
  domains: Domain[]
}

export default function HeatmapChart({ domains }: HeatmapChartProps) {
  const getColor = (percentage: number) => {
    if (percentage >= 30) return 'bg-red-500'
    if (percentage >= 20) return 'bg-orange-500'
    if (percentage >= 10) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getTextColor = (percentage: number) => {
    if (percentage >= 30) return 'text-red-700'
    if (percentage >= 20) return 'text-orange-700'
    if (percentage >= 10) return 'text-yellow-700'
    return 'text-green-700'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Legal Domain Distribution
      </h3>

      <div className="space-y-4">
        {domains.map((domain, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{domain.domain}</span>
              <span className={`text-sm font-bold ${getTextColor(domain.percentage)}`}>
                {domain.percentage}%
              </span>
            </div>

            <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden">
              <div
                className={`h-full ${getColor(domain.percentage)} transition-all duration-500 flex items-center justify-center`}
                style={{ width: `${domain.percentage}%` }}
              >
                {domain.percentage > 15 && (
                  <span className="text-xs font-bold text-white">
                    {domain.count}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {domain.count.toLocaleString()} contracts analyzed
            </p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-600 mb-3">Intensity Legend</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-slate-600">&lt;10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-slate-600">10-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-slate-600">20-30%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-slate-600">&gt;30%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
