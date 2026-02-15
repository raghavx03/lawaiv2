'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Menu, MessageSquare, Plus, Mic, Paperclip, MicOff, Upload, Camera, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'

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

// Format AI response to remove excessive asterisks and add proper spacing
const formatAIResponse = (content: string): string => {
  return content
    // Remove all asterisks completely
    .replace(/\*+/g, '')
    // Add proper paragraph spacing after periods
    .replace(/\. ([A-Z])/g, '.\n\n$1')
    // Add spacing after colons for lists
    .replace(/: ([A-Z])/g, ':\n\n$1')
    // Clean up multiple spaces
    .replace(/  +/g, ' ')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function EnhancedMobileChat() {
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'end'
      })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage, scrollToBottom])

  // Load sessions from database
  const loadSessions = useCallback(async () => {
    try {
      console.log('Loading sessions from database...')
      const response = await fetch('/api/chat/sessions', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Sessions API response:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Sessions data:', data)

        if (data.ok && data.sessions) {
          const formattedSessions = data.sessions.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
            messages: s.messages?.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            })) || []
          }))

          console.log('Setting sessions:', formattedSessions.length)
          setSessions(formattedSessions)
          return
        }
      }

      console.log('Database failed, using localStorage fallback')
      // Fallback to localStorage
      const saved = localStorage.getItem('lawai-chat-sessions')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSessions(parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages?.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })) || []
        })))
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
      // Always fallback to localStorage
      try {
        const saved = localStorage.getItem('lawai-chat-sessions')
        if (saved) {
          const parsed = JSON.parse(saved)
          setSessions(parsed.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
            messages: s.messages?.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            })) || []
          })))
        }
      } catch (e) {
        console.error('localStorage fallback failed:', e)
      }
    }
  }, [])

  // Save sessions to database and localStorage
  const saveSessions = useCallback(async (sessionsToSave: ChatSession[]) => {
    try {
      // Save to localStorage first (immediate)
      localStorage.setItem('lawai-chat-sessions', JSON.stringify(sessionsToSave))

      // Try to save to database (background)
      const latestSession = sessionsToSave[0]
      if (latestSession) {
        fetch('/api/chat/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session: latestSession
          })
        }).catch(error => {
          console.warn('Failed to save session to database:', error)
        })
      }
    } catch (error) {
      console.error('Failed to save sessions:', error)
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

  // Handle file upload
  const handleFileUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setInput(prev => prev + `\n[Attached: ${file.name}]`)
      setShowAttachments(false)
    }
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
      const response = await fetch('/api/chat-enhanced', {
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

      const data = await response.json()

      if (data.ok && data.message) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: formatAIResponse(data.message),
          timestamp: new Date()
        }

        const finalMessages = [...updatedMessages, assistantMessage]
        setMessages(finalMessages)

        // Update session
        const finalSession = {
          ...workingSession,
          title: workingSession.title === 'New Chat' ? message.slice(0, 50) + (message.length > 50 ? '...' : '') : workingSession.title,
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
      } else {
        throw new Error(data.message || 'Failed to get response')
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
    <div className="flex h-full chat-theme relative overflow-hidden chat-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Always show on desktop, toggle on mobile */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out shadow-lg md:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `} style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff', borderRight: document.documentElement.classList.contains('dark') ? '1px solid #374151' : '1px solid #e5e7eb', backdropFilter: 'none' }}>
        <div className="flex flex-col h-full" style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff' }}>
          {/* Sidebar Header */}
          <div className="p-4 border-b" style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff', borderBottomColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">RAGS</h2>
                <p className="text-xs text-muted-foreground">Legal AI Assistant</p>
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
          <ScrollArea className="flex-1 p-2" style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff' }}>
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${currentSession?.id === session.id
                    ? 'bg-green-600/20 border border-green-600/30'
                    : 'hover:bg-muted/50'
                    }`}
                  onClick={() => selectSession(session)}
                >
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {session.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {session.messages.length} messages
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">
                  {currentSession?.title || 'Legal AI Assistant'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isStreaming ? 'Typing...' : 'Online • Ready to help'}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={createNewSession}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 bg-background" style={{ scrollBehavior: 'auto' }}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Welcome Message */}
            {messages.length === 0 && !isStreaming && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">Welcome to Legal AI Assistant</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  I can help you with legal questions, document analysis, case research, and more.
                  How can I assist you today?
                </p>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-appear`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`flex max-w-[85%] md:max-w-[70%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  } space-x-3`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                      ? 'bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-700'
                      }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-2xl message-bubble mobile-optimized ${message.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-md shadow-lg'
                      : 'chat-message-theme rounded-bl-md shadow-md'
                      }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                        {message.content}
                      </div>
                    </div>

                    <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming Message */}
            {isStreaming && streamingMessage && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md p-3 border border-gray-300 dark:border-gray-700 max-w-[85%] md:max-w-[70%] animate-slide-up">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed break-words text-gray-900 dark:text-gray-100">
                      {streamingMessage}
                      <span className="inline-block w-0.5 h-4 bg-green-500 ml-1 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Thinking Animation - Below conversation */}
            {isStreaming && !streamingMessage && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center animate-pulse">
                    <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md p-4 border border-gray-300 dark:border-gray-700 animate-slide-up">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full loading-dot"></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Enhanced Input Area */}
        <div className="p-4 border-t border-border bg-card pb-safe">
          <div className="max-w-4xl mx-auto">
            {/* Attachment Preview */}
            {showAttachments && (
              <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Attach files</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAttachments(false)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-400 hover:border-green-500"
                    onClick={handleFileUpload}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Documents
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-400 hover:border-green-500"
                    onClick={handleFileUpload}
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Photos
                  </Button>
                </div>
              </div>
            )}

            {/* Voice Recording Indicator */}
            {isRecording && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-sm text-red-600 dark:text-red-400">Recording... Tap to stop</span>
                </div>
              </div>
            )}

            {/* Main Input Container */}
            <div className="chat-input-theme rounded-2xl border focus-within:border-green-500 transition-colors">
              <div className="flex items-end space-x-2 p-3">
                {/* Mic Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-10 w-10 p-0 rounded-full transition-all touch-feedback ${isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
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
                    className="resize-none border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 focus:outline-none text-base leading-relaxed mobile-textarea"
                    style={{ height: `${textareaHeight}px`, fontSize: '16px' }}
                    disabled={isRecording}
                    rows={1}
                  />
                </div>

                {/* Attachment Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all touch-feedback"
                  onClick={() => setShowAttachments(!showAttachments)}
                  disabled={isStreaming}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming || isRecording}
                  className={`h-10 w-10 p-0 rounded-full transition-all touch-feedback ${input.trim() && !isStreaming && !isRecording
                    ? 'bg-green-600 hover:bg-green-700 text-white scale-100'
                    : 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 scale-95'
                    }`}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Compact Helper Text */}
            <div className="mt-2 text-xs text-muted-foreground text-center px-2">
              {isRecording ? (
                <span className="text-red-500">🎤 Recording...</span>
              ) : (
                <>
                  <span className="hidden sm:inline">Enter to send • AI can make mistakes</span>
                  <span className="sm:hidden">AI can make mistakes</span>
                </>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,image/*"
              onChange={handleFileSelect}
              multiple
            />
          </div>
        </div>
      </div>
    </div>
  )
}