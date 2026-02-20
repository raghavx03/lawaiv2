'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCase } from '@/context/CaseContext'
import { useUsageTracking } from '@/hooks/useUsageTracking'
import { toast, Toaster } from 'react-hot-toast'
import { FileText, Download, Sparkles, Copy, ArrowLeft, History, Trash2, Eye, Briefcase, Check, AlertTriangle, Save, Edit3, X } from 'lucide-react'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { CaseRequiredPrompt, useCaseRequired } from '@/components/shared/CaseRequiredPrompt'
import { PremiumButton, PremiumCard, StatCard } from '@/components/premium'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

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

function DraftsContent() {
  const { user } = useAuth()
  const { activeCase } = useCase()
  const { shouldPrompt } = useCaseRequired()
  const { trackUsage, canUse, getRemainingMessage, usage, limits, isPro } = useUsageTracking()
  const searchParams = useSearchParams()
  const router = useRouter()

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

  // Editor State
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load drafts on mount
  useEffect(() => {
    if (user) {
      loadSavedDrafts()
    }
  }, [user, activeCase, filterByCase])

  // Handle URL ID param
  useEffect(() => {
    const id = searchParams.get('id')
    if (id && user) {
      // If we already have drafts loaded, find it
      const found = savedDrafts.find(d => d.id === id)
      if (found) {
        viewDraft(found)
      } else {
        // Otherwise fetch specifically
        fetch(`/api/drafts?id=${id}`)
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) {
              viewDraft(data)
            }
          })
          .catch(console.error)
      }
    }
  }, [searchParams, user, savedDrafts.length]) // Depend on savedDrafts.length to retry finding after load

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
          const saveRes = await fetch('/api/drafts', {
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
          const savedData = await saveRes.json()
          loadSavedDrafts()
          // Update URL to reflect new draft
          if (savedData.id) {
            router.push(`/drafts?id=${savedData.id}`)
          }
        } catch (err) {
          console.error('Failed to save draft:', err)
        }

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

  const handleSaveEdit = async () => {
    if (!viewingDraft) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: viewingDraft.id,
          content: editContent,
          title: viewingDraft.title
        })
      })
      const data = await res.json()
      if (data.ok) {
        setViewingDraft({ ...viewingDraft, content: editContent })
        setIsEditing(false)
        toast.success('Draft updated')
        loadSavedDrafts()
      } else {
        throw new Error(data.error)
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(isEditing ? editContent : (generatedDraft || viewingDraft?.content || ''))
    toast.success('Copied to clipboard')
  }

  const downloadPDF = () => {
    const content = isEditing ? editContent : (generatedDraft || viewingDraft?.content || '')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:serif;padding:50px;line-height:1.6;max-width:800px;margin:0 auto;white-space:pre-wrap;}</style></head><body>${content}</body></html>`
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      setTimeout(() => win.print(), 500)
    }
  }

  const reset = () => {
    setStep(1)
    setSelectedType('')
    setFormData({})
    setGeneratedDraft('')
    setViewingDraft(null)
    setShowMobileForm(false)
    setIsEditing(false)
    router.push('/drafts')
  }

  const viewDraft = (draft: SavedDraft) => {
    setViewingDraft(draft)
    setEditContent(draft.content) // Initialize editor with content
    setIsEditing(true) // Auto-enter edit mode for better UX
    setShowHistory(false)
  }

  const selectTypeAndProceed = (type: string) => {
    if (shouldPrompt && !showCasePrompt) {
      setSelectedType(type)
      setShowCasePrompt(true)
      return
    }
    setSelectedType(type)
    if (window.innerWidth < 640) {
      setShowMobileForm(true)
    } else {
      setStep(2)
    }
  }

  const FormContent = () => (
    <div className="space-y-4">
      {activeCase && (
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm border border-indigo-200 dark:border-indigo-800">
          <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-indigo-700 dark:text-indigo-300">Linked to: {activeCase.cnrNumber}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {(formFields[selectedType] || []).map((field) => (
          <div key={field.key}>
            <label className="block text-premium-body font-medium text-gray-900 dark:text-white mb-2">
              {field.label} {field.required && <span className="text-rose-500">*</span>}
            </label>
            {field.key.includes('Address') || field.key.includes('Description') || field.key.includes('facts') || field.key.includes('statements') ? (
              <textarea
                value={formData[field.key] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={`Enter ${field.label.toLowerCase()}`}
                rows={3}
              />
            ) : (
              <input
                type={field.type || 'text'}
                value={formData[field.key] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>

      <PremiumButton
        variant="primary"
        size="lg"
        onClick={handleGenerate}
        disabled={loading}
        icon={loading ? <Sparkles className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate Document'}
      </PremiumButton>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />

      {/* Case Prompt */}
      {showCasePrompt && shouldPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <CaseRequiredPrompt
              feature="Document Generator"
              onCaseSelected={() => {
                setShowCasePrompt(false)
                if (window.innerWidth < 640) setShowMobileForm(true); else setStep(2)
              }}
            />
            <button onClick={() => { setShowCasePrompt(false); if (window.innerWidth < 640) setShowMobileForm(true); else setStep(2) }} className="w-full mt-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm">
              Continue without case
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-premium-h1 text-gray-900 dark:text-white">Document Generator</h1>
            <p className="text-premium-body text-gray-600 dark:text-gray-400 mt-2">
              {activeCase ? `Creating for: ${activeCase.cnrNumber}` : 'Create, Edit & Export Legal Documents'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isPro && getRemainingMessage('draft') && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{usage.draftsThisMonth}/{limits.draftsPerMonth} this month</span>
              </div>
            )}
            <PremiumButton
              variant="secondary"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              icon={<History className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">History</span>
            </PremiumButton>
            {(step > 1 || viewingDraft) && (
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={reset}
              >
                Start Over
              </PremiumButton>
            )}
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <PremiumCard className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-premium-h3 text-gray-900 dark:text-white">Recent Documents</h3>
            {activeCase && (
              <PremiumButton
                variant={filterByCase ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterByCase(!filterByCase)}
              >
                This Case Only
              </PremiumButton>
            )}
          </div>
          {savedDrafts.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedDrafts.map((draft) => (
                <div key={draft.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer transition-colors" onClick={() => viewDraft(draft)}>
                  <div className="min-w-0 flex-1">
                    <p className="text-premium-body font-medium text-gray-900 dark:text-white truncate">{draft.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(draft.createdAt).toLocaleDateString()}</p>
                      {draft.caseId && <Briefcase className="h-3 w-3 text-gray-400 dark:text-gray-500" />}
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-premium-body text-gray-500 dark:text-gray-400">No saved documents yet</p>
          )}
        </PremiumCard>
      )}

      {/* EDITOR / VIEWER */}
      {viewingDraft && (
        <div className="space-y-4">
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-premium-h2 text-gray-900 dark:text-white">{viewingDraft.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-premium-body text-gray-600 dark:text-gray-400">
                    {isEditing ? 'Editing Mode' : `Created: ${new Date(viewingDraft.createdAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <PremiumButton
                    variant="primary"
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    icon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </PremiumButton>
                ) : (
                  <PremiumButton
                    variant="primary"
                    size="sm"
                    onClick={() => { setIsEditing(true); setEditContent(viewingDraft.content) }}
                    icon={<Edit3 className="h-4 w-4" />}
                  >
                    Edit Document
                  </PremiumButton>
                )}
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={copyToClipboard}
                  icon={<Copy className="h-4 w-4" />}
                />
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={downloadPDF}
                  icon={<Download className="h-4 w-4" />}
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-0 overflow-hidden">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full h-[60vh] p-6 text-sm text-gray-800 dark:text-gray-200 font-serif leading-relaxed focus:outline-none resize-none bg-white dark:bg-gray-900"
              />
            ) : (
              <div className="w-full h-[60vh] p-6 text-sm text-gray-800 dark:text-gray-200 font-serif leading-relaxed overflow-y-auto whitespace-pre-wrap bg-white dark:bg-gray-900">
                {viewingDraft.content}
              </div>
            )}
          </PremiumCard>
        </div>
      )}

      {/* Main Creation Flow */}
      {!viewingDraft && (
        <>
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-premium-h2 text-gray-900 dark:text-white mb-4">Select Document Type</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {draftTypes.map((type) => (
                    <button key={type.value} onClick={() => selectTypeAndProceed(type.value)}
                      className={`p-4 text-left rounded-xl border-2 transition-all ${selectedType === type.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                      <span className="text-2xl mb-2 block">{type.icon}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{type.label}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && selectedType && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <PremiumButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  icon={<ArrowLeft className="h-4 w-4" />}
                />
                <div>
                  <h2 className="text-premium-h2 text-gray-900 dark:text-white">{draftTypes.find(t => t.value === selectedType)?.label}</h2>
                  <p className="text-premium-body text-gray-600 dark:text-gray-400 mt-1">Fill in the details</p>
                </div>
              </div>
              <PremiumCard>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(formFields[selectedType] || []).map((field) => (
                    <div key={field.key} className={field.key.includes('Address') || field.key.includes('Description') || field.key.includes('facts') || field.key.includes('statements') ? 'sm:col-span-2' : ''}>
                      <label className="block text-premium-body font-medium text-gray-900 dark:text-white mb-2">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.key.includes('Address') || field.key.includes('Description') || field.key.includes('facts') || field.key.includes('statements') ? (
                        <textarea value={formData[field.key] || ''} onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder={`Enter ${field.label.toLowerCase()}`} rows={3} />
                      ) : (
                        <input type={field.type || 'text'} value={formData[field.key] || ''} onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder={`Enter ${field.label.toLowerCase()}`} />
                      )}
                    </div>
                  ))}
                </div>
              </PremiumCard>
              <PremiumButton
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                disabled={loading}
                icon={loading ? <Sparkles className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Document'}
              </PremiumButton>
            </div>
          )}

          {step === 3 && generatedDraft && (
            <div className="space-y-4">
              <PremiumCard>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-premium-h2 text-gray-900 dark:text-white">Generated Document</h2>
                    <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex gap-2">
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      onClick={copyToClipboard}
                      icon={<Copy className="h-4 w-4" />}
                    >
                      <span className="sm:hidden">Copy</span>
                    </PremiumButton>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      onClick={downloadPDF}
                      icon={<Download className="h-4 w-4" />}
                    >
                      <span className="sm:hidden">Download</span>
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
              <PremiumCard className="p-0 overflow-hidden">
                <div className="w-full h-[50vh] p-6 text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed overflow-y-auto whitespace-pre-wrap bg-white dark:bg-gray-900">
                  {generatedDraft}
                </div>
              </PremiumCard>
              <PremiumButton
                variant="primary"
                size="lg"
                onClick={reset}
                icon={<FileText className="h-5 w-5" />}
                className="w-full"
              >
                Create Another Document
              </PremiumButton>
            </div>
          )}
        </>
      )}

      <BottomSheet isOpen={showMobileForm} onClose={() => { setShowMobileForm(false); setSelectedType(''); }} title={draftTypes.find(t => t.value === selectedType)?.label || 'Fill Details'}>
        <FormContent />
      </BottomSheet>
    </div>
  )
}

export default function DraftsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Sparkles className="h-8 w-8 animate-spin text-gray-300" /></div>}>
      <DraftsContent />
    </Suspense>
  )
}
