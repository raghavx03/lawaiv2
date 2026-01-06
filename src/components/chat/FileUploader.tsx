'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip, X, FileText, Image, File } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FileAttachment {
  id: string
  file: File
  url?: string
  extractedText?: string
  uploading: boolean
  error?: string
}

interface FileUploaderProps {
  onAttachmentsChange: (attachments: FileAttachment[]) => void
  disabled?: boolean
  maxFiles?: number
  maxSizeBytes?: number
}

const ALLOWED_TYPES = {
  'image/jpeg': 'image',
  'image/png': 'image', 
  'image/webp': 'image',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'text'
}

export function FileUploader({ 
  onAttachmentsChange, 
  disabled, 
  maxFiles = 5,
  maxSizeBytes = 10 * 1024 * 1024 // 10MB
}: FileUploaderProps) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [dragOver, setDragOver] = useState(false)

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const uploadFile = async (file: File): Promise<{ url: string; extractedText?: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/uploads/files', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    return response.json()
  }

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
        return false
      }
      if (file.size > maxSizeBytes) {
        return false
      }
      return true
    }).slice(0, maxFiles - attachments.length)

    const newAttachments: FileAttachment[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      uploading: true
    }))

    const updatedAttachments = [...attachments, ...newAttachments]
    setAttachments(updatedAttachments)
    onAttachmentsChange(updatedAttachments)

    // Upload files
    for (const attachment of newAttachments) {
      try {
        const result = await uploadFile(attachment.file)
        
        setAttachments(prev => {
          const updated = prev.map(a => 
            a.id === attachment.id 
              ? { ...a, url: result.url, extractedText: result.extractedText, uploading: false }
              : a
          )
          onAttachmentsChange(updated)
          return updated
        })
      } catch (error) {
        setAttachments(prev => {
          const updated = prev.map(a => 
            a.id === attachment.id 
              ? { ...a, uploading: false, error: 'Upload failed' }
              : a
          )
          onAttachmentsChange(updated)
          return updated
        })
      }
    }
  }, [attachments, maxFiles, maxSizeBytes, onAttachmentsChange])

  const removeAttachment = (id: string) => {
    const updated = attachments.filter(a => a.id !== id)
    setAttachments(updated)
    onAttachmentsChange(updated)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [disabled, handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <input
          type="file"
          id="file-upload"
          multiple
          accept={Object.keys(ALLOWED_TYPES).join(',')}
          onChange={handleFileInput}
          disabled={disabled || attachments.length >= maxFiles}
          className="hidden"
        />
        <label htmlFor="file-upload">
          <Button
            as="span"
            variant="outline"
            size="sm"
            disabled={disabled || attachments.length >= maxFiles}
            className="ai-chat-input border-blue-500/30 hover:border-blue-500/50 cursor-pointer"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Attach Files
          </Button>
        </label>
        
        {attachments.length > 0 && (
          <span className="text-xs text-gray-400">
            {attachments.length}/{maxFiles} files
          </span>
        )}
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          dragOver 
            ? 'border-blue-500/50 bg-blue-500/10' 
            : 'border-gray-600/30'
        } ${attachments.length === 0 ? 'block' : 'hidden'}`}
      >
        <div className="text-center text-sm text-gray-400">
          Drop files here or click to upload
          <br />
          <span className="text-xs">PDF, DOCX, Images (max {Math.round(maxSizeBytes / 1024 / 1024)}MB)</span>
        </div>
      </div>

      <AnimatePresence>
        {attachments.map((attachment) => (
          <motion.div
            key={attachment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="ai-chat-message p-3 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {getFileIcon(attachment.file.type)}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{attachment.file.name}</p>
                <p className="text-xs text-gray-400">
                  {(attachment.file.size / 1024).toFixed(1)} KB
                  {attachment.uploading && ' • Uploading...'}
                  {attachment.error && ` • ${attachment.error}`}
                  {attachment.extractedText && ' • Text extracted'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => removeAttachment(attachment.id)}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}