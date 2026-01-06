'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mic, Paperclip, X } from 'lucide-react'
import { VoiceRecorder } from './VoiceRecorder'
import { FileUploader } from './FileUploader'

interface FileAttachment {
  id: string
  file: File
  url?: string
  extractedText?: string
  uploading: boolean
  error?: string
}

interface ChatComposerProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void
  disabled?: boolean
  placeholder?: string
  isLoading?: boolean
}

export function ChatComposer({ onSendMessage, disabled, placeholder = "Ask your legal question...", isLoading = false }: ChatComposerProps) {
  const [message, setMessage] = useState('')
  const [showVoice, setShowVoice] = useState(false)
  const [showFiles, setShowFiles] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() && attachments.length === 0) return
    if (disabled) return
    
    // Check if any attachments are still uploading
    const uploadingAttachments = attachments.filter(a => a.uploading)
    if (uploadingAttachments.length > 0) return

    onSendMessage(message, attachments.length > 0 ? attachments : undefined)
    setMessage('')
    setAttachments([])
    setShowVoice(false)
    setShowFiles(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleVoiceTranscription = (text: string) => {
    setMessage(prev => prev + (prev ? ' ' : '') + text)
    setShowVoice(false)
    textareaRef.current?.focus()
  }

  const canSend = (message.trim() || attachments.length > 0) && 
                  !disabled && 
                  !attachments.some(a => a.uploading)

  return (
    <div className="ai-chat-input border rounded-xl p-4 space-y-3">
      {/* Voice Recorder */}
      {showVoice && (
        <div className="animate-fade-in">
          <VoiceRecorder 
            onTranscription={handleVoiceTranscription}
            disabled={disabled}
          />
        </div>
      )}

      {/* File Uploader */}
      {showFiles && (
        <div className="animate-fade-in">
          <FileUploader 
            onAttachmentsChange={setAttachments}
            disabled={disabled}
          />
        </div>
      )}

      {/* Main Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="ai-chat-input resize-none min-h-[44px] max-h-32 pr-24 text-base border-0 bg-transparent focus:ring-0 focus:border-0"
            style={{ fontSize: '16px' }} // Prevent iOS zoom
          />
          
          {/* Action Buttons */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <Button
              type="button"
              onClick={() => setShowVoice(!showVoice)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-green-500/20"
              disabled={disabled}
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              onClick={() => setShowFiles(!showFiles)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-500/20"
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              type="submit"
              disabled={!canSend}
              size="sm"
              className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Attachment Summary */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-1 text-sm"
              >
                <span className="truncate max-w-32">{attachment.file.name}</span>
                {attachment.uploading && (
                  <div className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin" />
                )}
                <Button
                  type="button"
                  onClick={() => setAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-red-500/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <span className="text-xs text-gray-400 ml-2">AI is thinking...</span>
        </div>
      )}
      
      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center">
        AI can make mistakes. Consult a qualified lawyer for specific legal advice.
      </p>
    </div>
  )
}