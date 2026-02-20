// Conflict Detection Service
// Detects conflicts of interest and dual representation issues

export interface ConflictCheck {
  hasConflict: boolean
  conflictType?: string
  severity?: 'critical' | 'high' | 'medium' | 'low'
  description?: string
  recommendation?: string
}

export interface ConflictAnalysis {
  caseId: string
  parties: string[]
  conflictChecks: ConflictCheck[]
  hasConflict: boolean
  summary: string
  recommendations: string[]
}

/**
 * Check for conflicts of interest
 */
export function checkConflicts(
  caseId: string,
  parties: string[],
  previousCases: Array<{ caseId: string; parties: string[] }> = []
): ConflictAnalysis {
  const conflictChecks: ConflictCheck[] = []
  const recommendations: string[] = []

  // Check 1: Dual representation
  if (parties.length >= 2) {
    const dualRepCheck = checkDualRepresentation(parties)
    if (dualRepCheck.hasConflict) {
      conflictChecks.push(dualRepCheck)
      recommendations.push('Cannot represent both parties in the same matter')
    }
  }

  // Check 2: Previous adverse representation
  for (const prevCase of previousCases) {
    const adverseCheck = checkAdverseRepresentation(parties, prevCase.parties)
    if (adverseCheck.hasConflict) {
      conflictChecks.push(adverseCheck)
      recommendations.push(`Previously represented adverse party in case ${prevCase.caseId}`)
    }
  }

  // Check 3: Related party conflicts
  const relatedCheck = checkRelatedPartyConflict(parties)
  if (relatedCheck.hasConflict) {
    conflictChecks.push(relatedCheck)
    recommendations.push('Related parties may create conflict of interest')
  }

  // Check 4: Financial interest
  const financialCheck = checkFinancialInterest(parties)
  if (financialCheck.hasConflict) {
    conflictChecks.push(financialCheck)
    recommendations.push('Financial interest in outcome may create conflict')
  }

  const hasConflict = conflictChecks.some(c => c.hasConflict)
  const summary = generateConflictSummary(hasConflict, conflictChecks)

  return {
    caseId,
    parties,
    conflictChecks,
    hasConflict,
    summary,
    recommendations
  }
}

/**
 * Check for dual representation
 */
function checkDualRepresentation(parties: string[]): ConflictCheck {
  // In a single case, cannot represent multiple parties
  if (parties.length > 1) {
    return {
      hasConflict: true,
      conflictType: 'Dual Representation',
      severity: 'critical',
      description: 'Cannot represent multiple parties in the same matter',
      recommendation: 'Choose one party to represent or withdraw from representation'
    }
  }

  return { hasConflict: false }
}

/**
 * Check for adverse representation
 */
function checkAdverseRepresentation(
  currentParties: string[],
  previousParties: string[]
): ConflictCheck {
  // Check if any current party was adverse in previous case
  for (const current of currentParties) {
    for (const previous of previousParties) {
      if (current.toLowerCase() === previous.toLowerCase()) {
        return {
          hasConflict: true,
          conflictType: 'Adverse Representation',
          severity: 'critical',
          description: 'Previously represented adverse party',
          recommendation: 'Obtain written consent from all parties or withdraw'
        }
      }
    }
  }

  return { hasConflict: false }
}

/**
 * Check for related party conflicts
 */
function checkRelatedPartyConflict(parties: string[]): ConflictCheck {
  // Check for common names or related entities
  const partyNames = parties.map(p => p.toLowerCase())

  for (let i = 0; i < partyNames.length; i++) {
    for (let j = i + 1; j < partyNames.length; j++) {
      // Check for similar names (potential related parties)
      if (partyNames[i].includes(partyNames[j]) || partyNames[j].includes(partyNames[i])) {
        return {
          hasConflict: true,
          conflictType: 'Related Party Conflict',
          severity: 'high',
          description: 'Parties may be related entities',
          recommendation: 'Disclose relationship and obtain consent'
        }
      }
    }
  }

  return { hasConflict: false }
}

/**
 * Check for financial interest
 */
function checkFinancialInterest(parties: string[]): ConflictCheck {
  // Check for keywords indicating financial interest
  const financialKeywords = ['subsidiary', 'affiliate', 'partner', 'investor', 'shareholder', 'owner']

  for (const party of parties) {
    for (const keyword of financialKeywords) {
      if (party.toLowerCase().includes(keyword)) {
        return {
          hasConflict: true,
          conflictType: 'Financial Interest',
          severity: 'medium',
          description: 'May have financial interest in outcome',
          recommendation: 'Disclose financial interest and obtain consent'
        }
      }
    }
  }

  return { hasConflict: false }
}

/**
 * Generate conflict summary
 */
function generateConflictSummary(hasConflict: boolean, checks: ConflictCheck[]): string {
  if (!hasConflict) {
    return 'No conflicts of interest detected'
  }

  const criticalCount = checks.filter(c => c.severity === 'critical').length
  const highCount = checks.filter(c => c.severity === 'high').length
  const mediumCount = checks.filter(c => c.severity === 'medium').length

  const parts: string[] = []
  if (criticalCount > 0) parts.push(`${criticalCount} critical conflict${criticalCount > 1 ? 's' : ''}`)
  if (highCount > 0) parts.push(`${highCount} high conflict${highCount > 1 ? 's' : ''}`)
  if (mediumCount > 0) parts.push(`${mediumCount} medium conflict${mediumCount > 1 ? 's' : ''}`)

  return `⚠️ CONFLICT DETECTED: ${parts.join(', ')}`
}

/**
 * Format conflict analysis for display
 */
export function formatConflictAnalysisForDisplay(analysis: ConflictAnalysis): string {
  const lines: string[] = []

  lines.push(`# Conflict of Interest Analysis`)
  lines.push(`Case ID: ${analysis.caseId}`)
  lines.push(`Parties: ${analysis.parties.join(', ')}`)
  lines.push(``)
  lines.push(analysis.summary)
  lines.push(``)

  if (analysis.conflictChecks.length > 0) {
    lines.push(`## Conflict Checks`)
    lines.push(``)

    for (const check of analysis.conflictChecks) {
      if (check.hasConflict) {
        const icon = check.severity === 'critical' ? '🔴' : check.severity === 'high' ? '🟠' : '🟡'
        lines.push(`${icon} **${check.conflictType}** (${check.severity.toUpperCase()})`)
        lines.push(`- ${check.description}`)
        lines.push(`- Recommendation: ${check.recommendation}`)
        lines.push(``)
      }
    }
  }

  if (analysis.recommendations.length > 0) {
    lines.push(`## Recommendations`)
    for (const rec of analysis.recommendations) {
      lines.push(`- ${rec}`)
    }
  }

  return lines.join('\n')
}
