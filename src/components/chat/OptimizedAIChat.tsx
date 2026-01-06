'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Menu, X, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStreamingChat } from '@/hooks/useStreamingChat'
import { StreamingMessage } from './StreamingMessage'
import { ChatSidebar } from './ChatSidebar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function OptimizedAIChat() {
  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [textareaHeight, setTextareaHeight] = useState(44)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
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

  // Load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages, streamingMessage, scrollToBottom])

  // Handle message send
  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return
    
    const message = input.trim()
    setInput('')
    
    // Reset textarea height
    setTextareaHeight(44)
    
    await sendMessage(message)
  }, [input, isStreaming, sendMessage])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Auto-resize textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Auto-resize using React state
    const textarea = e.target
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 120)
    setTextareaHeight(newHeight)
  }, [])

  // Create new chat
  const handleNewChat = useCallback(() => {
    createNewSession()
    setSidebarOpen(false)
  }, [createNewSession])

  // Select session
  const handleSelectSession = useCallback((session: any) => {
    selectSession(session)
    setSidebarOpen(false)
  }, [selectSession])

  const allMessages = currentSession?.messages || []

  return (
    <div className="flex h-full bg-gray-900 text-white relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${sessions.length === 0 ? 'md:hidden' : ''}
      `}>
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
              onClick={handleNewChat}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 smooth-scroll prevent-overscroll">
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Welcome Message */}
            {allMessages.length === 0 && !isStreaming && (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Welcome to Legal AI Assistant</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  I can help you with legal questions, document analysis, case research, and more. 
                  How can I assist you today?
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "What is Section 420 IPC?",
                    "Draft a rental agreement",
                    "Explain consumer rights",
                    "Legal notice format"
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-600 hover:border-green-500 hover:text-green-400"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {allMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex max-w-[85%] md:max-w-[70%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } space-x-3`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-green-600' 
                        : 'bg-gray-700'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-green-600 text-white rounded-br-md'
                        : 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
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

            {/* Streaming Message */}
            {isStreaming && streamingMessage && (
              <StreamingMessage
                content={streamingMessage}
                isComplete={false}
              />
            )}

            {/* Loading Indicator */}
            {isStreaming && !streamingMessage && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl rounded-bl-md p-3 border border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full loading-dot"></div>
                      </div>
                      <span className="text-xs text-gray-400">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-800 chat-input">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about law, legal documents, or case research..."
                  className="ai-chat-input resize-none pr-12 text-base border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                  style={{ height: `${textareaHeight}px` }}
                  disabled={isStreaming}
                  rows={1}
                />
              </div>
              
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="h-11 w-11 p-0 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed touch-manipulation"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              Press Enter to send, Shift+Enter for new line • AI can make mistakes
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}