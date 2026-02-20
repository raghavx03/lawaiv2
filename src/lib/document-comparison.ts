// Document Comparison Service
// Compares two documents and highlights differences

export interface DocumentDifference {
  type: 'added' | 'removed' | 'modified'
  lineNumber: number
  originalText?: string
  newText?: string
  context: string
}

export interface ComparisonResult {
  document1Id: string
  document2Id: string
  totalDifferences: number
  addedLines: number
  removedLines: number
  modifiedLines: number
  similarities: number
  differences: DocumentDifference[]
  summary: string
}

/**
 * Compare two documents line by line
 */
export function compareDocuments(
  doc1Id: string,
  doc1Text: string,
  doc2Id: string,
  doc2Text: string
): ComparisonResult {
  const lines1 = doc1Text.split('\n')
  const lines2 = doc2Text.split('\n')

  const differences: DocumentDifference[] = []
  let addedLines = 0
  let removedLines = 0
  let modifiedLines = 0
  let similarities = 0

  // Use simple line-by-line comparison
  const maxLines = Math.max(lines1.length, lines2.length)

  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || ''
    const line2 = lines2[i] || ''

    if (line1 === line2) {
      if (line1.trim().length > 0) {
        similarities++
      }
    } else if (!line1 && line2) {
      // Line added
      addedLines++
      differences.push({
        type: 'added',
        lineNumber: i + 1,
        newText: line2,
        context: getContext(lines2, i)
      })
    } else if (line1 && !line2) {
      // Line removed
      removedLines++
      differences.push({
        type: 'removed',
        lineNumber: i + 1,
        originalText: line1,
        context: getContext(lines1, i)
      })
    } else {
      // Line modified
      modifiedLines++
      differences.push({
        type: 'modified',
        lineNumber: i + 1,
        originalText: line1,
        newText: line2,
        context: getContext(lines2, i)
      })
    }
  }

  const totalDifferences = addedLines + removedLines + modifiedLines
  const summary = generateComparisonSummary(
    totalDifferences,
    addedLines,
    removedLines,
    modifiedLines,
    similarities
  )

  return {
    document1Id: doc1Id,
    document2Id: doc2Id,
    totalDifferences,
    addedLines,
    removedLines,
    modifiedLines,
    similarities,
    differences: differences.slice(0, 100), // Limit to first 100 differences
    summary
  }
}

/**
 * Get context around a line
 */
function getContext(lines: string[], lineIndex: number, contextLines: number = 2): string {
  const start = Math.max(0, lineIndex - contextLines)
  const end = Math.min(lines.length, lineIndex + contextLines + 1)
  return lines.slice(start, end).join('\n')
}

/**
 * Generate comparison summary
 */
function generateComparisonSummary(
  total: number,
  added: number,
  removed: number,
  modified: number,
  similarities: number
): string {
  if (total === 0) {
    return 'Documents are identical'
  }

  const parts: string[] = []

  if (added > 0) parts.push(`${added} line${added > 1 ? 's' : ''} added`)
  if (removed > 0) parts.push(`${removed} line${removed > 1 ? 's' : ''} removed`)
  if (modified > 0) parts.push(`${modified} line${modified > 1 ? 's' : ''} modified`)

  const similarity = similarities > 0 ? Math.round((similarities / (similarities + total)) * 100) : 0

  return `Found ${total} difference${total > 1 ? 's' : ''}: ${parts.join(', ')}. Similarity: ${similarity}%`
}

/**
 * Format comparison for display
 */
export function formatComparisonForDisplay(result: ComparisonResult): string {
  const lines: string[] = []

  lines.push(`# Document Comparison Report`)
  lines.push(`Document 1: ${result.document1Id}`)
  lines.push(`Document 2: ${result.document2Id}`)
  lines.push('')
  lines.push(result.summary)
  lines.push('')
  lines.push(`| Metric | Count |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Added Lines | ${result.addedLines} |`)
  lines.push(`| Removed Lines | ${result.removedLines} |`)
  lines.push(`| Modified Lines | ${result.modifiedLines} |`)
  lines.push(`| Similar Lines | ${result.similarities} |`)
  lines.push('')

  if (result.differences.length > 0) {
    lines.push(`## Differences (showing first ${Math.min(result.differences.length, 50)})`)
    lines.push('')

    for (const diff of result.differences.slice(0, 50)) {
      lines.push(`### Line ${diff.lineNumber} - ${diff.type.toUpperCase()}`)

      if (diff.type === 'added') {
        lines.push(`**Added:** ${diff.newText}`)
      } else if (diff.type === 'removed') {
        lines.push(`**Removed:** ${diff.originalText}`)
      } else {
        lines.push(`**Original:** ${diff.originalText}`)
        lines.push(`**New:** ${diff.newText}`)
      }

      lines.push('')
    }
  }

  return lines.join('\n')
}

/**
 * Highlight differences in text
 */
export function highlightDifferences(
  text: string,
  differences: DocumentDifference[],
  type: 'added' | 'removed' | 'modified'
): string {
  const lines = text.split('\n')
  const relevantDiffs = differences.filter(d => d.type === type)

  for (const diff of relevantDiffs) {
    const lineIndex = diff.lineNumber - 1
    if (lineIndex >= 0 && lineIndex < lines.length) {
      if (type === 'added') {
        lines[lineIndex] = `✅ ${lines[lineIndex]}`
      } else if (type === 'removed') {
        lines[lineIndex] = `❌ ${lines[lineIndex]}`
      } else {
        lines[lineIndex] = `⚠️ ${lines[lineIndex]}`
      }
    }
  }

  return lines.join('\n')
}

/**
 * Get reconciliation suggestions
 */
export function getReconciliationSuggestions(result: ComparisonResult): string[] {
  const suggestions: string[] = []

  if (result.addedLines > 0) {
    suggestions.push(`Review ${result.addedLines} added line(s) to ensure they align with requirements`)
  }

  if (result.removedLines > 0) {
    suggestions.push(`Verify that ${result.removedLines} removed line(s) are intentional`)
  }

  if (result.modifiedLines > 0) {
    suggestions.push(`Carefully review ${result.modifiedLines} modified line(s) for legal implications`)
  }

  if (result.similarities > 0) {
    const similarity = Math.round((result.similarities / (result.similarities + result.totalDifferences)) * 100)
    if (similarity > 80) {
      suggestions.push('Documents are mostly similar - focus on the differences')
    } else if (similarity > 50) {
      suggestions.push('Documents have significant differences - review carefully')
    } else {
      suggestions.push('Documents are substantially different - consider full review')
    }
  }

  return suggestions
}
