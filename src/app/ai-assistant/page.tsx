'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCase } from '@/context/CaseContext'
import { useUsageTracking } from '@/hooks/useUsageTracking'
import { CaseRequiredModal } from '@/components/modals/CaseRequiredModal'
import { toast, Toaster } from 'react-hot-toast'
import { 
  Send, User, Loader2, Upload, X, FileText, Image as ImageIcon, 
  Trash2, History, Briefcase, Scale, Sparkles, BookOpen, 
  MessageSquare, HelpCircle, ChevronRight, Save, FileEdit,
  CheckCircle, Clock
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  file?: { name: string; type: string }
  caseId?: string
  saved?: boolean
}

interface ChatHistory {
  id: string
  title: string
  createdAt: string
  caseId?: string
}

export default function AIAssistantPage() {
  const { user, profile } = useAuth()
  const { activeCase, cases, loading: casesLoading } = useCase()
  const { trackUsage, canUse, usage, limits, isPro } = useUsageTracking()
  
  // STEP 2.1: Case Required Modal
  const [showCaseModal, setShowCaseModal] = useState(false)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; content?: string } | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check if case is required on mount
  useEffect(() => {
    if (!casesLoading && !activeCase && cases.length >= 0) {
      // Show modal after a brief delay to let page render
      const timer = setTimeout(() => {
        setShowCaseModal(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [casesLoading, activeCase, cases])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (user && activeCase) {
      loadChatHistory()
    }
  }, [user, activeCase])

  const loadChatHistory = async () => {
    if (!activeCase) return
    try {
      const response = await fetch(`/api/ai-assistant?caseId=${activeCase.id}`)
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setChatHistory(data.slice(0, 15).map((chat: any) => ({
            id: chat.id,
            title: chat.prompt?.substring(0, 40) || 'Chat',
            createdAt: chat.createdAt,
            caseId: chat.caseId
          })))
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Supported: PDF, Images, TXT, DOC files')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      
      if (file.type === 'text/plain') {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedFile({ 
            name: file.name, 
            type: file.type,
            content: e.target?.result as string
          })
        }
        reader.readAsText(file)
      } else {
        setUploadedFile({ name: file.name, type: file.type })
      }
      toast.success(`File "${file.name}" ready`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !uploadedFile) return

    // STEP 2.1: Require case selection
    if (!activeCase) {
      setShowCaseModal(true)
      return
    }

    if (!canUse('ai_message')) {
      toast.error('Daily AI limit reached. Upgrade for unlimited access.')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      file: uploadedFile ? { name: uploadedFile.name, type: uploadedFile.type } : undefined,
      caseId: activeCase.id
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      let fileContent = uploadedFile?.content || ''
      
      if (uploadedFile && !fileContent && fileInputRef.current?.files?.[0]) {
        const formData = new FormData()
        formData.append('file', fileInputRef.current.files[0])
        
        try {
          const uploadRes = await fetch('/api/uploads', {
            method: 'POST',
            body: formData
          })
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json()
            fileContent = uploadData.extractedText || ''
          }
        } catch (err) {
          console.error('File upload error:', err)
        }
      }

      const prompt = fileContent 
        ? `[Document: ${uploadedFile?.name}]\n\nContent:\n${fileContent.substring(0, 5000)}\n\nQuestion: ${currentInput || 'Please analyze this document and provide key legal insights.'}`
        : currentInput

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          caseId: activeCase.id,
          history: messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'I apologize, but I could not generate a response. Please try again.',
        timestamp: new Date(),
        caseId: activeCase.id,
        saved: !!data.sessionId // Mark as saved to timeline
      }

      setMessages(prev => [...prev, assistantMessage])
      setUploadedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadChatHistory()
      await trackUsage('ai_message')
    } catch (error: any) {
      console.error('AI Error:', error)
      toast.error('Failed to get response. Please try again.')
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([])
    toast.success('Chat cleared')
  }

  const handleSuggestionClick = (question: string) => {
    if (!activeCase) {
      setShowCaseModal(true)
      return
    }
    setInput(question)
    inputRef.current?.focus()
  }

  // STEP 2.4: Save to Notes (placeholder)
  const handleSaveToNotes = (message: Message) => {
    toast.success('Saved to case notes')
    setMessages(prev => prev.map(m => 
      m.id === message.id ? { ...m, saved: true } : m
    ))
  }

  // Categorized suggested questions
  const suggestedCategories = [
    {
      title: 'Criminal Law',
      icon: Scale,
      questions: [
        'What is Section 420 IPC?',
        'Explain bail provisions under CrPC',
        'How to file an FIR?'
      ]
    },
    {
      title: 'Civil & Property',
      icon: BookOpen,
      questions: [
        'How to file a civil suit?',
        'Property registration process',
        'Tenant eviction procedure'
      ]
    },
    {
      title: 'Family Law',
      icon: HelpCircle,
      questions: [
        'Divorce by mutual consent',
        'Child custody rights',
        'Maintenance under Hindu law'
      ]
    },
    {
      title: 'Consumer & Business',
      icon: Briefcase,
      questions: [
        'Section 138 cheque bounce',
        'Consumer complaint process',
        'Company registration steps'
      ]
    }
  ]

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gray-50 -m-4 sm:-m-6 lg:-m-8">
      <Toaster position="top-right" />
      
      {/* STEP 2.1: Case Required Modal */}
      <CaseRequiredModal 
        isOpen={showCaseModal && !activeCase}
        onCaseSelected={() => setShowCaseModal(false)}
      />
      
      {/* Header with Case Info */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LAW.AI Assistant</h1>
              {/* STEP 2.4: Show case name at top */}
              {activeCase ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-500">Case:</span>
                  <span className="font-medium text-gray-900">{activeCase.cnrNumber}</span>
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">LINKED</span>
                </div>
              ) : (
                <p className="text-xs text-amber-600 font-medium">⚠️ No case selected</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isPro && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-600">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{usage.aiMessagesToday}/{limits.aiMessagesPerDay} queries today</span>
              </div>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-xl transition-colors ${showHistory ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <History className="h-5 w-5" />
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 rounded-xl bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat History Sidebar */}
        {showHistory && (
          <div className="w-72 border-r border-gray-200 bg-white overflow-y-auto hidden sm:block">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {activeCase ? `History: ${activeCase.cnrNumber}` : 'Recent Conversations'}
              </h3>
              {chatHistory.length > 0 ? (
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors">
                      <p className="text-sm text-gray-900 truncate font-medium">{chat.title}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs text-gray-400">
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </p>
                        {chat.caseId && (
                          <span className="flex items-center gap-1 text-[10px] text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Linked
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No history for this case</p>
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Active Case Banner */}
          {activeCase && (
            <div className="px-4 py-2.5 bg-gray-900 text-white flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-white/60" />
                <span>Working on: <strong>{activeCase.cnrNumber}</strong></span>
                {/* STEP 2.4: "Used in this case" badge */}
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs">All responses saved to timeline</span>
              </div>
              {activeCase.nextHearing && (
                <div className="hidden sm:flex items-center gap-1.5 text-white/60 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  Next: {activeCase.nextHearing}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {activeCase ? `Ask about ${activeCase.cnrNumber}` : 'Select a Case to Start'}
                </h2>
                <p className="text-gray-500 text-center max-w-md mb-8 text-sm">
                  {activeCase 
                    ? 'I can help with IPC sections, CrPC procedures, civil matters, family law, property disputes, and more.'
                    : 'LAW.AI works case-wise. Select or create a case to get contextual legal assistance.'}
                </p>
                
                {activeCase ? (
                  <>
                    {/* Suggested Questions by Category */}
                    <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {suggestedCategories.map((category) => (
                        <div key={category.title} className="bg-gray-50 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <category.icon className="h-4 w-4 text-gray-600" />
                            <h3 className="text-sm font-semibold text-gray-900">{category.title}</h3>
                          </div>
                          <div className="space-y-2">
                            {category.questions.map((q) => (
                              <button
                                key={q}
                                onClick={() => handleSuggestionClick(q)}
                                className="w-full text-left px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 text-sm rounded-xl transition-colors flex items-center justify-between group"
                              >
                                <span>{q}</span>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-6 text-xs text-gray-400 text-center">
                      🌐 Supports English, Hindi, and Hinglish • ⚖️ Based on Indian Law
                    </p>
                  </>
                ) : (
                  <button
                    onClick={() => setShowCaseModal(true)}
                    className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
                  >
                    Select a Case to Continue
                  </button>
                )}
              </div>
            ) : (
              <div className="py-4 px-4 sm:px-6 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Scale className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      {message.file && (
                        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-600">
                          {message.file.type.startsWith('image/') ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span className="truncate">{message.file.name}</span>
                        </div>
                      )}
                      <div className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user' 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      </div>
                      {/* STEP 2.4: Action buttons for assistant messages */}
                      <div className="flex items-center gap-2 mt-1.5 px-2">
                        <p className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {message.caseId && (
                          <span className="flex items-center gap-1 text-[10px] text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Saved
                          </span>
                        )}
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={() => handleSaveToNotes(message)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                message.saved 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
                              }`}
                              title="Save to Notes"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                            {/* STEP 2.4: Use in Draft button (disabled for now) */}
                            <button
                              disabled
                              className="p-1.5 rounded-lg text-gray-300 cursor-not-allowed"
                              title="Use in Draft (Coming Soon)"
                            >
                              <FileEdit className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-9 h-9 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
                      <Scale className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-gray-600">Analyzing {activeCase?.cnrNumber}...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Uploaded File Preview */}
          {uploadedFile && (
            <div className="mx-4 mb-2">
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl border border-gray-200">
                {uploadedFile.type.startsWith('image/') ? (
                  <ImageIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-700 flex-1 truncate">{uploadedFile.name}</span>
                <button 
                  onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} 
                  className="p-1.5 hover:bg-gray-200 rounded-lg flex-shrink-0"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0"
                title="Upload document"
              >
                <Upload className="h-5 w-5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeCase ? `Ask about ${activeCase.cnrNumber}...` : 'Select a case first...'}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                disabled={loading || !activeCase}
              />
              <button
                type="submit"
                disabled={loading || (!input.trim() && !uploadedFile) || !activeCase}
                className="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
            <p className="text-xs text-gray-400 text-center mt-3">
              ⚖️ AI responses are for reference only. Consult a qualified advocate for legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
