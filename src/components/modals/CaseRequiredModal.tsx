'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCase } from '@/context/CaseContext'
import { Briefcase, Plus, ChevronRight, Scale, X } from 'lucide-react'

interface CaseRequiredModalProps {
  isOpen: boolean
  onClose?: () => void
  onCaseSelected?: () => void
}

export function CaseRequiredModal({ isOpen, onClose, onCaseSelected }: CaseRequiredModalProps) {
  const router = useRouter()
  const { openCases, setActiveCase, loading } = useCase()
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSelectCase = (caseItem: typeof openCases[0]) => {
    setActiveCase(caseItem)
    onCaseSelected?.()
  }

  const handleCreateNew = () => {
    router.push('/cases/new')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Select a Case to Continue</h2>
              <p className="text-white/60 text-sm mt-0.5">LAW.AI works case-wise for better context</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-5">
            All AI responses, documents, and notes will be linked to your selected case. This helps maintain organized records and provides better legal assistance.
          </p>

          {/* Case List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : openCases.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {openCases.slice(0, 8).map((caseItem) => (
                <button
                  key={caseItem.id}
                  onClick={() => handleSelectCase(caseItem)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    selectedCaseId === caseItem.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{caseItem.cnrNumber}</p>
                    {caseItem.petitioner && (
                      <p className="text-xs text-gray-500 truncate">
                        {caseItem.petitioner} vs {caseItem.respondent}
                      </p>
                    )}
                    {caseItem.court && (
                      <p className="text-xs text-gray-400 truncate">{caseItem.court}</p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No cases found</p>
              <p className="text-gray-400 text-xs mt-1">Create your first case to get started</p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Create New Case */}
          <button
            onClick={handleCreateNew}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create New Case
          </button>

          {/* Info */}
          <p className="text-xs text-gray-400 text-center mt-4">
            💡 Tip: You can switch cases anytime from the top navigation
          </p>
        </div>

        {/* Optional Close Button (only if onClose provided) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
