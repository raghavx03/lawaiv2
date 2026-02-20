'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

interface FileUploadProps {
  onAnalyze: (text: string) => void
  loading: boolean
}

export default function FileUpload({ onAnalyze, loading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pastedText, setPastedText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      // For now, return a placeholder - in production, use pdf-parse or similar
      return `[PDF Content from ${file.name}]\n\nPlease paste the contract text or use a PDF parser library.`
    } catch (error) {
      throw new Error('Failed to extract text from PDF')
    }
  }

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    if (file.type === 'application/pdf') {
      try {
        const text = await extractTextFromPDF(file)
        setPastedText(text)
        setFileName(file.name)
      } catch (error) {
        toast.error('Failed to read PDF file')
      }
    } else if (file.type === 'text/plain') {
      const text = await file.text()
      setPastedText(text)
      setFileName(file.name)
    } else {
      toast.error('Please upload a PDF or text file')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleAnalyze = () => {
    const text = pastedText || textAreaRef.current?.value
    if (!text?.trim()) {
      toast.error('Please upload or paste a contract')
      return
    }
    onAnalyze(text)
  }

  const handleClear = () => {
    setPastedText('')
    setFileName(null)
    if (textAreaRef.current) {
      textAreaRef.current.value = ''
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="text-center">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-900 mb-2">
            Drag and drop your contract here
          </p>
          <p className="text-slate-600 mb-4">or</p>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Choose File
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            Supported formats: PDF, TXT (Max 10MB)
          </p>
        </div>
      </div>

      {/* File Preview */}
      {fileName && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-slide-up">
          <FileText className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium text-slate-900">{fileName}</p>
            <p className="text-sm text-slate-600">Ready to analyze</p>
          </div>
          <button
            onClick={handleClear}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      )}

      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Or paste your contract text
        </label>
        <textarea
          ref={textAreaRef}
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste your contract text here..."
          className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-slate-500 mt-2">
          {pastedText.length} characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleAnalyze}
          disabled={loading || !pastedText.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Contract'}
        </Button>
        {pastedText && (
          <Button
            onClick={handleClear}
            variant="outline"
            className="px-6"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
