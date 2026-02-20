import { prisma } from '@/lib/prisma'

export interface RiskAnalysisResult {
  overallRisk: number
  riskLevel: string
  confidence: number
  redFlags: Array<{
    clause: string
    section: string
    issue: string
    suggestion: string
  }>
  warnings: Array<{
    clause: string
    section: string
    issue: string
    suggestion: string
  }>
  suggestedRevisions: string[]
}

// Advanced rule-based detection for contract risks
function detectRisks(text: string): {
  redFlags: RiskAnalysisResult['redFlags']
  warnings: RiskAnalysisResult['warnings']
  riskScore: number
} {
  const lowerText = text.toLowerCase()
  const redFlags: RiskAnalysisResult['redFlags'] = []
  const warnings: RiskAnalysisResult['warnings'] = []
  let riskScore = 0

  // 1. Unlimited Liability Detection
  if (
    lowerText.includes('unlimited liability') ||
    lowerText.includes('unlimited damages') ||
    (lowerText.includes('liability') && lowerText.includes('unlimited'))
  ) {
    redFlags.push({
      clause: 'Unlimited Liability Clause',
      section: '6.3',
      issue: 'No cap on damages - you could be liable for unlimited amounts',
      suggestion: 'Cap liability at 1x contract value or annual fees',
    })
    riskScore += 30
  }

  // 2. Broad Indemnity Detection
  if (
    (lowerText.includes('indemnify') && lowerText.includes('all')) ||
    (lowerText.includes('indemnity') && lowerText.includes('any')) ||
    lowerText.includes('broad indemnity')
  ) {
    redFlags.push({
      clause: 'Broad Indemnity Clause',
      section: '5.2',
      issue: 'You\'re liable for everything including third-party claims',
      suggestion: 'Limit indemnity to direct damages only and exclude consequential damages',
    })
    riskScore += 25
  }

  // 3. One-Sided Termination Rights
  if (
    (lowerText.includes('terminate') && lowerText.includes('without cause')) ||
    (lowerText.includes('termination') && lowerText.includes('at will')) ||
    (lowerText.includes('terminate') && lowerText.includes('any time'))
  ) {
    redFlags.push({
      clause: 'One-Sided Termination Rights',
      section: '8.1',
      issue: 'They can exit anytime, but you cannot',
      suggestion: 'Add mutual termination rights with 30-day notice requirement',
    })
    riskScore += 20
  }

  // 4. Missing Liability Cap
  if (
    !lowerText.includes('liability cap') &&
    !lowerText.includes('liability limit') &&
    !lowerText.includes('capped at') &&
    lowerText.includes('liability')
  ) {
    warnings.push({
      clause: 'Missing Liability Cap',
      section: '6.0',
      issue: 'No explicit cap on liability mentioned',
      suggestion: 'Add explicit liability cap clause: "Liability limited to contract value"',
    })
    riskScore += 15
  }

  // 5. Restrictive Non-Compete
  if (
    lowerText.includes('non-compete') ||
    lowerText.includes('non compete') ||
    lowerText.includes('non-competition')
  ) {
    warnings.push({
      clause: 'Non-Compete Clause',
      section: '7.2',
      issue: 'Restrictive non-compete may limit future opportunities',
      suggestion: 'Negotiate scope and duration of non-compete (suggest 1-2 years max)',
    })
    riskScore += 10
  }

  // 6. Unfavorable Payment Terms
  if (
    (lowerText.includes('payment') && lowerText.includes('net 90')) ||
    (lowerText.includes('payment') && lowerText.includes('net 120')) ||
    lowerText.includes('payment on demand')
  ) {
    warnings.push({
      clause: 'Unfavorable Payment Terms',
      section: '4.1',
      issue: 'Extended payment terms may impact cash flow',
      suggestion: 'Negotiate to Net 30 or Net 45 terms',
    })
    riskScore += 8
  }

  // 7. IP Ownership Issues
  if (
    (lowerText.includes('intellectual property') && lowerText.includes('their')) ||
    (lowerText.includes('ip') && lowerText.includes('ownership')) ||
    lowerText.includes('all ip belongs to')
  ) {
    redFlags.push({
      clause: 'IP Ownership Concerns',
      section: '9.1',
      issue: 'Unclear or unfavorable IP ownership terms',
      suggestion: 'Clarify IP ownership: work product should belong to you unless otherwise specified',
    })
    riskScore += 22
  }

  // 8. Automatic Renewal
  if (
    lowerText.includes('auto renew') ||
    lowerText.includes('automatic renewal') ||
    (lowerText.includes('renew') && lowerText.includes('automatically'))
  ) {
    warnings.push({
      clause: 'Automatic Renewal Clause',
      section: '10.2',
      issue: 'Contract auto-renews without explicit action',
      suggestion: 'Add requirement for written notice to renew',
    })
    riskScore += 7
  }

  // 9. Confidentiality Overreach
  if (
    (lowerText.includes('confidential') && lowerText.includes('perpetual')) ||
    (lowerText.includes('nda') && lowerText.includes('forever'))
  ) {
    warnings.push({
      clause: 'Perpetual Confidentiality',
      section: '11.1',
      issue: 'Confidentiality obligations may be indefinite',
      suggestion: 'Limit confidentiality obligations to 3-5 years post-termination',
    })
    riskScore += 6
  }

  // 10. Dispute Resolution Issues
  if (
    !lowerText.includes('dispute resolution') &&
    !lowerText.includes('arbitration') &&
    !lowerText.includes('mediation')
  ) {
    warnings.push({
      clause: 'No Dispute Resolution Mechanism',
      section: '12.0',
      issue: 'No clear process for resolving disputes',
      suggestion: 'Add dispute resolution clause: mediation before litigation',
    })
    riskScore += 5
  }

  return { redFlags, warnings, riskScore }
}

// Calculate confidence score based on text analysis
function calculateConfidence(text: string, redFlagsCount: number): number {
  let confidence = 75 // Base confidence

  // Increase confidence if text is well-structured
  if (text.length > 5000) confidence += 5
  if (text.includes('section') || text.includes('clause')) confidence += 5
  if (text.includes('article') || text.includes('schedule')) confidence += 3

  // Decrease confidence if text is too short
  if (text.length < 500) confidence -= 10

  // Adjust based on number of detected issues
  if (redFlagsCount > 5) confidence -= 5
  if (redFlagsCount > 10) confidence -= 10

  return Math.min(100, Math.max(50, confidence))
}

// Generate suggested revisions based on detected issues
function generateSuggestedRevisions(
  redFlags: RiskAnalysisResult['redFlags'],
  warnings: RiskAnalysisResult['warnings']
): string[] {
  const revisions: string[] = []

  // Add revisions from red flags
  redFlags.forEach(flag => {
    revisions.push(`${flag.clause}: ${flag.suggestion}`)
  })

  // Add revisions from warnings
  warnings.slice(0, 2).forEach(warning => {
    revisions.push(`${warning.clause}: ${warning.suggestion}`)
  })

  // Add general best practices
  if (revisions.length < 5) {
    revisions.push('Add force majeure clause for unforeseen circumstances')
    revisions.push('Include clear termination procedures and notice periods')
    revisions.push('Define all key terms and definitions clearly')
  }

  return revisions.slice(0, 5)
}

// Main contract risk analysis function
export async function analyzeContractRisk(
  contractText: string,
  contractType: string = 'general'
): Promise<RiskAnalysisResult> {
  const startTime = Date.now()

  try {
    // Validate input
    if (!contractText || contractText.trim().length < 50) {
      throw new Error('Contract text too short. Please provide at least 50 characters.')
    }

    // Detect risks using rule-based system
    const { redFlags, warnings, riskScore: baseRiskScore } = detectRisks(contractText)

    // Calculate confidence
    const confidence = calculateConfidence(contractText, redFlags.length + warnings.length)

    // Generate suggested revisions
    const suggestedRevisions = generateSuggestedRevisions(redFlags, warnings)

    // Clamp risk score between 0 and 100
    const overallRisk = Math.max(0, Math.min(100, baseRiskScore))

    // Determine risk level
    let riskLevel = 'Low Risk'
    if (overallRisk >= 30 && overallRisk < 70) {
      riskLevel = 'Moderate Risk'
    } else if (overallRisk >= 70) {
      riskLevel = 'High Risk'
    }

    const analysisTime = Date.now() - startTime

    // Ensure analysis completes in <3 seconds
    if (analysisTime > 3000) {
      console.warn(`Contract analysis took ${analysisTime}ms, exceeding 3 second target`)
    }

    return {
      overallRisk,
      riskLevel,
      confidence: Math.round(confidence),
      redFlags,
      warnings,
      suggestedRevisions,
    }
  } catch (error) {
    console.error('Error analyzing contract:', error)
    throw error
  }
}

// Batch analyze multiple contracts
export async function analyzeContractsBatch(
  contracts: Array<{ text: string; type?: string }>
): Promise<RiskAnalysisResult[]> {
  return Promise.all(
    contracts.map(contract =>
      analyzeContractRisk(contract.text, contract.type)
    )
  )
}
