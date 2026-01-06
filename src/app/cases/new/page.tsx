'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCase } from '@/context/CaseContext'
import { toast, Toaster } from 'react-hot-toast'
import { ArrowLeft, Briefcase, Search, Loader2, User, Building, Calendar, FileText } from 'lucide-react'

export default function NewCasePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { loadCases, setActiveCase } = useCase()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState<'cnr' | 'manual'>('cnr')
  
  const [formData, setFormData] = useState({
    cnrNumber: '',
    petitioner: '',
    respondent: '',
    court: '',
    caseType: '',
    filingDate: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: ''
  })

  const handleCNRSearch = async () => {
    if (!formData.cnrNumber.trim()) {
      toast.error('Please enter a CNR number')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/case-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cnrNumber: formData.cnrNumber.trim().toUpperCase(),
          searchType: 'cnr'
        })
      })

      const data = await response.json()
      
      if (response.ok && data.case) {
        toast.success('Case added successfully!')
        setActiveCase(data.case)
        await loadCases()
        router.push(`/cases/${data.case.id}`)
      } else {
        throw new Error(data.error || 'Failed to track case')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add case')
    } finally {
      setLoading(false)
    }
  }

  const handleManualCreate = async () => {
    if (!formData.petitioner.trim() && !formData.cnrNumber.trim()) {
      toast.error('Please enter case details')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/case-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnrNumber: formData.cnrNumber.trim() || `MANUAL-${Date.now()}`,
          partyName: formData.petitioner.trim() || 'Unknown',
          searchType: 'manual',
          details: {
            petitioner: formData.petitioner,
            respondent: formData.respondent,
            court: formData.court,
            caseType: formData.caseType,
            clientName: formData.clientName,
            clientPhone: formData.clientPhone,
            clientEmail: formData.clientEmail,
            notes: formData.notes
          }
        })
      })

      const data = await response.json()
      
      if (response.ok && data.case) {
        toast.success('Case created successfully!')
        setActiveCase(data.case)
        await loadCases()
        router.push(`/cases/${data.case.id}`)
      } else {
        throw new Error(data.error || 'Failed to create case')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create case')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cases">
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Case</h1>
          <p className="text-gray-500 text-sm mt-1">Track a case by CNR or create manually</p>
        </div>
      </div>

      {/* Method Selection */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setSearchType('cnr')}
          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
            searchType === 'cnr' 
              ? 'border-gray-900 bg-gray-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Search className="h-6 w-6 text-gray-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Track by CNR</h3>
          <p className="text-xs text-gray-500 mt-1">Auto-fetch case details</p>
        </button>
        <button
          onClick={() => setSearchType('manual')}
          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
            searchType === 'manual' 
              ? 'border-gray-900 bg-gray-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <FileText className="h-6 w-6 text-gray-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Create Manually</h3>
          <p className="text-xs text-gray-500 mt-1">Enter details yourself</p>
        </button>
      </div>

      {/* CNR Search */}
      {searchType === 'cnr' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNR Number
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.cnrNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, cnrNumber: e.target.value.toUpperCase() }))}
                placeholder="e.g., DLHC010234562024"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              CNR (Case Number Record) is a unique 16-character code found on your case documents
            </p>
          </div>

          <button
            onClick={handleCNRSearch}
            disabled={loading || !formData.cnrNumber.trim()}
            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Track Case
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            We'll fetch case details from eCourts automatically
          </p>
        </div>
      )}

      {/* Manual Entry */}
      {searchType === 'manual' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          {/* Case Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Case Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CNR Number (Optional)</label>
                <input
                  type="text"
                  value={formData.cnrNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnrNumber: e.target.value.toUpperCase() }))}
                  placeholder="If available"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Case Type</label>
                <select
                  value={formData.caseType}
                  onChange={(e) => setFormData(prev => ({ ...prev, caseType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                >
                  <option value="">Select type</option>
                  <option value="Civil">Civil</option>
                  <option value="Criminal">Criminal</option>
                  <option value="Family">Family</option>
                  <option value="Property">Property</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Labour">Labour</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Petitioner *</label>
                <input
                  type="text"
                  value={formData.petitioner}
                  onChange={(e) => setFormData(prev => ({ ...prev, petitioner: e.target.value }))}
                  placeholder="Petitioner name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Respondent</label>
                <input
                  type="text"
                  value={formData.respondent}
                  onChange={(e) => setFormData(prev => ({ ...prev, respondent: e.target.value }))}
                  placeholder="Respondent name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Court</label>
                <input
                  type="text"
                  value={formData.court}
                  onChange={(e) => setFormData(prev => ({ ...prev, court: e.target.value }))}
                  placeholder="e.g., Delhi High Court"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Client Details (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Your client's name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="client@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this case..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none"
            />
          </div>

          <button
            onClick={handleManualCreate}
            disabled={loading || !formData.petitioner.trim()}
            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Briefcase className="h-5 w-5" />
                Create Case
              </>
            )}
          </button>
        </div>
      )}

      {/* Trust Message */}
      <p className="text-xs text-gray-400 text-center mt-6">
        🔒 Your case data is private and secure. LAW.AI never shares your information.
      </p>
    </div>
  )
}
