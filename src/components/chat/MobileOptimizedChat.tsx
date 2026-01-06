'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Menu, MessageSquare, Plus, Mic, Paperclip, MicOff, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export function MobileOptimizedChat() {
  // Version: 2.0 - No bubbles, Claude AI style
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [textareaHeight, setTextareaHeight] = useState(44)
  const [isRecording, setIsRecording] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages, streamingMessage, scrollToBottom])

  // Load sessions from localStorage
  const loadSessions = useCallback(() => {
    try {
      const saved = localStorage.getItem('lawai-chat-sessions')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSessions(parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        })))
      }
    } catch (error) {
      console.error('Failed to load sessions from localStorage')
    }
  }, [])

  // Save sessions to localStorage
  const saveSessions = useCallback((sessionsToSave: ChatSession[]) => {
    try {
      localStorage.setItem('lawai-chat-sessions', JSON.stringify(sessionsToSave))
    } catch (error) {
      console.error('Failed to save sessions to localStorage')
    }
  }, [])

  // Load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Create new session
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setCurrentSession(newSession)
    setMessages([])
    setSessions(prev => {
      const updated = [newSession, ...prev]
      saveSessions(updated)
      return updated
    })
    setSidebarOpen(false)
  }, [saveSessions])

  // Select session
  const selectSession = useCallback((session: ChatSession) => {
    setCurrentSession(session)
    setMessages(session.messages)
    setSidebarOpen(false)
  }, [])

  // Auto-resize textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Auto-resize
    const textarea = e.target
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 120)
    setTextareaHeight(newHeight)
  }, [])

  // Send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return
    
    const message = input.trim()
    setInput('')
    setTextareaHeight(44)
    
    // Create session if none exists
    let workingSession = currentSession
    if (!workingSession) {
      workingSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setCurrentSession(workingSession)
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    // Add user message
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    
    setIsStreaming(true)
    setStreamingMessage('')

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: workingSession.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  fullResponse += data.content
                  setStreamingMessage(fullResponse)
                }
                if (data.done) {
                  const assistantMessage: Message = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: fullResponse,
                    timestamp: new Date()
                  }

                  const finalMessages = [...updatedMessages, assistantMessage]
                  setMessages(finalMessages)
                  
                  // Update session
                  const finalSession = {
                    ...workingSession,
                    title: data.title || workingSession.title,
                    messages: finalMessages,
                    updatedAt: new Date()
                  }
                  
                  setCurrentSession(finalSession)
                  
                  // Update sessions list
                  setSessions(prev => {
                    const existingIndex = prev.findIndex(s => s.id === finalSession.id)
                    let updated
                    if (existingIndex >= 0) {
                      updated = [...prev]
                      updated[existingIndex] = finalSession
                    } else {
                      updated = [finalSession, ...prev]
                    }
                    saveSessions(updated)
                    return updated
                  })
                }
              } catch (e) {
                console.error('Failed to parse SSE data')
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error')
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsStreaming(false)
      setStreamingMessage('')
    }
  }, [input, isStreaming, messages, currentSession, saveSessions])

  // Handle voice recording
  const handleVoiceToggle = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop()
        setMediaRecorder(null)
      }
      setIsRecording(false)
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        const audioChunks: BlobPart[] = []

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data)
        }

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
          // Here you would typically send the audio to a speech-to-text service
          // For now, we'll just add a placeholder
          setInput(prev => prev + '[Voice message recorded]')
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop())
        }

        recorder.start()
        setMediaRecorder(recorder)
        setIsRecording(true)
      } catch (error) {
        console.error('Error accessing microphone:', error)
        alert('Unable to access microphone. Please check permissions.')
      }
    }
  }, [isRecording, mediaRecorder])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="flex h-full bg-gray-900 text-white relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sessions.length > 0 && (
        <div className={`
          fixed md:relative inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out bg-gray-800 border-r border-gray-700
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold text-white">R</span>
                </div>
                <div>
                  <h2 className="font-semibold text-white">RAGS</h2>
                  <p className="text-xs text-gray-400">Legal AI Assistant</p>
                </div>
              </div>
              
              <Button
                onClick={createNewSession}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>

            {/* Chat Sessions */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentSession?.id === session.id
                        ? 'bg-green-600/20 border border-green-600/30'
                        : 'hover:bg-gray-700/50'
                    }`}
                    onClick={() => selectSession(session)}
                  >
                    <h3 className="text-sm font-medium text-white truncate">
                      {session.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">
                        {session.messages.length} messages
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-3">
            {sessions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {currentSession?.title || 'Legal AI Assistant'}
                </h3>
                <p className="text-xs text-gray-400">
                  {isStreaming ? 'Typing...' : 'Online • Ready to help'}
                </p>
              </div>
            </div>
          </div>

          {sessions.length === 0 && (
            <Button
              onClick={createNewSession}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Message */}
            {messages.length === 0 && !isStreaming && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Welcome to Legal AI Assistant</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  I can help you with legal questions, document analysis, case research, and more. 
                  How can I assist you today?
                </p>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message) => (
              <div key={message.id} className="mb-6">
                <div className="text-xs text-gray-400 mb-2 font-medium">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            ))}

            {/* Streaming Message */}
            {isStreaming && streamingMessage && (
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2 font-medium">
                  Assistant
                </div>
                <div className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
                  {streamingMessage}
                  <span className="inline-block w-0.5 h-4 bg-green-500 ml-1 animate-pulse" />
                </div>
              </div>
            )}

            {/* AI Thinking */}
            {isStreaming && !streamingMessage && (
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2 font-medium">
                  Assistant
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Enhanced Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-800 pb-safe">
          <div className="max-w-4xl mx-auto">
            {/* Attachment Preview */}
            {showAttachments && (
              <div className="mb-3 p-3 bg-gray-700 rounded-lg animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Attach files</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAttachments(false)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-600 hover:border-green-500"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload File
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setInput(prev => prev + `\\n[Attached: ${file.name}]`)
                        setShowAttachments(false)
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Voice Recording Indicator */}
            {isRecording && (
              <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-sm text-red-400">Recording... Tap to stop</span>
                </div>
              </div>
            )}

            {/* Main Input Container */}
            <div className="bg-gray-700 rounded-2xl border border-gray-600 focus-within:border-green-500 transition-colors">
              <div className="flex items-end space-x-2 p-3">
                {/* Mic Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-10 w-10 p-0 rounded-full transition-all ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'hover:bg-gray-600 text-gray-400 hover:text-white'
                  }`}
                  onClick={handleVoiceToggle}
                  disabled={isStreaming}
                >
                  {isRecording ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about law, legal documents, or case research..."
                    className="resize-none border-0 bg-transparent text-white placeholder-gray-400 focus:ring-0 focus:outline-none text-base leading-relaxed"
                    style={{ height: `${textareaHeight}px`, fontSize: '16px' }}
                    disabled={isStreaming || isRecording}
                    rows={1}
                  />
                </div>

                {/* Attachment Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white transition-all"
                  onClick={() => setShowAttachments(!showAttachments)}
                  disabled={isStreaming}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming || isRecording}
                  className={`h-10 w-10 p-0 rounded-full transition-all ${
                    input.trim() && !isStreaming && !isRecording
                      ? 'bg-green-600 hover:bg-green-700 text-white scale-100'
                      : 'bg-gray-600 text-gray-400 scale-95'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Helper Text */}
            <div className="mt-2 text-xs text-gray-500 text-center px-2">
              {isRecording ? (
                <span className="text-red-400">🎤 Recording voice message...</span>
              ) : (
                <>Press Enter to send, Shift+Enter for new line • AI can make mistakes</>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}