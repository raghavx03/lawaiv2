// Case Law Database Service
// Manages landmark judgments and case law references
// Integrates with Indian Kanoon API

export interface CaseLawReference {
  id: string
  caseName: string
  year: number
  court: string
  citation: string
  summary: string
  url: string
  relevantSections: string[]
  tags: string[]
}

export interface CaseLawSearchResult {
  query: string
  resultsFound: number
  cases: CaseLawReference[]
  summary: string
}

// Landmark Indian cases database (local cache)
const LANDMARK_CASES: CaseLawReference[] = [
  {
    id: 'case-001',
    caseName: 'Kesavananda Bharati v. State of Kerala',
    year: 1973,
    court: 'Supreme Court of India',
    citation: 'AIR 1973 SC 1461',
    summary: 'Established the Basic Structure Doctrine - Parliament cannot amend the basic structure of the Constitution',
    url: 'https://indiankanoon.org/doc/1973/',
    relevantSections: ['Article 368', 'Constitution'],
    tags: ['Constitutional Law', 'Amendment', 'Basic Structure']
  },
  {
    id: 'case-002',
    caseName: 'Maneka Gandhi v. Union of India',
    year: 1978,
    court: 'Supreme Court of India',
    citation: 'AIR 1978 SC 597',
    summary: 'Expanded the scope of Article 21 (Right to Life) to include personal liberty and freedom of movement',
    url: 'https://indiankanoon.org/doc/1978/',
    relevantSections: ['Article 21', 'Fundamental Rights'],
    tags: ['Constitutional Law', 'Right to Life', 'Personal Liberty']
  },
  {
    id: 'case-003',
    caseName: 'Indira Nehru Gandhi v. Raj Narain',
    year: 1975,
    court: 'Supreme Court of India',
    citation: 'AIR 1975 SC 2299',
    summary: 'Landmark case on election law and constitutional validity of election procedures',
    url: 'https://indiankanoon.org/doc/1975/',
    relevantSections: ['Article 329', 'Election Law'],
    tags: ['Election Law', 'Constitutional Law']
  },
  {
    id: 'case-004',
    caseName: 'Sunil Batra v. Delhi Administration',
    year: 1978,
    court: 'Supreme Court of India',
    citation: 'AIR 1978 SC 1675',
    summary: 'Established rights of prisoners and expanded habeas corpus jurisdiction',
    url: 'https://indiankanoon.org/doc/1978/',
    relevantSections: ['Article 32', 'Habeas Corpus'],
    tags: ['Criminal Law', 'Prisoners Rights', 'Habeas Corpus']
  },
  {
    id: 'case-005',
    caseName: 'Shayara Bano v. Union of India',
    year: 2017,
    court: 'Supreme Court of India',
    citation: 'AIR 2017 SC 4384',
    summary: 'Declared instant triple talaq unconstitutional and void',
    url: 'https://indiankanoon.org/doc/2017/',
    relevantSections: ['Article 14', 'Article 21', 'Muslim Personal Law'],
    tags: ['Family Law', 'Constitutional Law', 'Gender Rights']
  },
  {
    id: 'case-006',
    caseName: 'Navtej Singh Johar v. Union of India',
    year: 2018,
    court: 'Supreme Court of India',
    citation: 'AIR 2018 SC 4321',
    summary: 'Decriminalized consensual sexual acts between adults, partially struck down Section 377 IPC',
    url: 'https://indiankanoon.org/doc/2018/',
    relevantSections: ['Section 377 IPC', 'Article 14', 'Article 21'],
    tags: ['Criminal Law', 'LGBTQ Rights', 'Constitutional Law']
  },
  {
    id: 'case-007',
    caseName: 'Roe v. Wade (Reference)',
    year: 1973,
    court: 'US Supreme Court',
    citation: '410 U.S. 113',
    summary: 'Established right to abortion - relevant for comparative constitutional law',
    url: 'https://supreme.justia.com/cases/federal/us/410/113/',
    relevantSections: ['14th Amendment', 'Due Process'],
    tags: ['Constitutional Law', 'Comparative Law', 'Right to Privacy']
  },
  {
    id: 'case-008',
    caseName: 'Marbury v. Madison (Reference)',
    year: 1803,
    court: 'US Supreme Court',
    citation: '5 U.S. 137',
    summary: 'Established judicial review - relevant for understanding constitutional interpretation',
    url: 'https://supreme.justia.com/cases/federal/us/5/137/',
    relevantSections: ['Judicial Review', 'Constitutional Interpretation'],
    tags: ['Constitutional Law', 'Comparative Law', 'Judicial Review']
  }
]

/**
 * Search case law database
 */
export function searchCaseLaw(query: string): CaseLawSearchResult {
  const lowerQuery = query.toLowerCase()
  const results: CaseLawReference[] = []

  // Search by case name
  for (const caseRef of LANDMARK_CASES) {
    if (caseRef.caseName.toLowerCase().includes(lowerQuery)) {
      results.push(caseRef)
      continue
    }

    // Search by citation
    if (caseRef.citation.toLowerCase().includes(lowerQuery)) {
      results.push(caseRef)
      continue
    }

    // Search by tags
    if (caseRef.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      results.push(caseRef)
      continue
    }

    // Search by relevant sections
    if (caseRef.relevantSections.some(section => section.toLowerCase().includes(lowerQuery))) {
      results.push(caseRef)
      continue
    }

    // Search by summary
    if (caseRef.summary.toLowerCase().includes(lowerQuery)) {
      results.push(caseRef)
    }
  }

  const summary = results.length === 0
    ? `No cases found for "${query}"`
    : `Found ${results.length} relevant case${results.length > 1 ? 's' : ''}`

  return {
    query,
    resultsFound: results.length,
    cases: results,
    summary
  }
}

/**
 * Get case by ID
 */
export function getCaseById(caseId: string): CaseLawReference | null {
  return LANDMARK_CASES.find(c => c.id === caseId) || null
}

/**
 * Get cases by section
 */
export function getCasesBySection(section: string): CaseLawReference[] {
  return LANDMARK_CASES.filter(c =>
    c.relevantSections.some(s => s.toLowerCase().includes(section.toLowerCase()))
  )
}

/**
 * Get cases by tag
 */
export function getCasesByTag(tag: string): CaseLawReference[] {
  return LANDMARK_CASES.filter(c =>
    c.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  )
}

/**
 * Get all available tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>()
  for (const caseRef of LANDMARK_CASES) {
    caseRef.tags.forEach(tag => tags.add(tag))
  }
  return Array.from(tags).sort()
}

/**
 * Format case law search results for display
 */
export function formatCaseLawResultsForDisplay(result: CaseLawSearchResult): string {
  const lines: string[] = []

  lines.push(`# Case Law Search Results`)
  lines.push(`Query: "${result.query}"`)
  lines.push(``)
  lines.push(result.summary)
  lines.push(``)

  if (result.cases.length > 0) {
    lines.push(`## Results`)
    lines.push(``)

    for (const caseRef of result.cases) {
      lines.push(`### ${caseRef.caseName}`)
      lines.push(`**Citation:** ${caseRef.citation}`)
      lines.push(`**Year:** ${caseRef.year}`)
      lines.push(`**Court:** ${caseRef.court}`)
      lines.push(`**Summary:** ${caseRef.summary}`)
      lines.push(`**Relevant Sections:** ${caseRef.relevantSections.join(', ')}`)
      lines.push(`**Tags:** ${caseRef.tags.join(', ')}`)
      lines.push(`**URL:** [View on Indian Kanoon](${caseRef.url})`)
      lines.push(``)
    }
  }

  return lines.join('\n')
}

/**
 * Verify citation in text
 */
export function verifyCitation(citation: string): CaseLawReference | null {
  const normalizedCitation = citation.trim().toUpperCase()

  for (const caseRef of LANDMARK_CASES) {
    if (caseRef.citation.toUpperCase() === normalizedCitation) {
      return caseRef
    }
  }

  return null
}

/**
 * Get case law statistics
 */
export function getCaseLawStats(): {
  totalCases: number
  courts: string[]
  yearsSpanned: { from: number; to: number }
  tags: string[]
} {
  const courts = new Set<string>()
  const tags = new Set<string>()
  let minYear = Infinity
  let maxYear = -Infinity

  for (const caseRef of LANDMARK_CASES) {
    courts.add(caseRef.court)
    caseRef.tags.forEach(tag => tags.add(tag))
    minYear = Math.min(minYear, caseRef.year)
    maxYear = Math.max(maxYear, caseRef.year)
  }

  return {
    totalCases: LANDMARK_CASES.length,
    courts: Array.from(courts).sort(),
    yearsSpanned: { from: minYear, to: maxYear },
    tags: Array.from(tags).sort()
  }
}
