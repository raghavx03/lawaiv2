'use client'

import { useState } from 'react'
import { Bot, FileText, Search, MessageSquare, Upload, Zap, Eye } from 'lucide-react'
import { AIChat } from '@/components/ai/ai-chat'

// Simple placeholder components
const DocumentAnalyzer = () => <div className="p-4 text-center">Document Analyzer - Coming Soon</div>
const LegalResearch = () => <div className="p-4 text-center">Legal Research - Coming Soon</div>
const ContractReview = () => <div className="p-4 text-center">Contract Review - Coming Soon</div>
const DocumentGenerator = () => <div className="p-4 text-center">Document Generator - Coming Soon</div>
const OCRTool = () => <div className="p-4 text-center">OCR Tool - Coming Soon</div>

const aiTools = [
  {
    id: 'chat',
    name: 'Legal AI Assistant',
    description: 'Chat with our AI for legal advice and guidance',
    icon: MessageSquare,
    color: 'bg-blue-500',
    component: AIChat
  },
  {
    id: 'document-analyzer',
    name: 'Document Analyzer',
    description: 'Upload and analyze legal documents with AI',
    icon: FileText,
    color: 'bg-green-500',
    component: DocumentAnalyzer
  },
  {
    id: 'legal-research',
    name: 'Legal Research',
    description: 'Research case laws and legal precedents',
    icon: Search,
    color: 'bg-purple-500',
    component: LegalResearch
  },
  {
    id: 'contract-review',
    name: 'Contract Review',
    description: 'AI-powered contract analysis and risk assessment',
    icon: Eye,
    color: 'bg-orange-500',
    component: ContractReview
  },
  {
    id: 'document-generator',
    name: 'Document Generator',
    description: 'Generate legal documents using AI templates',
    icon: Zap,
    color: 'bg-indigo-500',
    component: DocumentGenerator
  },
  {
    id: 'ocr',
    name: 'OCR Tool',
    description: 'Extract text from images and scanned documents',
    icon: Upload,
    color: 'bg-pink-500',
    component: OCRTool
  }
]

export default function AIToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const selectedToolData = aiTools.find(tool => tool.id === selectedTool)

  if (selectedTool && selectedToolData) {
    const ToolComponent = selectedToolData.component
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${selectedToolData.color}`}>
              <selectedToolData.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedToolData.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedToolData.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTool(null)}
            className="btn-secondary"
          >
            Back to Tools
          </button>
        </div>
        <ToolComponent />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Bot className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Legal Tools
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Harness the power of artificial intelligence to streamline your legal work, 
          analyze documents, and get instant legal insights.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className="card hover:shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-105 group"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${tool.color} group-hover:scale-110 transition-transform`}>
                <tool.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {tool.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {tool.description}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
              <span>Launch Tool</span>
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Stats */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your AI Usage This Month
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              1,247
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              AI Queries
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              89
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Documents Analyzed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              156
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Hours Saved
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}