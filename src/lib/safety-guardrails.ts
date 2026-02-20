// Safety Guardrails for LAW.AI
// Prevents illegal requests and dangerous use cases
// CRITICAL: Must be called before every AI response

export interface SafetyCheckResult {
  isSafe: boolean
  reason?: string
  violationType?: string
  suggestion?: string
}

// Patterns that indicate illegal or dangerous requests
const ILLEGAL_PATTERNS = [
  // Evidence tampering
  'hide evidence',
  'destroy evidence',
  'destroy documents',
  'tamper with evidence',
  'dispose of evidence',
  'get rid of evidence',
  'remove evidence',
  
  // Witness fabrication
  'fabricate witness',
  'fake witness',
  'create false witness',
  'make up witness',
  'invent witness',
  'false affidavit',
  'fake affidavit',
  
  // Court manipulation
  'manipulate court',
  'bribe judge',
  'bribe magistrate',
  'influence judge',
  'influence court',
  'manipulate proceedings',
  'tamper with court',
  'corrupt judge',
  
  // Fraud and forgery
  'forge document',
  'forge signature',
  'fake signature',
  'create fake document',
  'fabricate document',
  'counterfeit',
  'fraud',
  'cheating',
  
  // Perjury
  'perjury',
  'false oath',
  'lie in court',
  'false statement in court',
  'commit perjury',
  
  // Unauthorized practice
  'practice law without license',
  'unauthorized legal practice',
  'impersonate lawyer',
  'pretend to be lawyer',
  'fake lawyer',
  
  // Conflict of interest
  'represent both sides',
  'dual representation',
  'conflict of interest',
  'represent opposing parties',
  
  // Blackmail and extortion
  'blackmail',
  'extortion',
  'threaten',
  'coerce',
  'intimidate',
  
  // Money laundering
  'money laundering',
  'hide money',
  'black money',
  'cash transaction',
  
  // Illegal activities
  'help with crime',
  'assist in crime',
  'help commit crime',
  'illegal activity',
  'criminal activity'
]

// Patterns that suggest the user is asking for help with illegal activity
const ILLEGAL_INTENT_PATTERNS = [
  'how to hide',
  'how to destroy',
  'how to forge',
  'how to fake',
  'how to fabricate',
  'how to manipulate',
  'how to bribe',
  'how to commit',
  'how to get away with',
  'how to avoid',
  'how to escape',
  'help me hide',
  'help me destroy',
  'help me forge',
  'help me fake',
  'help me fabricate',
  'help me manipulate',
  'help me bribe',
  'help me commit',
  'help me get away',
  'help me avoid',
  'help me escape',
  'can i hide',
  'can i destroy',
  'can i forge',
  'can i fake',
  'can i fabricate',
  'can i manipulate',
  'can i bribe',
  'can i commit',
  'can i get away',
  'can i avoid',
  'can i escape'
]

// Violation types for logging
export enum ViolationType {
  EVIDENCE_TAMPERING = 'evidence_tampering',
  WITNESS_FABRICATION = 'witness_fabrication',
  COURT_MANIPULATION = 'court_manipulation',
  FRAUD_FORGERY = 'fraud_forgery',
  PERJURY = 'perjury',
  UNAUTHORIZED_PRACTICE = 'unauthorized_practice',
  CONFLICT_OF_INTEREST = 'conflict_of_interest',
  BLACKMAIL_EXTORTION = 'blackmail_extortion',
  MONEY_LAUNDERING = 'money_laundering',
  ILLEGAL_ACTIVITY = 'illegal_activity'
}

// Check if a prompt contains illegal patterns
export function checkSafety(prompt: string): SafetyCheckResult {
  const lowerPrompt = prompt.toLowerCase()
  
  // Check for direct illegal patterns
  for (const pattern of ILLEGAL_PATTERNS) {
    if (lowerPrompt.includes(pattern)) {
      return {
        isSafe: false,
        reason: `Request contains reference to: "${pattern}"`,
        violationType: classifyViolation(pattern),
        suggestion: 'I cannot assist with that. However, I can explain the legal consequences of this action under Indian law.'
      }
    }
  }
  
  // Check for intent patterns (how to, help me, can i)
  for (const pattern of ILLEGAL_INTENT_PATTERNS) {
    if (lowerPrompt.includes(pattern)) {
      // Check if it's combined with an illegal activity
      for (const illegal of ILLEGAL_PATTERNS) {
        if (lowerPrompt.includes(illegal)) {
          return {
            isSafe: false,
            reason: `Request appears to seek assistance with: "${illegal}"`,
            violationType: classifyViolation(illegal),
            suggestion: 'I cannot assist with that. However, I can explain the legal consequences of this action under Indian law.'
          }
        }
      }
    }
  }
  
  // Check for conflict of interest patterns
  const conflictPatterns = [
    'represent both',
    'both sides',
    'opposing parties',
    'conflicting interests'
  ]
  
  for (const pattern of conflictPatterns) {
    if (lowerPrompt.includes(pattern)) {
      return {
        isSafe: false,
        reason: 'Request may involve conflict of interest',
        violationType: ViolationType.CONFLICT_OF_INTEREST,
        suggestion: 'I cannot assist with representing conflicting interests. This violates professional ethics under the Bar Council of India rules.'
      }
    }
  }
  
  // If we reach here, the request is safe
  return { isSafe: true }
}

// Classify the type of violation
function classifyViolation(pattern: string): ViolationType {
  const lowerPattern = pattern.toLowerCase()
  
  if (lowerPattern.includes('evidence') || lowerPattern.includes('destroy')) {
    return ViolationType.EVIDENCE_TAMPERING
  }
  if (lowerPattern.includes('witness') || lowerPattern.includes('affidavit')) {
    return ViolationType.WITNESS_FABRICATION
  }
  if (lowerPattern.includes('court') || lowerPattern.includes('judge') || lowerPattern.includes('bribe')) {
    return ViolationType.COURT_MANIPULATION
  }
  if (lowerPattern.includes('forge') || lowerPattern.includes('fake') || lowerPattern.includes('fraud')) {
    return ViolationType.FRAUD_FORGERY
  }
  if (lowerPattern.includes('perjury') || lowerPattern.includes('false oath')) {
    return ViolationType.PERJURY
  }
  if (lowerPattern.includes('unauthorized') || lowerPattern.includes('license')) {
    return ViolationType.UNAUTHORIZED_PRACTICE
  }
  if (lowerPattern.includes('conflict') || lowerPattern.includes('both sides')) {
    return ViolationType.CONFLICT_OF_INTEREST
  }
  if (lowerPattern.includes('blackmail') || lowerPattern.includes('extortion')) {
    return ViolationType.BLACKMAIL_EXTORTION
  }
  if (lowerPattern.includes('money') || lowerPattern.includes('laundering')) {
    return ViolationType.MONEY_LAUNDERING
  }
  
  return ViolationType.ILLEGAL_ACTIVITY
}

// Generate a helpful refusal message
export function generateRefusalMessage(violationType: ViolationType): string {
  const messages: Record<ViolationType, string> = {
    [ViolationType.EVIDENCE_TAMPERING]: `I cannot assist with evidence tampering or destruction. Under the Indian Penal Code (Section 201-229), tampering with evidence is a serious criminal offense.

However, I can explain:
- Your legal rights if evidence is being destroyed
- How to report evidence tampering to authorities
- Procedures for evidence preservation in court`,
    
    [ViolationType.WITNESS_FABRICATION]: `I cannot assist with fabricating witnesses or false affidavits. Under the Indian Penal Code (Section 191-229), perjury and false evidence are serious criminal offenses.

However, I can explain:
- How to find legitimate witnesses
- Proper procedures for witness examination
- Consequences of perjury under Indian law`,
    
    [ViolationType.COURT_MANIPULATION]: `I cannot assist with court manipulation, bribery, or judicial corruption. These are serious criminal offenses under the Indian Penal Code (Sections 120A, 120B, 201-229).

However, I can explain:
- Legitimate ways to present your case
- Proper court procedures
- How to file complaints about judicial misconduct`,
    
    [ViolationType.FRAUD_FORGERY]: `I cannot assist with document forgery or fraud. Under the Indian Penal Code (Sections 463-477), forgery and fraud are serious criminal offenses.

However, I can explain:
- How to create legitimate legal documents
- Proper document execution procedures
- Consequences of forgery under Indian law`,
    
    [ViolationType.PERJURY]: `I cannot assist with perjury or false statements in court. Under the Indian Penal Code (Sections 191-229), perjury is a serious criminal offense.

However, I can explain:
- Your obligation to tell the truth in court
- Consequences of perjury
- How to challenge false testimony`,
    
    [ViolationType.UNAUTHORIZED_PRACTICE]: `I cannot assist with unauthorized legal practice. Only qualified advocates can practice law in India under the Advocates Act, 1961.

However, I can explain:
- How to find a qualified advocate
- What constitutes unauthorized practice
- Consequences of unauthorized legal practice`,
    
    [ViolationType.CONFLICT_OF_INTEREST]: `I cannot assist with representing conflicting interests. Under the Bar Council of India rules, advocates cannot represent opposing parties.

However, I can explain:
- What constitutes a conflict of interest
- How to identify conflicts
- Proper procedures for handling conflicts`,
    
    [ViolationType.BLACKMAIL_EXTORTION]: `I cannot assist with blackmail or extortion. Under the Indian Penal Code (Sections 383-389), these are serious criminal offenses.

However, I can explain:
- Your legal remedies if you're being blackmailed
- How to report extortion to authorities
- Procedures for protection orders`,
    
    [ViolationType.MONEY_LAUNDERING]: `I cannot assist with money laundering or financial crimes. Under the Prevention of Money Laundering Act (PMLA), 2002, these are serious offenses.

However, I can explain:
- Legitimate financial procedures
- Your obligations under anti-money laundering laws
- How to report suspicious transactions`,
    
    [ViolationType.ILLEGAL_ACTIVITY]: `I cannot assist with illegal activities. 

However, I can explain:
- The legal consequences of the activity you're asking about
- Legitimate alternatives
- How to seek legal protection`
  }
  
  return messages[violationType] || messages[ViolationType.ILLEGAL_ACTIVITY]
}

// Log safety violations for audit trail
export async function logSafetyViolation(
  userId: string | null,
  prompt: string,
  violationType: ViolationType
): Promise<void> {
  try {
    // Log to console for now (can be extended to database)
    console.warn(`[SAFETY VIOLATION] User: ${userId || 'anonymous'}, Type: ${violationType}, Prompt: ${prompt.substring(0, 100)}...`)
    
    // TODO: Store in database for audit trail
    // await db.safetyViolations.create({
    //   userId,
    //   prompt,
    //   violationType,
    //   timestamp: new Date()
    // })
  } catch (error) {
    console.error('Failed to log safety violation:', error)
  }
}
