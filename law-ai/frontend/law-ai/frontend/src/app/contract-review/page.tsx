'use client'

import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, FileText, Eye, Download } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FeatureModal } from '@/components/auth/FeatureModal'

interface ContractReview {
  id: string
  contractId: string
  review: {
    riskLevel: 'High' | 'Medium' | 'Low'
    risks: Array<{
      type: string
      severity: string
      description: string
      recommendation: string
    }>
    keyClauses: string[]
    missingClauses: string[]
    recommendations: string[]
    complianceIssues: string[]
    overallScore: number
    summary: string
  }
  createdAt: string
}

function ContractReviewContent() {
  const [contractText, setContractText] = useState('')
  const [contractTitle, setContractTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [review, setReview] = useState<ContractReview | null>(null)

  const reviewContract = async () => {
    if (!contractText.trim()) {
      toast.error('Please enter contract text')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/review-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Review failed')
      }

      setReview(data)
      toast.success('Contract reviewed successfully!')
      
    } catch (error) {
      console.error('Review error:', error)
      toast.error('Failed to review contract')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return '#ef4444'
      case 'Medium': return '#f59e0b'
      case 'Low': return '#22c55e'
      default: return '#64748b'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#22c55e'
    if (score >= 6) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
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
            <Link href="/document-analysis" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>Document Analysis</Link>
            <Link href="/contract-review" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: '600' }}>Contract Review</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(139, 92, 246, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              marginBottom: '1.5rem'
            }}>
              <Shield size={16} color="#8b5cf6" />
              <span style={{ color: '#8b5cf6', fontSize: '0.875rem', fontWeight: '600' }}>
                AI-Powered Contract Review
              </span>
            </div>
            
            <h1 style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: '800',
              color: 'white',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #ffffff, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🛡️ Contract Review
            </h1>
            
            <p style={{
              fontSize: '1.25rem',
              color: '#cbd5e1',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Detect risky clauses, compliance issues, and get AI-powered recommendations for contract improvements
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            {/* Input Section */}
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
                <FileText size={24} />
                Contract Input
              </h2>

              {/* Contract Title */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Contract Title (Optional)
                </label>
                <input
                  type="text"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  placeholder="e.g., Service Agreement, NDA, Employment Contract"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Contract Text */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Contract Text *
                </label>
                <textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Paste your contract text here for AI-powered review and risk assessment..."
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'monospace'
                  }}
                />
                <p style={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  marginTop: '0.5rem'
                }}>
                  {contractText.length} characters
                </p>
              </div>

              {/* Review Button */}
              <button
                onClick={reviewContract}
                disabled={!contractText.trim() || loading}
                style={{
                  width: '100%',
                  background: !contractText.trim() || loading ? '#374151' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '1rem',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: !contractText.trim() || loading ? 'not-allowed' : 'pointer',
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
                    Reviewing...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Review Contract
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
              minHeight: '600px'
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
                Review Results
              </h2>

              {review ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Overall Score & Risk Level */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{
                      background: `rgba(${getScoreColor(review.review.overallScore) === '#22c55e' ? '34, 197, 94' : getScoreColor(review.review.overallScore) === '#f59e0b' ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      border: `1px solid rgba(${getScoreColor(review.review.overallScore) === '#22c55e' ? '34, 197, 94' : getScoreColor(review.review.overallScore) === '#f59e0b' ? '245, 158, 11' : '239, 68, 68'}, 0.2)`,
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: getScoreColor(review.review.overallScore),
                        marginBottom: '0.5rem'
                      }}>
                        {review.review.overallScore}/10
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600' }}>
                        Overall Score
                      </div>
                    </div>

                    <div style={{
                      background: `rgba(${getRiskColor(review.review.riskLevel) === '#ef4444' ? '239, 68, 68' : getRiskColor(review.review.riskLevel) === '#f59e0b' ? '245, 158, 11' : '34, 197, 94'}, 0.1)`,
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      border: `1px solid rgba(${getRiskColor(review.review.riskLevel) === '#ef4444' ? '239, 68, 68' : getRiskColor(review.review.riskLevel) === '#f59e0b' ? '245, 158, 11' : '34, 197, 94'}, 0.2)`,
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: getRiskColor(review.review.riskLevel),
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        {review.review.riskLevel === 'High' && <XCircle size={20} />}
                        {review.review.riskLevel === 'Medium' && <AlertTriangle size={20} />}
                        {review.review.riskLevel === 'Low' && <CheckCircle size={20} />}
                        {review.review.riskLevel}
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600' }}>
                        Risk Level
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <h3 style={{ color: '#3b82f6', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                      Executive Summary
                    </h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.5' }}>
                      {review.review.summary}
                    </p>
                  </div>

                  {/* Risks */}
                  {review.review.risks && review.review.risks.length > 0 && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <h3 style={{ 
                        color: '#ef4444', 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <AlertTriangle size={18} />
                        Identified Risks
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {review.review.risks.map((risk, index) => (
                          <div key={index} style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{ color: '#fca5a5', fontSize: '0.875rem', fontWeight: '600' }}>
                                {risk.type}
                              </span>
                              <span style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {risk.severity}
                              </span>
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                              {risk.description}
                            </p>
                            <p style={{ color: '#86efac', fontSize: '0.75rem', fontStyle: 'italic' }}>
                              💡 {risk.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Clauses */}
                  {review.review.missingClauses && review.review.missingClauses.length > 0 && (
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                      <h3 style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                        Missing Clauses
                      </h3>
                      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                        {review.review.missingClauses.map((clause, index) => (
                          <li key={index} style={{ color: '#fbbf24', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            {clause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {review.review.recommendations && review.review.recommendations.length > 0 && (
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <h3 style={{ 
                        color: '#22c55e', 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <TrendingUp size={18} />
                        Recommendations
                      </h3>
                      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                        {review.review.recommendations.map((rec, index) => (
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
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '500px',
                  color: '#64748b',
                  textAlign: 'center'
                }}>
                  <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    No Review Yet
                  </h3>
                  <p style={{ fontSize: '0.875rem' }}>
                    Enter contract text to see AI-powered review and risk assessment
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
    </div>
  )
}

export default function ContractReviewPage() {
  return (
    <FeatureModal feature="AI_ASSISTANT">
      <ContractReviewContent />
    </FeatureModal>
  )
}