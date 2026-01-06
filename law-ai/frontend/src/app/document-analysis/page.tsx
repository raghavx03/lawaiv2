'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, AlertTriangle, CheckCircle, Download, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FeatureModal } from '@/components/auth/FeatureModal'

// File validation
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const validateFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please upload a PDF, DOC, DOCX, or TXT file'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be less than 5MB'
  }
  return null
}

interface Analysis {
  id: string
  fileName: string
  analysis: {
    summary: string
    keyPoints: string[]
    risks: string[]
    recommendations: string[]
    documentType: string
    compliance: string
  }
  createdAt: string
}

function DocumentAnalysisContent() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = useCallback((selectedFile: File) => {
    const error = validateFile(selectedFile)
    if (error) {
      toast.error(error)
      return
    }
    setFile(selectedFile)
    toast.success(`File "${selectedFile.name}" selected successfully`)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const analyzeDocument = useCallback(async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    const validationError = validateFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('document', file)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      clearTimeout(timeoutId)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Analysis failed`)
      }

      setAnalysis(data)

      toast.success('Document analyzed successfully!')
      
    } catch (error) {
      console.error('Analysis error:', error)
      let errorMessage = 'Failed to analyze document'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Analysis timed out. Please try again with a smaller file.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [file])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}
    >
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem'
            }}>
              ⚖
            </div>
            <span style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'white'
            }}>
              LAW.AI
            </span>
          </Link>
          
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <Link href="/ai-assistant" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>AI Assistant</Link>
            <Link href="/document-analysis" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>Document Analysis</Link>
            <Link href="/contract-review" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>Contract Review</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '1.5rem'
            }}>
              <FileText size={16} color="#10b981" />
              <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
                AI-Powered Document Analysis
              </span>
            </div>
            
            <h1 style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: '800',
              color: 'white',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #ffffff, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              📄 Document Analysis
            </h1>
            
            <p style={{
              fontSize: '1.25rem',
              color: '#cbd5e1',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Upload legal documents for AI-powered analysis, risk assessment, and compliance checking
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            {/* Upload Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '2rem',
              padding: '2.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Upload size={24} />
                Upload Document
              </h2>

              {/* File Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}`,
                  borderRadius: '1rem',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: dragActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  marginBottom: '2rem'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                />
                
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  background: 'linear-gradient(135deg, #10b981, #047857)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Upload size={24} color="white" />
                </div>
                
                <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {file ? file.name : 'Drop your document here'}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse files'}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '1rem' }}>
                  Supports PDF, DOC, DOCX, TXT files (max 5MB)
                </p>
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyzeDocument}
                disabled={!file || loading}
                style={{
                  width: '100%',
                  background: !file || loading ? '#374151' : 'linear-gradient(135deg, #10b981, #047857)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '1rem',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: !file || loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    Analyze Document
                  </>
                )}
              </button>
            </div>

            {/* Results Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '2rem',
              padding: '2.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minHeight: '500px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Eye size={24} />
                Analysis Results
              </h2>

              {analysis ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Document Type */}
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <h3 style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Document Type
                    </h3>
                    <p style={{ color: 'white', fontSize: '1rem' }}>
                      {analysis.analysis.documentType || 'Legal Document'}
                    </p>
                  </div>

                  {/* Summary */}
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <h3 style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Summary
                    </h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.5' }}>
                      {analysis.analysis.summary}
                    </p>
                  </div>

                  {/* Key Points */}
                  {analysis.analysis.keyPoints && analysis.analysis.keyPoints.length > 0 && (
                    <div style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}>
                      <h3 style={{ color: '#8b5cf6', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                        Key Points
                      </h3>
                      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                        {analysis.analysis.keyPoints.map((point, index) => (
                          <li key={index} style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risks */}
                  {analysis.analysis.risks && analysis.analysis.risks.length > 0 && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <h3 style={{ 
                        color: '#ef4444', 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <AlertTriangle size={16} />
                        Potential Risks
                      </h3>
                      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                        {analysis.analysis.risks.map((risk, index) => (
                          <li key={index} style={{ color: '#fca5a5', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.analysis.recommendations && analysis.analysis.recommendations.length > 0 && (
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <h3 style={{ 
                        color: '#22c55e', 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <CheckCircle size={16} />
                        Recommendations
                      </h3>
                      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                        {analysis.analysis.recommendations.map((rec, index) => (
                          <li key={index} style={{ color: '#86efac', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Download size={16} />
                      Export Report
                    </button>
                    
                    <button 
                      onClick={() => setAnalysis(null)}
                      style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Trash2 size={16} />
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '400px',
                  color: '#64748b',
                  textAlign: 'center'
                }}>
                  <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    No Analysis Yet
                  </h3>
                  <p style={{ fontSize: '0.875rem' }}>
                    Upload a document to see AI-powered analysis results here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          main > div > div {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default function DocumentAnalysisPage() {
  return (
    <FeatureModal feature="AI_ASSISTANT">
      <DocumentAnalysisContent />
    </FeatureModal>
  )
}