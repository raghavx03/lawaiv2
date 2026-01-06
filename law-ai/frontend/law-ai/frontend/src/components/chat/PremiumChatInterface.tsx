'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Menu, X } from 'lucide-react'
import { ChatSidebar } from './ChatSidebar'
import { ChatComposer } from './ChatComposer'
import { StreamingMessage } from './StreamingMessage'
import { useStreamingChat } from '@/hooks/useStreamingChat'
import { useTypingAnimation } from '@/hooks/useTypingAnimation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface FileAttachment {
  id: string
  file: File
  url?: string
  extractedText?: string
  uploading: boolean
  error?: string
}

export function PremiumChatInterface() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const {
    sessions,
    currentSession,
    isStreaming,
    streamingMessage,
    loadSessions,
    createNewSession,
    sendMessage,
    selectSession,
    shareSession
  } = useStreamingChat()

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setShowSidebar(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Auto-scroll to bottom with performance optimization
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
      }
    }
    
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(scrollToBottom)
  }, [currentSession?.messages, streamingMessage])

  const handleSendMessage = async (message: string, attachments?: FileAttachment[]) => {
    if (!currentSession) {
      createNewSession()
    }
    
    // Include attachment context in message
    let fullMessage = message
    if (attachments && attachments.length > 0) {
      const attachmentContext = attachments
        .filter(a => a.extractedText)
        .map(a => `[File: ${a.file.name}]\n${a.extractedText}`)
        .join('\n\n')
      
      if (attachmentContext) {
        fullMessage = `${message}\n\nAttached documents:\n${attachmentContext}`
      }
    }
    
    await sendMessage(fullMessage, currentSession?.id)
    
    // Close sidebar on mobile after sending
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const handleNewChat = () => {
    createNewSession()
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const handleSelectSession = (session: any) => {
    selectSession(session)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  return (
    <div className="ai-chat-container ai-chat-dark h-screen flex overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      } fixed lg:relative lg:translate-x-0 z-50 transition-transform duration-300 ease-in-out h-full`}>
        <ChatSidebar
          sessions={sessions}
          currentSession={currentSession}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onShareSession={shareSession}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="ai-chat-sidebar border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button
                onClick={() => setShowSidebar(!showSidebar)}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            
            <div>
              <h1 className="font-semibold text-lg">
                {currentSession?.title || 'Legal AI Assistant'}
              </h1>
              <p className="text-sm text-gray-400">
                Expert Indian Legal Guidance
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentSession || currentSession.messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6"
              >
                <span className="text-2xl font-bold text-white">R</span>
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2">Legal AI Assistant</h2>
              <p className="text-gray-400 mb-8 max-w-md">
                Ask any legal question and get expert guidance on Indian law with voice input and document analysis support.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  'Explain Section 420 IPC',
                  'Draft a rental agreement', 
                  'What is anticipatory bail?',
                  'Consumer rights in India'
                ].map((prompt) => (
                  <Button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    variant="outline"
                    className="ai-chat-input text-left h-auto p-4 justify-start"
                  >
                    <span className="text-sm">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-4xl mx-auto w-full space-y-6">
              <AnimatePresence>
                {currentSession.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {message.role === 'user' ? (
                      /* User Message */
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-green-600 text-white rounded-2xl rounded-br-md px-4 py-3">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <div className="flex justify-end mt-2">
                            <span className="text-xs text-green-100">
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* AI Message */
                      <StreamingMessage
                        content={message.content}
                        isComplete={true}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Streaming Message */}
              {isStreaming && streamingMessage && (
                <StreamingMessage
                  content={streamingMessage}
                  isComplete={false}
                />
              )}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="p-4 border-t ai-chat-sidebar">
          <div className="max-w-4xl mx-auto">
            <ChatComposer
              onSendMessage={handleSendMessage}
              disabled={isStreaming}
              isLoading={isStreaming}
            />
          </div>
        </div>
      </div>
    </div>
  )
}