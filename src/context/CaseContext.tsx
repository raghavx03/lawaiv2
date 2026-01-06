'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'

export type CaseStatus = 'OPEN' | 'ARCHIVED' | 'CLOSED'

export interface Case {
  id: string
  cnrNumber: string
  caseType?: string
  court?: string
  status?: string
  caseStatus?: CaseStatus // Internal status for LAW.AI
  nextHearing?: string
  petitioner?: string
  respondent?: string
  clientName?: string
  createdAt: string
}

interface CaseContextType {
  cases: Case[]
  activeCase: Case | null
  setActiveCase: (caseItem: Case | null) => void
  loadCases: () => Promise<void>
  updateCaseStatus: (caseId: string, status: CaseStatus) => Promise<void>
  loading: boolean
  openCases: Case[]
  archivedCases: Case[]
}

const defaultCaseContext: CaseContextType = {
  cases: [],
  activeCase: null,
  setActiveCase: () => {},
  loadCases: async () => {},
  updateCaseStatus: async () => {},
  loading: false,
  openCases: [],
  archivedCases: []
}

const CaseContext = createContext<CaseContextType>(defaultCaseContext)

// Map CaseTracker API response to Case interface
function mapCaseTrackerToCase(tracker: any): Case {
  const details = tracker.details || {}
  return {
    id: tracker.id,
    cnrNumber: tracker.cnr,
    caseType: details.caseType || 'General',
    court: tracker.court,
    status: tracker.status,
    caseStatus: details.caseStatus || 'OPEN',
    nextHearing: tracker.nextDate ? new Date(tracker.nextDate).toLocaleDateString('en-IN') : undefined,
    petitioner: tracker.partyName,
    respondent: details.respondent,
    clientName: tracker.partyName,
    createdAt: tracker.createdAt
  }
}

export function CaseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [activeCase, setActiveCaseState] = useState<Case | null>(null)
  const [loading, setLoading] = useState(false)

  const loadCases = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const response = await fetch('/api/case-tracker')
      const data = await response.json()
      if (data.cases && Array.isArray(data.cases)) {
        const mappedCases = data.cases.map(mapCaseTrackerToCase)
        setCases(mappedCases)
        // Restore active case from localStorage
        if (typeof window !== 'undefined') {
          const savedCaseId = localStorage.getItem('activeCaseId')
          if (savedCaseId) {
            const savedCase = mappedCases.find((c: Case) => c.id === savedCaseId)
            if (savedCase) setActiveCaseState(savedCase)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load cases:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadCases()
    }
  }, [user, loadCases])

  const setActiveCase = (caseItem: Case | null) => {
    setActiveCaseState(caseItem)
    if (typeof window !== 'undefined') {
      if (caseItem) {
        localStorage.setItem('activeCaseId', caseItem.id)
      } else {
        localStorage.removeItem('activeCaseId')
      }
    }
  }

  const updateCaseStatus = async (caseId: string, status: CaseStatus) => {
    try {
      const response = await fetch('/api/case-tracker/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, status })
      })
      
      if (response.ok) {
        // Update local state
        setCases(prev => prev.map(c => 
          c.id === caseId ? { ...c, caseStatus: status } : c
        ))
        
        // If archived/closed, clear active case if it was this one
        if ((status === 'ARCHIVED' || status === 'CLOSED') && activeCase?.id === caseId) {
          setActiveCase(null)
        }
      }
    } catch (error) {
      console.error('Failed to update case status:', error)
    }
  }

  // Filter cases by status
  const openCases = cases.filter(c => !c.caseStatus || c.caseStatus === 'OPEN')
  const archivedCases = cases.filter(c => c.caseStatus === 'ARCHIVED' || c.caseStatus === 'CLOSED')

  return (
    <CaseContext.Provider value={{ 
      cases, 
      activeCase, 
      setActiveCase, 
      loadCases, 
      updateCaseStatus,
      loading,
      openCases,
      archivedCases
    }}>
      {children}
    </CaseContext.Provider>
  )
}

// Safe hook that returns default values when not in provider (for SSR)
export function useCase(): CaseContextType {
  return useContext(CaseContext)
}
