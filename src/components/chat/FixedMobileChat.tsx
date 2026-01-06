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

// Format AI response to remove asterisks and add proper spacing
const formatAIResponse = (content: string): string => {
  return content
    .replace(/\*+/g, '')
    .replace(/\. ([A-Z])/g, '.\n\n$1')
    .replace(/: ([A-Z])/g, ':\n\n$1')
    .replace(/  +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function FixedMobileChat() {
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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage, scrollToBottom])

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
      console.error('Failed to load sessions')
    }
  }, [])

  const saveSessions = useCallback((sessionsToSave: ChatSession[]) => {
    try {
      localStorage.setItem('lawai-chat-sessions', JSON.stringify(sessionsToSave))
    } catch (error) {
      console.error('Failed to save sessions')
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

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

  const selectSession = useCallback((session: ChatSession) => {
    setCurrentSession(session)
    setMessages(session.messages)
    setSidebarOpen(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const textarea = e.target
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 120)
    setTextareaHeight(newHeight)
  }, [])

  const handleFileUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setInput(prev => prev + `\n[Attached: ${file.name}]`)
      setShowAttachments(false)
    }
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return
    
    const message = input.trim()
    setInput('')
    setTextareaHeight(44)
    
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
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  fullResponse += data.content
                  setStreamingMessage(formatAIResponse(fullResponse))
                }
                if (data.done) {
                  const assistantMessage: Message = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: formatAIResponse(fullResponse),
                    timestamp: new Date()
                  }

                  const finalMessages = [...updatedMessages, assistantMessage]
                  setMessages(finalMessages)
                  
                  const finalSession = {
                    ...workingSession,
                    title: data.title || workingSession.title,
                    messages: finalMessages,
                    updatedAt: new Date()
                  }
                  
                  setCurrentSession(finalSession)
                  
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

  const handleVoiceToggle = useCallback(async () => {
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop()
        setMediaRecorder(null)
      }
      setIsRecording(false)
    } else {
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

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out chat-sidebar-theme
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
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

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentSession?.id === session.id
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
        <ScrollArea className="flex-1 p-4 bg-background">
          <div className="space-y-4 max-w-4xl mx-auto">
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

            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-appear`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`flex max-w-[85%] md:max-w-[70%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } space-x-3`}>
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-green-600' 
                        : 'bg-muted'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-2xl message-bubble mobile-optimized ${
                      message.role === 'user'
                        ? 'bg-green-600 text-white rounded-br-md shadow-lg'
                        : 'chat-message-theme rounded-bl-md shadow-md'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                        {message.content}
                      </div>
                    </div>
                    
                    <div className={`text-xs text-gray-500 mt-1 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
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

            {isStreaming && streamingMessage && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="chat-message-theme rounded-2xl rounded-bl-md p-3 max-w-[85%] md:max-w-[70%] animate-slide-up">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                      {streamingMessage}
                      <span className="inline-block w-0.5 h-4 bg-green-500 ml-1 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isStreaming && !streamingMessage && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center animate-pulse">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="chat-message-theme rounded-2xl rounded-bl-md p-4 animate-slide-up">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full loading-dot"></div>
                      </div>
                      <span className="text-sm text-muted-foreground animate-pulse">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card pb-safe">
          <div className="max-w-4xl mx-auto">
            {showAttachments && (
              <div className="mb-3 p-3 bg-muted rounded-lg animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Attach files</span>
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
                    className="text-xs border-border hover:border-green-500"
                    onClick={handleFileUpload}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Documents
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-border hover:border-green-500"
                    onClick={handleFileUpload}
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Photos
                  </Button>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-sm text-red-600 dark:text-red-400">Recording... Tap to stop</span>
                </div>
              </div>
            )}

            <div className="chat-input-theme rounded-2xl border focus-within:border-green-500 transition-colors">
              <div className="flex items-end space-x-2 p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-10 w-10 p-0 rounded-full transition-all touch-feedback ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
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

                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about law, legal documents, or case research..."
                    className="resize-none border-0 bg-transparent text-foreground placeholder-muted-foreground focus:ring-0 focus:outline-none text-base leading-relaxed mobile-textarea"
                    style={{ height: `${textareaHeight}px`, fontSize: '16px' }}
                    disabled={isStreaming || isRecording}
                    rows={1}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all touch-feedback"
                  onClick={() => setShowAttachments(!showAttachments)}
                  disabled={isStreaming}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming || isRecording}
                  className={`h-10 w-10 p-0 rounded-full transition-all touch-feedback ${
                    input.trim() && !isStreaming && !isRecording
                      ? 'bg-green-600 hover:bg-green-700 text-white scale-100'
                      : 'bg-muted text-muted-foreground scale-95'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground text-center px-2">
              {isRecording ? (
                <span className="text-red-500">🎤 Recording...</span>
              ) : (
                <span className="hidden sm:inline">Enter to send • AI can make mistakes</span>
                <span className="sm:hidden">AI can make mistakes</span>
              )}
            </div>

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