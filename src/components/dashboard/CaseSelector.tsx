'use client'

import { useState, useRef, useEffect } from 'react'
import { useCase } from '@/context/CaseContext'
import { Briefcase, ChevronDown, X, Plus, Check } from 'lucide-react'
import Link from 'next/link'

export function CaseSelector() {
  const { cases, activeCase, setActiveCase, loading } = useCase()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
          activeCase 
            ? 'bg-gray-900 text-white border-gray-900' 
            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
        }`}
      >
        <Briefcase className="h-4 w-4" />
        <span className="text-sm font-medium max-w-[120px] sm:max-w-[180px] truncate">
          {activeCase ? activeCase.cnrNumber : 'No Case Selected'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Case</p>
            <p className="text-xs text-gray-400 mt-0.5">All work will be linked to selected case</p>
          </div>

          {/* No Case Option */}
          <button
            onClick={() => { setActiveCase(null); setIsOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
              !activeCase ? 'bg-gray-50' : ''
            }`}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-700">No Case</p>
              <p className="text-xs text-gray-400">Work without case linking</p>
            </div>
            {!activeCase && <Check className="h-4 w-4 text-gray-900" />}
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Cases List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : cases.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No cases tracked yet</p>
              </div>
            ) : (
              cases.slice(0, 10).map((caseItem) => (
                <button
                  key={caseItem.id}
                  onClick={() => { setActiveCase(caseItem); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    activeCase?.id === caseItem.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{caseItem.cnrNumber}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {caseItem.petitioner || caseItem.caseType || 'Case'}
                    </p>
                  </div>
                  {activeCase?.id === caseItem.id && <Check className="h-4 w-4 text-gray-900" />}
                </button>
              ))
            )}
          </div>

          {/* Add New Case */}
          <div className="border-t border-gray-100">
            <Link
              href="/case-tracker"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Add New Case</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
