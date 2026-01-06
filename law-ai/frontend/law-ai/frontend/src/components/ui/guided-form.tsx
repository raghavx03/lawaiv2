'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, Check, HelpCircle } from 'lucide-react'

interface FormField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select'
  required?: boolean
  placeholder: string
  helpText?: string
  options?: string[]
}

interface FormStep {
  title: string
  description: string
  fields: FormField[]
}

interface GuidedFormProps {
  steps: FormStep[]
  onSubmit: (data: Record<string, string>) => void
  loading?: boolean
  submitText?: string
}

export function GuidedForm({ steps, onSubmit, loading = false, submitText = "Complete" }: GuidedFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleNext = () => {
    const currentFields = steps[currentStep]?.fields || []
    const requiredFields = currentFields.filter(field => field.required)
    const missingFields = requiredFields.filter(field => !formData[field.key]?.trim())
    
    if (missingFields.length > 0) {
      return
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onSubmit(formData)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepComplete = (stepIndex: number) => {
    const stepFields = steps[stepIndex]?.fields || []
    const requiredFields = stepFields.filter(field => field.required)
    return requiredFields.every(field => formData[field.key]?.trim())
  }

  const canProceed = isStepComplete(currentStep)

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((_, index) => (
          <div key={index} className="flex items-center">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                index < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </motion.div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                index < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {steps[currentStep]?.title || 'Step'}
            </h3>
            <p className="text-gray-600">
              {steps[currentStep]?.description || ''}
            </p>
          </div>

          <div className="space-y-4">
            {(steps[currentStep]?.fields || []).map((field) => (
              <div key={field.key}>
                <div className="flex items-center space-x-2 mb-2">
                  <Label className="text-sm font-semibold">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {field.helpText && (
                    <div className="group relative">
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        {field.helpText}
                      </div>
                    </div>
                  )}
                </div>
                
                {field.type === 'textarea' ? (
                  <Textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={3}
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 resize-none"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                  >
                    <option value="">{field.placeholder}</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-6 py-3 rounded-xl"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed || loading}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {currentStep === steps.length - 1 ? (
            loading ? 'Processing...' : submitText
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}