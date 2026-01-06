'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image as ImageIcon, Loader2, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useCase } from '@/context/CaseContext'
import { useAuth } from '@/context/AuthContext'

interface UploadedFile {
  id?: string
  filename: string
  fileType: string
  fileSize: number
  fileUrl?: string
  extractedText?: string
}

interface FileUploadProps {
  onFileUploaded?: (file: UploadedFile) => void
  linkedFeature?: string
  accept?: string
  maxSize?: number // in MB
  compact?: boolean
}

export function FileUpload({ 
  onFileUploaded, 
  linkedFeature,
  accept = '.pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx',
  maxSize = 10,
  compact = false
}: FileUploadProps) {
  const { user } = useAuth()
  const { activeCase } = useCase()
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (activeCase?.id) formData.append('caseId', activeCase.id)
      if (linkedFeature) formData.append('linkedFeature', linkedFeature)
      if (user?.id) formData.append('userId', user.id)

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      const uploaded: UploadedFile = {
        id: data.fileId,
        filename: data.filename,
        fileType: data.fileType,
        fileSize: data.fileSize,
        fileUrl: data.fileUrl,
        extractedText: data.extractedText
      }

      setUploadedFile(uploaded)
      onFileUploaded?.(uploaded)
      toast.success('File uploaded successfully')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }, [activeCase, linkedFeature, user, maxSize, onFileUploaded])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }, [handleUpload])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0])
    }
  }, [handleUpload])

  const clearFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept={accept}
          className="hidden"
        />
        {uploadedFile ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-sm">
            {uploadedFile.fileType.startsWith('image/') ? (
              <ImageIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <FileText className="h-4 w-4 text-gray-500" />
            )}
            <span className="truncate max-w-[150px]">{uploadedFile.filename}</span>
            <button onClick={clearFile} className="p-0.5 hover:bg-gray-200 rounded">
              <X className="h-3 w-3 text-gray-500" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
        dragActive 
          ? 'border-gray-900 bg-gray-50' 
          : uploadedFile 
          ? 'border-green-300 bg-green-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept={accept}
        className="hidden"
      />

      {uploading ? (
        <div className="py-4">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Uploading...</p>
        </div>
      ) : uploadedFile ? (
        <div className="py-2">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <p className="font-medium text-gray-900 mb-1">{uploadedFile.filename}</p>
          <p className="text-xs text-gray-500 mb-3">
            {(uploadedFile.fileSize / 1024).toFixed(1)} KB
            {activeCase && <span className="ml-2">• Linked to {activeCase.cnrNumber}</span>}
          </p>
          <button
            onClick={clearFile}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Remove and upload another
          </button>
        </div>
      ) : (
        <div 
          className="py-4 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Upload className="h-6 w-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900 mb-1">
            Drop file here or click to upload
          </p>
          <p className="text-xs text-gray-500">
            PDF, Images, TXT, DOC up to {maxSize}MB
          </p>
          {activeCase && (
            <p className="text-xs text-gray-400 mt-2">
              Will be linked to: {activeCase.cnrNumber}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
