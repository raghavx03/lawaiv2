// Risk Scoring Service
// Analyzes cases and contracts to assess risk levels

export interface RiskFactor {
  category: string
  factor: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  recommendation: string
}

export interface RiskScore {
  overallScore: number // 0-100
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  factors: RiskFactor[]
  summary: string
  recommendations: string[]
}

// Risk assessment keywords and patterns
const CRITICAL_RISK_FACTORS = [
  { pattern: /unlimited liability/i, category: 'Liability', severity: 'critical' },
  { pattern: /no warranty|as is/i, category: 'Warranty', severity: 'critical' },
  { pattern: /waive.*right/i, category: 'Rights', severity: 'critical' },
  { pattern: /no recourse/i, category: 'Recourse', severity: 'critical' },
  { pattern: /irreversible|irrevocable/i, category: 'Reversibility', severity: 'critical' }
]

const HIGH_RISK_FACTORS = [
  { pattern: /may terminate.*any time/i, category: 'Termination', severity: 'high' },
  { pattern: /without notice|without cause/i, category: 'Notice', severity: 'high' },
  { pattern: /sole discretion/i, category: 'Discretion', severity: 'high' },
  { pattern: /unilateral.*change/i, category: 'Modification', severity: 'high' },
  { pattern: /perpetual|in perpetuity/i, category: 'Duration', severity: 'high' }
]

const MEDIUM_RISK_FACTORS = [
  { pattern: /limited warranty/i, category: 'Warranty', severity: 'medium' },
  { pattern: /limited liability/i, category: 'Liability', severity: 'medium' },
  { pattern: /may modify/i, category: 'Modification', severity: 'medium' },
  { pattern: /subject to/i, category: 'Conditions', severity: 'medium' },
  { pattern: /at discretion/i, category: 'Discretion', severity: 'medium' }
]

const LOW_RISK_FACTORS = [
  { pattern: /standard terms/i, category: 'Terms', severity: 'low' },
  { pattern: /mutual agreement/i, category: 'Agreement', severity: 'low' },
  { pattern: /fair and reasonable/i, category: 'Fairness', severity: 'low' }
]

/**
 * Score a case or contract for risk
 */
export function scoreRisk(text: string, type: 'case' | 'contract' = 'contract'): RiskScore {
  const factors: RiskFactor[] = []
  let criticalCount = 0
  let highCount = 0
  let mediumCount = 0
  let lowCount = 0

  // Check critical risk factors
  for (const factor of CRITICAL_RISK_FACTORS) {
    if (factor.pattern.test(text)) {
      criticalCount++
      factors.push({
        category: factor.category,
        factor: factor.pattern.source,
        severity: 'critical',
        description: `Found critical risk factor: ${factor.category}`,
        recommendation: getRecommendation(factor.category, 'critical')
      })
    }
  }

  // Check high risk factors
  for (const factor of HIGH_RISK_FACTORS) {
    if (factor.pattern.test(text)) {
      highCount++
      factors.push({
        category: factor.category,
        factor: factor.pattern.source,
        severity: 'high',
        description: `Found high risk factor: ${factor.category}`,
        recommendation: getRecommendation(factor.category, 'high')
      })
    }
  }

  // Check medium risk factors
  for (const factor of MEDIUM_RISK_FACTORS) {
    if (factor.pattern.test(text)) {
      mediumCount++
      factors.push({
        category: factor.category,
        factor: factor.pattern.source,
        severity: 'medium',
        description: `Found medium risk factor: ${factor.category}`,
        recommendation: getRecommendation(factor.category, 'medium')
      })
    }
  }

  // Check low risk factors
  for (const factor of LOW_RISK_FACTORS) {
    if (factor.pattern.test(text)) {
      lowCount++
      factors.push({
        category: factor.category,
        factor: factor.pattern.source,
        severity: 'low',
        description: `Found low risk factor: ${factor.category}`,
        recommendation: getRecommendation(factor.category, 'low')
      })
    }
  }

  // Calculate overall score (0-100, higher = more risk)
  const overallScore = Math.min(100, (criticalCount * 25) + (highCount * 15) + (mediumCount * 8) + (lowCount * 2))

  // Determine risk level
  let riskLevel: 'critical' | 'high' | 'medium' | 'low'
  if (overallScore >= 75) riskLevel = 'critical'
  else if (overallScore >= 50) riskLevel = 'high'
  else if (overallScore >= 25) riskLevel = 'medium'
  else riskLevel = 'low'

  // Generate summary
  const summary = generateRiskSummary(overallScore, riskLevel, criticalCount, highCount, mediumCount)

  // Generate recommendations
  const recommendations = generateRecommendations(factors, type)

  return {
    overallScore,
    riskLevel,
    factors,
    summary,
    recommendations
  }
}

/**
 * Get recommendation for a risk factor
 */
function getRecommendation(category: string, severity: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    'Liability': {
      'critical': 'Negotiate to cap liability to a specific amount or percentage',
      'high': 'Review liability exclusions carefully',
      'medium': 'Ensure liability cap is reasonable',
      'low': 'Liability terms appear standard'
    },
    'Warranty': {
      'critical': 'Negotiate for express warranties',
      'high': 'Clarify warranty scope and duration',
      'medium': 'Review warranty limitations',
      'low': 'Warranty terms are acceptable'
    },
    'Termination': {
      'critical': 'Add notice period and cause requirements',
      'high': 'Require notice period before termination',
      'medium': 'Clarify termination conditions',
      'low': 'Termination terms are clear'
    },
    'Notice': {
      'critical': 'Require written notice with specific timeframe',
      'high': 'Add notice period requirement',
      'medium': 'Clarify notice requirements',
      'low': 'Notice terms are standard'
    },
    'Discretion': {
      'critical': 'Add objective criteria for discretionary decisions',
      'high': 'Limit discretionary power',
      'medium': 'Add guidelines for discretion',
      'low': 'Discretion is limited'
    },
    'Modification': {
      'critical': 'Require mutual written consent for modifications',
      'high': 'Add approval process for changes',
      'medium': 'Clarify modification procedures',
      'low': 'Modification terms are clear'
    },
    'Duration': {
      'critical': 'Negotiate for time-limited obligations',
      'high': 'Add expiration date',
      'medium': 'Review duration reasonableness',
      'low': 'Duration is reasonable'
    }
  }

  return recommendations[category]?.[severity] || 'Review this term carefully'
}

/**
 * Generate risk summary
 */
function generateRiskSummary(
  score: number,
  level: string,
  critical: number,
  high: number,
  medium: number
): string {
  const parts: string[] = []

  if (critical > 0) parts.push(`${critical} critical risk factor${critical > 1 ? 's' : ''}`)
  if (high > 0) parts.push(`${high} high risk factor${high > 1 ? 's' : ''}`)
  if (medium > 0) parts.push(`${medium} medium risk factor${medium > 1 ? 's' : ''}`)

  if (parts.length === 0) return 'No significant risk factors identified'

  return `Risk Score: ${score}/100 (${level.toUpperCase()}). Found: ${parts.join(', ')}`
}

/**
 * Generate recommendations
 */
function generateRecommendations(factors: RiskFactor[], type: string): string[] {
  const recommendations: string[] = []
  const criticalFactors = factors.filter(f => f.severity === 'critical')
  const highFactors = factors.filter(f => f.severity === 'high')

  if (criticalFactors.length > 0) {
    recommendations.push(`⚠️ CRITICAL: Address ${criticalFactors.length} critical risk factor${criticalFactors.length > 1 ? 's' : ''} before proceeding`)
  }

  if (highFactors.length > 0) {
    recommendations.push(`⚠️ HIGH: Negotiate ${highFactors.length} high risk factor${highFactors.length > 1 ? 's' : ''}`)
  }

  if (type === 'contract') {
    recommendations.push('Have a qualified attorney review this contract')
    recommendations.push('Ensure all terms are clearly understood before signing')
  } else if (type === 'case') {
    recommendations.push('Assess case strength with experienced counsel')
    recommendations.push('Develop mitigation strategy for identified risks')
  }

  return recommendations
}

/**
 * Format risk score for display
 */
export function formatRiskScoreForDisplay(score: RiskScore): string {
  const lines: string[] = []

  lines.push(`# Risk Assessment Report`)
  lines.push(``)
  lines.push(`## Overall Risk Score: ${score.overallScore}/100`)
  lines.push(`**Risk Level:** ${score.riskLevel.toUpperCase()}`)
  lines.push(``)
  lines.push(score.summary)
  lines.push(``)

  if (score.factors.length > 0) {
    lines.push(`## Risk Factors`)
    lines.push(``)

    const criticalFactors = score.factors.filter(f => f.severity === 'critical')
    const highFactors = score.factors.filter(f => f.severity === 'high')
    const mediumFactors = score.factors.filter(f => f.severity === 'medium')

    if (criticalFactors.length > 0) {
      lines.push(`### 🔴 Critical Risk Factors`)
      for (const factor of criticalFactors) {
        lines.push(`- **${factor.category}**: ${factor.description}`)
        lines.push(`  - Recommendation: ${factor.recommendation}`)
      }
      lines.push(``)
    }

    if (highFactors.length > 0) {
      lines.push(`### 🟠 High Risk Factors`)
      for (const factor of highFactors) {
        lines.push(`- **${factor.category}**: ${factor.description}`)
        lines.push(`  - Recommendation: ${factor.recommendation}`)
      }
      lines.push(``)
    }

    if (mediumFactors.length > 0) {
      lines.push(`### 🟡 Medium Risk Factors`)
      for (const factor of mediumFactors) {
        lines.push(`- **${factor.category}**: ${factor.description}`)
      }
      lines.push(``)
    }
  }

  if (score.recommendations.length > 0) {
    lines.push(`## Recommendations`)
    for (const rec of score.recommendations) {
      lines.push(`- ${rec}`)
    }
  }

  return lines.join('\n')
}
