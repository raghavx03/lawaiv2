'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCase } from '@/context/CaseContext'
import { Briefcase, Plus, FolderOpen, X, ChevronDown, Check } from 'lucide-react'

interface CaseRequiredPromptProps {
  feature: string
  onCaseSelected?: () => void
}

export function CaseRequiredPrompt({ feature, onCaseSelected }: CaseRequiredPromptProps) {
  const { cases, activeCase, setActiveCase, loading } = useCase()
  const [showCaseList, setShowCaseList] = useState(false)

  if (activeCase) return null

  const handleSelectCase = (caseItem: typeof activeCase) => {
    if (caseItem) {
      setActiveCase(caseItem)
      setShowCaseList(false)
      onCaseSelected?.()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Briefcase className="h-7 w-7 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Case</h3>
      <p className="text-gray-500 text-sm mb-6">
        Choose or create a case to use {feature}. All your work will be organized and saved.
      </p>

      <div className="space-y-3">
        {/* Select Existing Case */}
        {cases.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowCaseList(!showCaseList)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Select existing case</span>
              </div>
              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showCaseList ? 'rotate-180' : ''}`} />
            </button>

            {showCaseList && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {cases.slice(0, 10).map((caseItem) => (
                  <button
                    key={caseItem.id}
                    onClick={() => handleSelectCase(caseItem)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                  >
                    <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{caseItem.cnrNumber}</p>
                      {caseItem.petitioner && (
                        <p className="text-xs text-gray-500 truncate">{caseItem.petitioner}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create New Case */}
        <Link href="/cases/new">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors">
            <Plus className="h-5 w-5" />
            Create new case
          </button>
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        💡 Organizing work by case helps you find everything later
      </p>
    </div>
  )
}

// Hook to check if case is required
export function useCaseRequired() {
  const { activeCase, cases } = useCase()
  
  return {
    hasActiveCase: !!activeCase,
    hasCases: cases.length > 0,
    shouldPrompt: !activeCase
  }
}
