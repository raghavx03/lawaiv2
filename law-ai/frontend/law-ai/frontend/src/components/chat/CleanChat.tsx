'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, Menu, MessageSquare, Plus } from 'lucide-react'
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

export function CleanChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Fixed scroll behavior - no glitches during typing
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [])

  // Optimized scroll effect - only scroll when needed
  useEffect(() => {
    if (isStreaming || messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 50)
      return () => clearTimeout(timer)
    }
  }, [messages, streamingMessage, scrollToBottom, isStreaming])

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
      id: `session-${Date.now()}`,
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

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return
    
    const message = input.trim()
    setInput('')
    
    let workingSession = currentSession
    if (!workingSession) {
      workingSession = {
        id: `session-${Date.now()}`,
        title: message.slice(0, 50),
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

    setTimeout(() => {
      const response = "I understand your legal question. This is a sample response from the AI assistant."
      setStreamingMessage(response)
      
      setTimeout(() => {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }
        
        const finalMessages = [...updatedMessages, assistantMessage]
        setMessages(finalMessages)
        setStreamingMessage('')
        setIsStreaming(false)
        
        const finalSession = {
          ...workingSession,
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
      }, 2000)
    }, 500)
  }, [input, isStreaming, messages, currentSession, saveSessions])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="claude-chat-container">
      <style jsx>{`
        .claude-chat-container {
          display: flex;
          height: 100%;
          background-color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .claude-sidebar {
          width: 320px;
          background-color: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
        }
        
        .claude-sidebar-mobile {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 50;
        }
        
        .claude-sidebar-mobile.open {
          transform: translateX(0);
        }
        
        .claude-sidebar-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          background-color: #ffffff;
        }
        
        .claude-sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          background-color: #ffffff;
        }
        
        .claude-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #ffffff;
          min-width: 0;
        }
        
        .claude-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .claude-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background-color: #ffffff;
          scroll-behavior: auto;
        }
        
        .claude-messages-content {
          max-width: 768px;
          margin: 0 auto;
        }
        
        .claude-message {
          margin-bottom: 24px;
        }
        
        .claude-message-label {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 8px;
        }
        
        .claude-message-content {
          color: #111827;
          line-height: 1.6;
          white-space: pre-wrap;
          font-size: 15px;
        }
        
        .claude-input-area {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background-color: #ffffff;
        }
        
        .claude-input-container {
          max-width: 768px;
          margin: 0 auto;
        }
        
        .claude-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .claude-textarea {
          flex: 1;
          resize: none;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 12px;
          background-color: #ffffff;
          color: #111827;
          font-size: 15px;
          line-height: 1.5;
          min-height: 44px;
          max-height: 120px;
        }
        
        .claude-textarea:focus {
          outline: none;
          border-color: #059669;
          box-shadow: 0 0 0 1px #059669;
        }
        
        .claude-send-button {
          background-color: #059669;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }
        
        .claude-send-button:hover {
          background-color: #047857;
        }
        
        .claude-send-button:disabled {
          background-color: #d1d5db;
          cursor: not-allowed;
        }
        
        .claude-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }
        
        .claude-session-item {
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 4px;
          transition: background-color 0.2s;
          background-color: transparent;
        }
        
        .claude-session-item:hover {
          background-color: #f9fafb;
        }
        
        .claude-session-item.active {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
        }
        
        .claude-thinking {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .claude-thinking-dots {
          display: flex;
          gap: 4px;
        }
        
        .claude-thinking-dot {
          width: 8px;
          height: 8px;
          background-color: #059669;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite both;
        }
        
        .claude-thinking-dot:nth-child(1) { animation-delay: -0.32s; }
        .claude-thinking-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        .claude-cursor {
          display: inline-block;
          width: 2px;
          height: 16px;
          background-color: #059669;
          margin-left: 4px;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @media (max-width: 768px) {
          .claude-sidebar {
            display: none;
          }
          
          .claude-sidebar-mobile {
            display: flex;
          }
        }
        
        @media (min-width: 769px) {
          .claude-sidebar-mobile {
            display: none;
          }
          
          .claude-sidebar {
            display: flex;
          }
        }
      `}</style>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="claude-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      {sessions.length > 0 && (
        <div className="claude-sidebar hidden md:flex">
          <div className="claude-sidebar-header">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">RAGS</h2>
                <p className="text-xs text-gray-500">Legal AI Assistant</p>
              </div>
            </div>
            <Button onClick={createNewSession} className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          <div className="claude-sidebar-content">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`claude-session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                onClick={() => selectSession(session)}
              >
                <h3 className="text-sm font-medium text-gray-900 truncate">{session.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{session.messages.length} messages</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {sessions.length > 0 && (
        <div className={`claude-sidebar claude-sidebar-mobile ${sidebarOpen ? 'open' : ''}`}>
          <div className="claude-sidebar-header">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">RAGS</h2>
                <p className="text-xs text-gray-500">Legal AI Assistant</p>
              </div>
            </div>
            <Button onClick={createNewSession} className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          <div className="claude-sidebar-content">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`claude-session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                onClick={() => selectSession(session)}
              >
                <h3 className="text-sm font-medium text-gray-900 truncate">{session.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{session.messages.length} messages</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat */}
      <div className="claude-main">
        {/* Header */}
        <div className="claude-header">
          <div className="flex items-center space-x-3">
            {sessions.length > 0 && (
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
            )}
            <Bot className="h-6 w-6 text-green-600" />
            <h1 className="font-semibold text-gray-900">Legal AI Assistant</h1>
          </div>
          {sessions.length === 0 && (
            <Button onClick={createNewSession} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="claude-messages" ref={messagesContainerRef}>
          <div className="claude-messages-content">
            {messages.length === 0 && !isStreaming && (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-gray-900">Welcome to Legal AI Assistant</h2>
                <p className="text-gray-600">Ask me anything about law, legal documents, or case research.</p>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div key={message.id} className="claude-message">
                <div className="claude-message-label">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="claude-message-content">
                  {message.content}
                </div>
              </div>
            ))}

            {/* Streaming Message */}
            {isStreaming && streamingMessage && (
              <div className="claude-message">
                <div className="claude-message-label">Assistant</div>
                <div className="claude-message-content">
                  {streamingMessage}
                  <span className="claude-cursor" />
                </div>
              </div>
            )}

            {/* Thinking - Show after user message */}
            {isStreaming && !streamingMessage && messages.length > 0 && (
              <div className="claude-thinking" style={{marginLeft: '0', marginTop: '12px'}}>
                <div className="claude-thinking-dots">
                  <div className="claude-thinking-dot"></div>
                  <div className="claude-thinking-dot"></div>
                  <div className="claude-thinking-dot"></div>
                </div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="claude-input-area">
          <div className="claude-input-container">
            <div className="claude-input-wrapper">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your legal question..."
                className="claude-textarea"
                disabled={isStreaming}
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="claude-send-button"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 text-xs text-center text-gray-500">
              Press Enter to send
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}