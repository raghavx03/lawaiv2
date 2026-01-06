import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

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

export function useStreamingChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')

  const loadSessions = useCallback(async () => {
    try {
      console.log('Loading chat sessions...')
      const response = await fetch('/api/chat/sessions')
      console.log('Sessions response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Sessions loaded:', data.sessions?.length || 0, 'sessions')
        setSessions(data.sessions || [])
      } else {
        console.error('Failed to load sessions - Status:', response.status)
      }
    } catch (error) {
      console.error('Failed to load sessions:', error instanceof Error ? error.message : 'Unknown error')
    }
  }, [])

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setCurrentSession(newSession)
    setSessions(prev => [newSession, ...prev])
    return newSession
  }, [])

  const sendMessage = useCallback(async (message: string, sessionId?: string) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    // Ensure we have a session
    let workingSession = currentSession
    if (!workingSession) {
      workingSession = createNewSession()
    }

    // Add user message immediately
    const updatedSession = {
      ...workingSession,
      messages: [...workingSession.messages, userMessage],
      updatedAt: new Date()
    }
    setCurrentSession(updatedSession)

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
          sessionId: sessionId || workingSession.id
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
                  setStreamingMessage(fullResponse)
                }
                if (data.done) {
                  const assistantMessage: Message = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: fullResponse,
                    timestamp: new Date()
                  }

                  const finalSession = {
                    ...updatedSession,
                    id: data.sessionId || updatedSession.id,
                    title: data.title || updatedSession.title,
                    messages: [...updatedSession.messages, assistantMessage],
                    updatedAt: new Date()
                  }
                  
                  // Update current session
                  setCurrentSession(finalSession)
                  
                  // Update sessions list
                  setSessions(prev => {
                    const existingIndex = prev.findIndex(s => s.id === finalSession.id)
                    if (existingIndex >= 0) {
                      const updated = [...prev]
                      updated[existingIndex] = finalSession
                      return updated
                    }
                    return [finalSession, ...prev]
                  })
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsStreaming(false)
      setStreamingMessage('')
    }
  }, [currentSession, createNewSession])

  const selectSession = useCallback((session: ChatSession) => {
    setCurrentSession(session)
  }, [])

  const shareSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch('/api/chat/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        const data = await response.json()
        return data.shareUrl
      }
    } catch (error) {
      console.error('Failed to share session:', error)
    }
    return null
  }, [])

  return {
    sessions,
    currentSession,
    isStreaming,
    streamingMessage,
    loadSessions,
    createNewSession,
    sendMessage,
    selectSession,
    shareSession
  }
}