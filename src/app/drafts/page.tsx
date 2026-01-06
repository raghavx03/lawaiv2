'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCase } from '@/context/CaseContext'
import { useUsageTracking } from '@/hooks/useUsageTracking'
import { toast, Toaster } from 'react-hot-toast'
import { FileText, Download, Sparkles, Copy, ArrowLeft, History, Trash2, Eye, Briefcase, Check, AlertTriangle } from 'lucide-react'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { CaseRequiredPrompt, useCaseRequired } from '@/components/shared/CaseRequiredPrompt'
import Link from 'next/link'

const draftTypes = [
  { value: 'rent', label: 'Rental Agreement', icon: '🏠', desc: 'Landlord-tenant agreements' },
  { value: 'employment', label: 'Employment Contract', icon: '💼', desc: 'Job contracts' },
  { value: 'nda', label: 'NDA', icon: '🔒', desc: 'Confidentiality agreements' },
  { value: 'sale', label: 'Sale Deed', icon: '📋', desc: 'Property sale documents' },
  { value: 'partnership', label: 'Partnership Deed', icon: '🤝', desc: 'Business partnerships' },
  { value: 'loan', label: 'Loan Agreement', icon: '💰', desc: 'Loan documents' },
  { value: 'legal_notice', label: 'Legal Notice', icon: '⚖️', desc: 'Formal legal notices' },
  { value: 'affidavit', label: 'Affidavit', icon: '📝', desc: 'Sworn statements' },
]

const formFields: Record<string, { key: string; label: string; required: boolean; type?: string }[]> = {
  rent: [
    { key: 'landlordName', label: 'Landlord Name', required: true },
    { key: 'tenantName', label: 'Tenant Name', required: true },
    { key: 'propertyAddress', label: 'Property Address', required: true },
    { key: 'monthlyRent', label: 'Monthly Rent (₹)', required: true, type: 'number' },
    { key: 'securityDeposit', label: 'Security Deposit (₹)', required: false, type: 'number' },
    { key: 'leasePeriod', label: 'Lease Duration (months)', required: true },
    { key: 'startDate', label: 'Start Date', required: false, type: 'date' },
  ],
  employment: [
    { key: 'companyName', label: 'Company Name', required: true },
    { key: 'employeeName', label: 'Employee Name', required: true },
    { key: 'designation', label: 'Job Position', required: true },
    { key: 'totalSalary', label: 'Monthly Salary (₹)', required: true, type: 'number' },
    { key: 'joiningDate', label: 'Joining Date', required: true, type: 'date' },
    { key: 'workingHours', label: 'Working Hours', required: false },
  ],
  nda: [
    { key: 'disclosingParty', label: 'Disclosing Party', required: true },
    { key: 'receivingParty', label: 'Receiving Party', required: true },
    { key: 'purpose', label: 'Purpose of NDA', required: true },
    { key: 'agreementTerm', label: 'Duration (years)', required: true },
    { key: 'informationNature', label: 'Type of Information', required: false },
  ],
  sale: [
    { key: 'sellerName', label: 'Seller Name', required: true },
    { key: 'buyerName', label: 'Buyer Name', required: true },
    { key: 'propertyDescription', label: 'Property Details', required: true },
    { key: 'saleAmount', label: 'Sale Amount (₹)', required: true, type: 'number' },
    { key: 'advanceAmount', label: 'Advance Paid (₹)', required: false, type: 'number' },
  ],
  partnership: [
    { key: 'partner1Name', label: 'First Partner', required: true },
    { key: 'partner2Name', label: 'Second Partner', required: true },
    { key: 'firmName', label: 'Firm Name', required: true },
    { key: 'businessNature', label: 'Business Type', required: true },
    { key: 'totalCapital', label: 'Total Capital (₹)', required: false, type: 'number' },
  ],
  loan: [
    { key: 'lenderName', label: 'Lender Name', required: true },
    { key: 'borrowerName', label: 'Borrower Name', required: true },
    { key: 'loanAmount', label: 'Loan Amount (₹)', required: true, type: 'number' },
    { key: 'interestRate', label: 'Interest Rate (%)', required: true, type: 'number' },
    { key: 'numberOfInstallments', label: 'Tenure (months)', required: false, type: 'number' },
    { key: 'loanPurpose', label: 'Loan Purpose', required: false },
  ],
  legal_notice: [
    { key: 'senderName', label: 'Sender Name', required: true },
    { key: 'senderAddress', label: 'Sender Address', required: true },
    { key: 'recipientName', label: 'Recipient Name', required: true },
    { key: 'recipientAddress', label: 'Recipient Address', required: true },
    { key: 'subject', label: 'Subject/Matter', required: true },
    { key: 'facts', label: 'Facts of the Case', required: true },
    { key: 'demand', label: 'Demand/Relief Sought', required: true },
  ],
  affidavit: [
    { key: 'deponentName', label: 'Deponent Name', required: true },
    { key: 'fatherName', label: 'Father\'s Name', required: true },
    { key: 'age', label: 'Age', required: true, type: 'number' },
    { key: 'address', label: 'Address', required: true },
    { key: 'purpose', label: 'Purpose of Affidavit', required: true },
    { key: 'statements', label: 'Statements (one per line)', required: true },
  ],
}

interface SavedDraft {
  id: string
  type: string
  title: string
  content: string
  createdAt: string
  caseId?: string
}

export default function DraftsPage() {
  const { user } = useAuth()
  const { activeCase, cases } = useCase()
  const { shouldPrompt } = useCaseRequired()
  const { trackUsage, canUse, getRemainingMessage, usage, limits, isPro } = useUsageTracking()
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [generatedDraft, setGeneratedDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [viewingDraft, setViewingDraft] = useState<SavedDraft | null>(null)
  const [filterByCase, setFilterByCase] = useState(false)
  const [showMobileForm, setShowMobileForm] = useState(false)
  const [showCasePrompt, setShowCasePrompt] = useState(false)

  useEffect(() => {
    if (user) {
      loadSavedDrafts()
    }
  }, [user, activeCase, filterByCase])

  const loadSavedDrafts = async () => {
    try {
      const url = filterByCase && activeCase 
        ? `/api/drafts?caseId=${activeCase.id}`
        : '/api/drafts'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setSavedDrafts(Array.isArray(data) ? data.slice(0, 20) : [])
      }
    } catch (error) {
      console.error('Failed to load drafts:', error)
    }
  }

  const handleGenerate = async () => {
    const fields = formFields[selectedType] || []
    const missing = fields.filter(f => f.required && !formData[f.key])
    
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing.map(f => f.label).join(', ')}`)
      return
    }

    // Check usage limits
    if (!canUse('draft')) {
      toast.error('Monthly draft limit reached. Upgrade for unlimited access.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          title: draftTypes.find(t => t.value === selectedType)?.label,
          inputs: formData,
          caseId: activeCase?.id
        })
      })

      const data = await response.json()
      if (data.ok && data.content) {
        setGeneratedDraft(data.content)
        setStep(3)
        setShowMobileForm(false)
        toast.success('Document generated!')
        
        // Save to database
        try {
          await fetch('/api/drafts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: selectedType,
              title: draftTypes.find(t => t.value === selectedType)?.label || selectedType,
              content: data.content,
              inputs: formData,
              caseId: activeCase?.id
            })
          })
          loadSavedDrafts()
        } catch (err) {
          console.error('Failed to save draft:', err)
        }

        // Track usage
        await trackUsage('draft')
      } else {
        throw new Error(data.message || 'Generation failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft || viewingDraft?.content || '')
    toast.success('Copied to clipboard')
  }

  const downloadPDF = () => {
    const content = generatedDraft || viewingDraft?.content || ''
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Georgia,serif;padding:50px;line-height:1.8;max-width:800px;margin:0 auto;}pre{white-space:pre-wrap;font-family:inherit;}</style></head><body><pre>${content}</pre><script>window.print()</script></body></html>`
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  const reset = () => {
    setStep(1)
    setSelectedType('')
    setFormData({})
    setGeneratedDraft('')
    setViewingDraft(null)
    setShowMobileForm(false)
  }

  const viewDraft = (draft: SavedDraft) => {
    setViewingDraft(draft)
    setShowHistory(false)
  }

  const selectTypeAndProceed = (type: string) => {
    // Check if case is required (soft prompt)
    if (shouldPrompt && !showCasePrompt) {
      setSelectedType(type)
      setShowCasePrompt(true)
      return
    }

    setSelectedType(type)
    // On mobile, show bottom sheet for form
    if (window.innerWidth < 640) {
      setShowMobileForm(true)
    } else {
      setStep(2)
    }
  }

  const FormContent = () => (
    <div className="space-y-4">
      {activeCase && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-sm">
          <Briefcase className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Linked to: {activeCase.cnrNumber}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {(formFields[selectedType] || []).map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.key.includes('Address') || field.key.includes('Description') || field.key.includes('facts') || field.key.includes('statements') ? (
              <textarea
                value={formData[field.key] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                placeholder={`Enter ${field.label.toLowerCase()}`}
                rows={3}
              />
            ) : (
              <input
                type={field.type || 'text'}
                value={formData[field.key] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Sparkles className="h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="h-5 w-5" />
            Generate Document
          </>
        )}
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />

      {/* Case Required Prompt Modal */}
      {showCasePrompt && shouldPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <CaseRequiredPrompt 
              feature="Document Generator" 
              onCaseSelected={() => {
                setShowCasePrompt(false)
                if (window.innerWidth < 640) {
                  setShowMobileForm(true)
                } else {
                  setStep(2)
                }
              }}
            />
            <button
              onClick={() => {
                setShowCasePrompt(false)
                if (window.innerWidth < 640) {
                  setShowMobileForm(true)
                } else {
                  setStep(2)
                }
              }}
              className="w-full mt-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm"
            >
              Continue without case
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Document Generator</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCase 
              ? `Creating for: ${activeCase.cnrNumber}` 
              : 'Create AI-powered legal documents'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Usage Warning */}
          {!isPro && getRemainingMessage('draft') && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{usage.draftsThisMonth}/{limits.draftsPerMonth} this month</span>
            </div>
          )}
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </button>
          {(step > 1 || viewingDraft) && (
            <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
              Start Over
            </button>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Recent Documents</h3>
            {activeCase && (
              <button
                onClick={() => setFilterByCase(!filterByCase)}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                  filterByCase ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                This Case Only
              </button>
            )}
          </div>
          {savedDrafts.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedDrafts.map((draft) => (
                <div 
                  key={draft.id} 
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer"
                  onClick={() => viewDraft(draft)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">{draft.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{new Date(draft.createdAt).toLocaleDateString()}</p>
                      {draft.caseId && <Briefcase className="h-3 w-3 text-gray-400" />}
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No saved documents yet</p>
          )}
        </div>
      )}

      {/* Viewing Saved Draft */}
      {viewingDraft && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{viewingDraft.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">{new Date(viewingDraft.createdAt).toLocaleDateString()}</p>
                {viewingDraft.caseId && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Briefcase className="h-3 w-3" />
                    Case linked
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                <Copy className="h-5 w-5 text-gray-600" />
              </button>
              <button onClick={downloadPDF} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                <Download className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {viewingDraft.content}
            </pre>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!viewingDraft && (
        <>
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-colors ${step >= s ? 'bg-gray-900' : 'bg-gray-200'}`} />
            ))}
          </div>

          {/* Step 1: Select Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Select Document Type</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {draftTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => selectTypeAndProceed(type.value)}
                    className={`p-4 sm:p-5 text-left rounded-2xl border-2 transition-all hover:border-gray-300 hover:shadow-sm ${
                      selectedType === type.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{type.icon}</span>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{type.label}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Fill Details (Desktop) */}
          {step === 2 && selectedType && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep(1)} className="p-2 rounded-xl hover:bg-gray-100">
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {draftTypes.find(t => t.value === selectedType)?.label}
                  </h2>
                  <p className="text-sm text-gray-500">Fill in the details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formFields[selectedType] || []).map((field) => (
                  <div key={field.key} className={field.key.includes('Address') || field.key.includes('Description') || field.key.includes('facts') || field.key.includes('statements') ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.key.includes('Address') || field.key.includes('Description') || field.key.includes('facts') || field.key.includes('statements') ? (
                      <textarea
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        rows={3}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {activeCase && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-sm">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Will be linked to: {activeCase.cnrNumber}</span>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    Generate Document
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 3: Generated Document */}
          {step === 3 && generatedDraft && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">Generated Document</h2>
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-500">{draftTypes.find(t => t.value === selectedType)?.label}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="flex-1 sm:flex-none p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Copy className="h-5 w-5 text-gray-600" />
                    <span className="sm:hidden text-sm">Copy</span>
                  </button>
                  <button onClick={downloadPDF} className="flex-1 sm:flex-none p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Download className="h-5 w-5 text-gray-600" />
                    <span className="sm:hidden text-sm">Download</span>
                  </button>
                </div>
              </div>

              {activeCase && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl text-sm text-green-700">
                  <Briefcase className="h-4 w-4" />
                  <span>Saved to case: {activeCase.cnrNumber}</span>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 max-h-[50vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                  {generatedDraft}
                </pre>
              </div>

              <button
                onClick={reset}
                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Create Another Document
              </button>
            </div>
          )}
        </>
      )}

      {/* Mobile Form Bottom Sheet */}
      <BottomSheet
        isOpen={showMobileForm}
        onClose={() => { setShowMobileForm(false); setSelectedType(''); }}
        title={draftTypes.find(t => t.value === selectedType)?.label || 'Fill Details'}
      >
        <FormContent />
      </BottomSheet>
    </div>
  )
}
