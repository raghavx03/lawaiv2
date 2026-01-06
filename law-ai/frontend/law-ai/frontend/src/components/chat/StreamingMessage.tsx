'use client'

import { useEffect, useState, memo } from 'react'
import { Bot } from 'lucide-react'

interface StreamingMessageProps {
  content: string
  isComplete: boolean
  onComplete?: () => void
}

export const StreamingMessage = memo(function StreamingMessage({ content, isComplete, onComplete }: StreamingMessageProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    if (isComplete) {
      onComplete?.()
    }
  }, [isComplete, onComplete])

  if (!mounted) return null

  return (
    <div className="flex justify-start mb-2 sm:mb-3 animate-fade-in">
      <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[70%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
        <div className="flex items-center mb-2">
          <div className="p-1 bg-blue-600 rounded-full mr-2 flex-shrink-0">
            <Bot className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs text-blue-600 font-medium">Legal AI Assistant</span>
        </div>
        
        <div className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
          <div className="whitespace-pre-wrap break-words">
            {content}
            {!isComplete && (
              <span className="inline-block w-0.5 h-4 bg-blue-600 ml-1 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
})