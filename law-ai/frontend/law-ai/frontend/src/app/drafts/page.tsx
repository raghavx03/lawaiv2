'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { FileEdit, Download, Sparkles, FileText, Clock, Brain, Target, PenTool, ArrowLeft, Copy, Share2, Eye, EyeOff, Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { FeatureModal } from '@/components/auth/FeatureModal'
import Link from 'next/link'

interface Draft {
  id: string
  title: string
  content: string
  type: string
  createdAt: string
}

function DraftsContent() {
  const [draftType, setDraftType] = useState('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [generatedDraft, setGeneratedDraft] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showMenu, setShowMenu] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const draftTypes = [
    { 
      value: 'rent', 
      label: 'Rental Agreement', 
      icon: '🏠', 
      description: 'Comprehensive rental agreements with legal compliance',
      color: 'blue',
      popular: true
    },
    { 
      value: 'employment', 
      label: 'Employment Contract', 
      icon: '💼', 
      description: 'Employment contracts with standard provisions',
      color: 'green',
      popular: true
    },
    { 
      value: 'nda', 
      label: 'Non-Disclosure Agreement', 
      icon: '🔒', 
      description: 'Confidentiality and non-disclosure agreements',
      color: 'purple',
      popular: true
    },
    { 
      value: 'sale', 
      label: 'Sale Deed', 
      icon: '📋', 
      description: 'Property sale deeds with all necessary clauses',
      color: 'orange',
      popular: false
    },
    { 
      value: 'partnership', 
      label: 'Partnership Agreement', 
      icon: '🤝', 
      description: 'Business partnership agreements and terms',
      color: 'red',
      popular: false
    },
    { 
      value: 'loan', 
      label: 'Loan Agreement', 
      icon: '💰', 
      description: 'Personal and business loan agreements',
      color: 'indigo',
      popular: false
    }
  ]

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/drafts')
      if (response.ok) {
        const data = await response.json()
        setDrafts(data)
      }
    } catch (error) {
      toast.error('Failed to fetch drafts')
    }
  }

  useEffect(() => {
    fetchDrafts()
  }, [])

  const getFormFields = (type: string) => {
    switch (type) {
      case 'rent':
        return [
          { key: 'landlord', label: 'Landlord Name', required: true, placeholder: 'Enter landlord full name' },
          { key: 'tenant', label: 'Tenant Name', required: true, placeholder: 'Enter tenant full name' },
          { key: 'property', label: 'Property Address', required: true, placeholder: 'Complete property address' },
          { key: 'rent', label: 'Monthly Rent (₹)', required: true, placeholder: 'Enter monthly rent amount' },
          { key: 'duration', label: 'Lease Duration', required: true, placeholder: 'e.g., 11 months' }
        ]
      case 'employment':
        return [
          { key: 'employer', label: 'Employer Name', required: true, placeholder: 'Company/employer name' },
          { key: 'employee', label: 'Employee Name', required: true, placeholder: 'Employee full name' },
          { key: 'position', label: 'Job Position', required: true, placeholder: 'Job title/position' },
          { key: 'salary', label: 'Salary (₹)', required: true, placeholder: 'Annual/monthly salary' },
          { key: 'startDate', label: 'Start Date', required: true, placeholder: 'Employment start date' }
        ]
      case 'nda':
        return [
          { key: 'discloser', label: 'Disclosing Party', required: true, placeholder: 'Party sharing information' },
          { key: 'recipient', label: 'Receiving Party', required: true, placeholder: 'Party receiving information' },
          { key: 'purpose', label: 'Purpose', required: true, placeholder: 'Purpose of information sharing' },
          { key: 'duration', label: 'Duration', required: true, placeholder: 'e.g., 2 years' }
        ]
      case 'loan':
        return [
          { key: 'lender', label: 'Lender Name', required: true, placeholder: 'Person/entity lending money' },
          { key: 'borrower', label: 'Borrower Name', required: true, placeholder: 'Person/entity borrowing money' },
          { key: 'amount', label: 'Loan Amount (₹)', required: true, placeholder: 'Total loan amount' },
          { key: 'interest', label: 'Interest Rate (%)', required: true, placeholder: 'Annual interest rate' },
          { key: 'tenure', label: 'Loan Tenure', required: true, placeholder: 'e.g., 12 months' }
        ]
      default:
        return [
          { key: 'party1', label: 'First Party', required: true, placeholder: 'First party name' },
          { key: 'party2', label: 'Second Party', required: true, placeholder: 'Second party name' },
          { key: 'terms', label: 'Key Terms', required: true, placeholder: 'Main terms and conditions' }
        ]
    }
  }

  const handleGenerate = async () => {
    const fields = getFormFields(draftType)
    const missingFields = fields.filter(field => field.required && !formData[field.key])
    
    if (missingFields.length > 0) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const selectedType = draftTypes.find(t => t.value === draftType)
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: draftType,
          title: selectedType?.label || 'Legal Draft',
          formData
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedDraft(data.content)
        toast.success('Draft generated successfully')
        fetchDrafts()
      }
    } catch (error) {
      toast.error('Failed to generate draft')
    } finally {
      setLoading(false)
    }
  }

  const downloadDraft = () => {
    const blob = new Blob([generatedDraft], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${draftType}-agreement.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Draft downloaded successfully')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft)
    toast.success('Draft copied to clipboard')
  }

  const shareDocument = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${draftTypes.find(t => t.value === draftType)?.label} - LAW.AI`,
          text: generatedDraft
        })
      } catch (error) {
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && draftType) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      handleGenerate()
    }
  }

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Toaster position="top-center" />
      
      {/* Mobile-First Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg">
                <FileEdit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Document Generator</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  AI-powered legal documents
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="px-4 pb-2">
          <div className="flex items-center space-x-2">
            <div className={`h-2 flex-1 rounded-full ${currentStep >= 1 ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`h-2 flex-1 rounded-full ${currentStep >= 2 ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`h-2 flex-1 rounded-full ${generatedDraft ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Select Type</span>
            <span>Fill Details</span>
            <span>Generate</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Quick Stats - Mobile Optimized */}
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{drafts.length}</p>
              <p className="text-xs text-gray-500">Drafts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">99%</p>
              <p className="text-xs text-gray-500">Success</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">6+</p>
              <p className="text-xs text-gray-500">Templates</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!generatedDraft ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Step 1: Document Type Selection */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Choose Document Type
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Select the type of legal document you want to generate
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {draftTypes.map((type, index) => (
                      <motion.div
                        key={type.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setDraftType(type.value)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          draftType === type.value 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{type.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{type.label}</h3>
                              {type.popular && (
                                <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{type.description}</p>
                          </div>
                          {draftType === type.value && (
                            <div className="p-2 bg-red-500 rounded-full">
                              <Sparkles className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Form Fields */}
              {currentStep === 2 && draftType && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {draftTypes.find(t => t.value === draftType)?.label} Details
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Fill in the required information for your document
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {getFormFields(draftType).map((field, index) => (
                      <motion.div 
                        key={field.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Label className="text-sm font-semibold">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          value={formData[field.key] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="mt-2 h-12 border-2 border-gray-200 dark:border-[#333] focus:border-red-500 rounded-lg transition-all duration-300 dark:bg-[#1E1E1E] dark:text-white dark:placeholder-[#aaa]"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            /* Generated Document View */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {draftTypes.find(t => t.value === draftType)?.label}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Generated {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={shareDocument}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadDraft}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800 dark:text-gray-200">
                      {generatedDraft}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-2xl mx-auto">
            {!generatedDraft ? (
              <div className="flex space-x-3">
                {currentStep === 2 && (
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button 
                  onClick={nextStep}
                  disabled={!draftType || (currentStep === 2 && loading)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="mr-2"
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                      Generating...
                    </>
                  ) : currentStep === 1 ? (
                    'Continue'
                  ) : (
                    <>
                      <FileEdit className="h-4 w-4 mr-2" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => {
                  setGeneratedDraft('')
                  setCurrentStep(1)
                  setDraftType('')
                  setFormData({})
                }}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <FileEdit className="h-4 w-4 mr-2" />
                Create New Document
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DraftsPage() {
  return <DraftsContent />
}