// Clause Extraction Service
// Identifies and extracts clauses from legal documents
// Assesses risk levels and suggests improvements

import { callAIQuick } from './ai-service'

export interface ExtractedClause {
  id: string
  title: string
  content: string
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
  suggestions: string[]
  lineNumbers?: { start: number; end: number }
}

export interface ClauseExtractionResult {
  documentId: string
  totalClauses: number
  clauses: ExtractedClause[]
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  summary: string
}

// Common legal clause patterns
const CLAUSE_PATTERNS = [
  { name: 'Payment Terms', regex: /payment\s+terms?|payment\s+schedule|payment\s+conditions/i },
  { name: 'Termination', regex: /termination|terminate|cancellation|cancel/i },
  { name: 'Liability', regex: /liability|liable|indemnif|indemnity/i },
  { name: 'Confidentiality', regex: /confidential|confidentiality|nda|non-disclosure/i },
  { name: 'Intellectual Property', regex: /intellectual\s+property|copyright|patent|trademark|ip\s+rights/i },
  { name: 'Dispute Resolution', regex: /dispute|arbitration|mediation|litigation|jurisdiction/i },
  { name: 'Warranty', regex: /warrant|guarantee|representation|condition/i },
  { name: 'Force Majeure', regex: /force\s+majeure|act\s+of\s+god|unforeseen|circumstances/i },
  { name: 'Governing Law', regex: /governing\s+law|jurisdiction|applicable\s+law|laws\s+of/i },
  { name: 'Limitation of Liability', regex: /limitation\s+of\s+liability|exclude|excluded|not\s+liable/i },
  { name: 'Indemnification', regex: /indemnif|hold\s+harmless|defend|defend\s+and\s+indemnify/i },
  { name: 'Severability', regex: /severability|severability\s+clause|if\s+any\s+provision/i },
  { name: 'Amendment', regex: /amendment|modification|modify|amend|change/i },
  { name: 'Assignment', regex: /assignment|assign|transfer|delegate/i },
  { name: 'Entire Agreement', regex: /entire\s+agreement|supersede|prior\s+agreement|understanding/i }
]

// High-risk keywords
const HIGH_RISK_KEYWORDS = [
  'unlimited liability',
  'no warranty',
  'as is',
  'no recourse',
  'sole remedy',
  'waive',
  'waiver',
  'no liability',
  'no damages',
  'no compensation',
  'no refund',
  'no return',
  'irreversible',
  'irrevocable',
  'perpetual',
  'in perpetuity',
  'exclusive',
  'sole discretion',
  'unilateral',
  'one-sided'
]

// Medium-risk keywords
const MEDIUM_RISK_KEYWORDS = [
  'may terminate',
  'at any time',
  'without notice',
  'without cause',
  'without liability',
  'subject to',
  'at discretion',
  'may modify',
  'may change',
  'may cancel',
  'may suspend',
  'limited warranty',
  'limited liability',
  'cap on liability'
]

/**
 * Extract clauses from document text
 */
export async function extractClauses(
  documentId: string,
  documentText: string
): Promise<ClauseExtractionResult> {
  const clauses: ExtractedClause[] = []
  const lines = documentText.split('\n')

  // Find clauses using pattern matching
  for (const pattern of CLAUSE_PATTERNS) {
    const clauseMatches = findClauseMatches(documentText, pattern.name, pattern.regex)
    clauses.push(...clauseMatches)
  }

  // Assess risk levels
  for (const clause of clauses) {
    assessClauseRisk(clause)
    generateSuggestions(clause)
  }

  // Sort by risk level
  clauses.sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 }
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
  })

  // Generate summary
  const highRiskCount = clauses.filter(c => c.riskLevel === 'high').length
  const mediumRiskCount = clauses.filter(c => c.riskLevel === 'medium').length
  const lowRiskCount = clauses.filter(c => c.riskLevel === 'low').length

  const summary = generateSummary(highRiskCount, mediumRiskCount, lowRiskCount)

  return {
    documentId,
    totalClauses: clauses.length,
    clauses,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    summary
  }
}

/**
 * Find clause matches in document
 */
function findClauseMatches(
  text: string,
  clauseName: string,
  pattern: RegExp
): ExtractedClause[] {
  const matches: ExtractedClause[] = []
  const lines = text.split('\n')
  let currentLine = 0

  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      // Extract clause content (current line + next 5 lines)
      const startLine = i
      const endLine = Math.min(i + 5, lines.length - 1)
      const content = lines.slice(startLine, endLine + 1).join('\n').trim()

      if (content.length > 20) {
        matches.push({
          id: `${clauseName}-${matches.length}`,
          title: clauseName,
          content: content.substring(0, 500),
          riskLevel: 'low',
          riskFactors: [],
          suggestions: [],
          lineNumbers: { start: startLine + 1, end: endLine + 1 }
        })
      }
    }
  }

  return matches
}

/**
 * Assess risk level of a clause
 */
function assessClauseRisk(clause: ExtractedClause): void {
  const lowerContent = clause.content.toLowerCase()
  let riskScore = 0

  // Check for high-risk keywords
  for (const keyword of HIGH_RISK_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      riskScore += 3
      clause.riskFactors.push(`Contains: "${keyword}"`)
    }
  }

  // Check for medium-risk keywords
  for (const keyword of MEDIUM_RISK_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      riskScore += 1
      clause.riskFactors.push(`Contains: "${keyword}"`)
    }
  }

  // Determine risk level
  if (riskScore >= 6) {
    clause.riskLevel = 'high'
  } else if (riskScore >= 2) {
    clause.riskLevel = 'medium'
  } else {
    clause.riskLevel = 'low'
  }
}

/**
 * Generate suggestions for clause improvement
 */
function generateSuggestions(clause: ExtractedClause): void {
  const suggestions: string[] = []
  const lowerContent = clause.content.toLowerCase()

  // Liability clause suggestions
  if (clause.title.includes('Liability')) {
    if (lowerContent.includes('unlimited')) {
      suggestions.push('Consider capping liability to a specific amount or percentage')
    }
    if (lowerContent.includes('no liability')) {
      suggestions.push('Ensure liability exclusions do not apply to gross negligence or willful misconduct')
    }
  }

  // Payment terms suggestions
  if (clause.title.includes('Payment')) {
    if (!lowerContent.includes('late') && !lowerContent.includes('interest')) {
      suggestions.push('Consider adding late payment interest or penalties')
    }
    if (!lowerContent.includes('currency')) {
      suggestions.push('Specify the currency for payment')
    }
  }

  // Termination suggestions
  if (clause.title.includes('Termination')) {
    if (lowerContent.includes('at any time')) {
      suggestions.push('Consider requiring notice period before termination')
    }
    if (!lowerContent.includes('notice')) {
      suggestions.push('Add notice period requirement for termination')
    }
  }

  // Confidentiality suggestions
  if (clause.title.includes('Confidentiality')) {
    if (!lowerContent.includes('duration') && !lowerContent.includes('period')) {
      suggestions.push('Specify the duration of confidentiality obligations')
    }
    if (!lowerContent.includes('exception') && !lowerContent.includes('exclude')) {
      suggestions.push('Add exceptions for publicly available information')
    }
  }

  // IP suggestions
  if (clause.title.includes('Intellectual Property')) {
    if (!lowerContent.includes('ownership')) {
      suggestions.push('Clearly specify ownership of intellectual property')
    }
    if (!lowerContent.includes('license')) {
      suggestions.push('Define any licenses granted for intellectual property')
    }
  }

  clause.suggestions = suggestions
}

/**
 * Generate summary of clause extraction
 */
function generateSummary(high: number, medium: number, low: number): string {
  const total = high + medium + low
  if (total === 0) return 'No clauses found in document'

  const parts: string[] = []

  if (high > 0) {
    parts.push(`${high} high-risk clause${high > 1 ? 's' : ''} requiring attention`)
  }
  if (medium > 0) {
    parts.push(`${medium} medium-risk clause${medium > 1 ? 's' : ''}`)
  }
  if (low > 0) {
    parts.push(`${low} low-risk clause${low > 1 ? 's' : ''}`)
  }

  return `Found ${total} clauses: ${parts.join(', ')}`
}

/**
 * Format clauses for display
 */
export function formatClausesForDisplay(result: ClauseExtractionResult): string {
  const lines: string[] = []

  lines.push(`# Clause Extraction Report`)
  lines.push(`Document: ${result.documentId}`)
  lines.push(`Total Clauses: ${result.totalClauses}`)
  lines.push(`High Risk: ${result.highRiskCount} | Medium Risk: ${result.mediumRiskCount} | Low Risk: ${result.lowRiskCount}`)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  // Group by risk level
  const highRisk = result.clauses.filter(c => c.riskLevel === 'high')
  const mediumRisk = result.clauses.filter(c => c.riskLevel === 'medium')
  const lowRisk = result.clauses.filter(c => c.riskLevel === 'low')

  if (highRisk.length > 0) {
    lines.push('## ⚠️ HIGH RISK CLAUSES')
    for (const clause of highRisk) {
      lines.push(`### ${clause.title}`)
      lines.push(`**Risk Factors:** ${clause.riskFactors.join(', ')}`)
      lines.push(`**Content:** ${clause.content.substring(0, 200)}...`)
      if (clause.suggestions.length > 0) {
        lines.push(`**Suggestions:**`)
        for (const suggestion of clause.suggestions) {
          lines.push(`- ${suggestion}`)
        }
      }
      lines.push('')
    }
  }

  if (mediumRisk.length > 0) {
    lines.push('## ⚡ MEDIUM RISK CLAUSES')
    for (const clause of mediumRisk) {
      lines.push(`### ${clause.title}`)
      if (clause.suggestions.length > 0) {
        lines.push(`**Suggestions:**`)
        for (const suggestion of clause.suggestions) {
          lines.push(`- ${suggestion}`)
        }
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}
