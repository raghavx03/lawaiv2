# LAW.AI - Quick Wins Implementation Guide

**Date**: February 20, 2026  
**Focus**: High-impact, low-effort improvements  
**Estimated Time**: 10-12 hours total  
**Expected Score Improvement**: 5.0/5 → 5.2/5  

---

## Quick Win 1: Response Caching System (2 hours)

### Problem
Every identical query generates new embeddings and AI responses, wasting compute resources.

### Solution
Implement a simple in-memory cache with TTL for:
- Embeddings (24-hour TTL)
- AI responses (12-hour TTL)
- Case law search results (24-hour TTL)
- Risk scores (7-day TTL)

### Implementation

**File**: `src/lib/cache.ts` (NEW)
```typescript
// Simple in-memory cache with TTL
interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class Cache<T> {
  private store = new Map<string, CacheEntry<T>>()
  
  set(key: string, value: T, ttlMs: number = 3600000) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    })
  }
  
  get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    
    return entry.value
  }
  
  clear() {
    this.store.clear()
  }
}

// Export singleton instances
export const embeddingCache = new Cache<number[]>()
export const responseCache = new Cache<string>()
export const searchCache = new Cache<any[]>()
export const riskCache = new Cache<any>()
```

**Modify**: `src/lib/embeddings.ts`
```typescript
// Add caching to embedding generation
export async function generateEmbedding(text: string): Promise<number[]> {
  const cacheKey = `embedding:${hashText(text)}`
  
  // Check cache first
  const cached = embeddingCache.get(cacheKey)
  if (cached) {
    console.log('Cache hit for embedding')
    return cached
  }
  
  // Generate new embedding
  const embedding = await generateEmbeddingFromAPI(text)
  
  // Store in cache (24 hours)
  embeddingCache.set(cacheKey, embedding, 24 * 3600 * 1000)
  
  return embedding
}

function hashText(text: string): string {
  // Simple hash function
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}
```

**Modify**: `src/app/api/ai-assistant/route.ts`
```typescript
// Add response caching
const cacheKey = `response:${hashQuery(userPrompt)}:${caseId || 'none'}`

// Check cache first
const cached = responseCache.get(cacheKey)
if (cached) {
  console.log('Cache hit for AI response')
  return NextResponse.json({
    response: cached,
    message: cached,
    success: true,
    cached: true
  })
}

// Generate response...
const response = aiResponse.content

// Store in cache (12 hours)
responseCache.set(cacheKey, response, 12 * 3600 * 1000)
```

### Expected Impact
- 30-40% faster responses for repeated queries
- Reduced API calls to NVIDIA
- Lower latency for common questions

---

## Quick Win 2: Improve Error Messages (1 hour)

### Problem
Generic error messages don't help users understand what went wrong.

### Solution
Create helpful error messages with suggestions.

**File**: `src/lib/error-handler.ts` (NEW)
```typescript
export interface ErrorResponse {
  error: string
  code: string
  suggestion?: string
  nextSteps?: string[]
}

export function createErrorResponse(error: any): ErrorResponse {
  if (error.message.includes('NVIDIA')) {
    return {
      error: 'AI service temporarily unavailable',
      code: 'AI_SERVICE_ERROR',
      suggestion: 'Please try again in a few moments',
      nextSteps: [
        'Refresh the page',
        'Try a simpler query',
        'Check your internet connection'
      ]
    }
  }
  
  if (error.message.includes('Unauthorized')) {
    return {
      error: 'Authentication required',
      code: 'AUTH_ERROR',
      suggestion: 'Please log in to continue',
      nextSteps: [
        'Click "Sign In" button',
        'Enter your credentials',
        'Try again'
      ]
    }
  }
  
  if (error.message.includes('timeout')) {
    return {
      error: 'Request took too long',
      code: 'TIMEOUT_ERROR',
      suggestion: 'Try with a shorter query',
      nextSteps: [
        'Simplify your question',
        'Break it into smaller parts',
        'Try again'
      ]
    }
  }
  
  return {
    error: 'Something went wrong',
    code: 'UNKNOWN_ERROR',
    suggestion: 'Please try again',
    nextSteps: [
      'Refresh the page',
      'Contact support if problem persists'
    ]
  }
}
```

**Modify**: All API routes
```typescript
catch (error: any) {
  const errorResponse = createErrorResponse(error)
  return NextResponse.json(errorResponse, { status: 500 })
}
```

### Expected Impact
- Better user experience
- Fewer support tickets
- Clearer debugging information

---

## Quick Win 3: Add Comprehensive Logging (2 hours)

### Problem
Limited logging makes debugging difficult.

### Solution
Add structured logging to all API calls.

**File**: `src/lib/logger.ts` (NEW)
```typescript
interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  service: string
  message: string
  data?: any
  duration?: number
}

class Logger {
  private logs: LogEntry[] = []
  
  log(level: string, service: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level as any,
      service,
      message,
      data
    }
    
    this.logs.push(entry)
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}] ${service}: ${message}`, data || '')
    }
  }
  
  info(service: string, message: string, data?: any) {
    this.log('info', service, message, data)
  }
  
  warn(service: string, message: string, data?: any) {
    this.log('warn', service, message, data)
  }
  
  error(service: string, message: string, data?: any) {
    this.log('error', service, message, data)
  }
  
  debug(service: string, message: string, data?: any) {
    this.log('debug', service, message, data)
  }
  
  getLogs(limit: number = 100) {
    return this.logs.slice(-limit)
  }
}

export const logger = new Logger()
```

**Modify**: `src/app/api/ai-assistant/route.ts`
```typescript
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    logger.info('ai-assistant', 'Request received', { userId: user?.id })
    
    // ... process request ...
    
    const duration = Date.now() - startTime
    logger.info('ai-assistant', 'Response sent', { 
      userId: user?.id, 
      duration,
      responseLength: response.length 
    })
    
    return NextResponse.json({ response })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('ai-assistant', 'Request failed', { 
      error: error.message,
      duration,
      userId: user?.id
    })
    
    throw error
  }
}
```

### Expected Impact
- Easier debugging
- Performance monitoring
- Better error tracking

---

## Quick Win 4: Optimize Database Queries (3 hours)

### Problem
Inefficient queries cause slow page loads.

### Solution
Add indexes and optimize common queries.

**File**: `prisma/migrations/add_indexes.sql` (NEW)
```sql
-- Add indexes for common queries
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_case_id ON chat_sessions(case_id);
CREATE INDEX idx_document_embeddings_document_id ON document_embeddings(document_id);
CREATE INDEX idx_document_embeddings_created_at ON document_embeddings(created_at DESC);
CREATE INDEX idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);

-- Add composite indexes for common filters
CREATE INDEX idx_chat_messages_session_role ON chat_messages(session_id, role);
CREATE INDEX idx_cases_user_status ON cases(user_id, status);
```

**Modify**: `src/app/api/ai-assistant/route.ts`
```typescript
// Optimize case data fetching
const caseData = await safeDbOperation(async () => {
  const { prisma } = await import('@/lib/prisma')
  if (!prisma) return null
  
  // Use select to only fetch needed fields
  const caseRecord = await prisma.case.findFirst({
    where: { id: caseId, userId: user.id },
    select: {
      id: true,
      title: true,
      cnrNumber: true,
      caseType: true,
      court: true,
      judge: true,
      status: true,
      stage: true,
      nextHearing: true,
      petitioner: true,
      respondent: true,
      aiSummary: true
    }
  })
  
  return caseRecord
}, null)
```

### Expected Impact
- 40-50% faster database queries
- Reduced database load
- Better scalability

---

## Quick Win 5: Improve Type Safety (4 hours)

### Problem
Some any types cause runtime errors.

### Solution
Replace any types with proper interfaces.

**File**: `src/lib/types.ts` (NEW)
```typescript
// API Request/Response types
export interface AIAssistantRequest {
  prompt: string
  message?: string
  caseId?: string
  history?: Array<{ role: 'user' | 'assistant', content: string }>
}

export interface AIAssistantResponse {
  response: string
  message: string
  success: boolean
  caseId?: string
  sessionId?: string
  messageId?: string
  error?: string
}

export interface DocumentSearchRequest {
  query: string
  topK?: number
  threshold?: number
  caseId?: string
}

export interface DocumentSearchResponse {
  success: boolean
  query: string
  resultsFound: number
  sources: string[]
  context: string
  chunks: Array<{
    id: string
    documentId: string
    content: string
    chunkIndex: number
    metadata?: any
  }>
}

export interface RiskScoreRequest {
  text: string
  type: 'case' | 'contract'
}

export interface RiskScoreResponse {
  overallScore: number
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  factors: Array<{
    category: string
    factor: string
    severity: string
    description: string
    recommendation: string
  }>
  summary: string
  recommendations: string[]
}
```

**Modify**: All API routes
```typescript
import { AIAssistantRequest, AIAssistantResponse } from '@/lib/types'

export async function POST(request: NextRequest): Promise<NextResponse<AIAssistantResponse>> {
  try {
    const body: AIAssistantRequest = await request.json()
    
    // Type-safe access
    const { prompt, caseId, history } = body
    
    // ... process ...
    
    const response: AIAssistantResponse = {
      response: aiResponse,
      message: aiResponse,
      success: true,
      caseId
    }
    
    return NextResponse.json(response)
  } catch (error) {
    const response: AIAssistantResponse = {
      response: 'Error',
      message: 'Error',
      success: false,
      error: error.message
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
```

### Expected Impact
- Fewer runtime errors
- Better IDE autocomplete
- Easier maintenance

---

## Quick Win 6: Add Input Validation (2 hours)

### Problem
Insufficient input validation allows invalid data.

### Solution
Add comprehensive validation to all API endpoints.

**File**: `src/lib/validators.ts` (NEW)
```typescript
export function validatePrompt(prompt: any): string {
  if (typeof prompt !== 'string') {
    throw new Error('Prompt must be a string')
  }
  
  if (prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty')
  }
  
  if (prompt.length > 5000) {
    throw new Error('Prompt too long (max 5000 characters)')
  }
  
  return prompt.trim()
}

export function validateCaseId(caseId: any): string | null {
  if (caseId === null || caseId === undefined) {
    return null
  }
  
  if (typeof caseId !== 'string') {
    throw new Error('Case ID must be a string')
  }
  
  if (caseId.length === 0) {
    return null
  }
  
  return caseId
}

export function validateQuery(query: any): string {
  if (typeof query !== 'string') {
    throw new Error('Query must be a string')
  }
  
  if (query.trim().length === 0) {
    throw new Error('Query cannot be empty')
  }
  
  if (query.length > 1000) {
    throw new Error('Query too long (max 1000 characters)')
  }
  
  return query.trim()
}

export function validateFile(file: any): File {
  if (!(file instanceof File)) {
    throw new Error('Invalid file')
  }
  
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    throw new Error('File too large (max 50MB)')
  }
  
  const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  
  return file
}
```

**Modify**: All API routes
```typescript
import { validatePrompt, validateCaseId, validateQuery } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate inputs
    const prompt = validatePrompt(body.prompt)
    const caseId = validateCaseId(body.caseId)
    
    // ... process ...
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
```

### Expected Impact
- Better security
- Fewer invalid requests
- Clearer error messages

---

## Quick Win 7: Enhance Rate Limiting (2 hours)

### Problem
Basic IP-based rate limiting is insufficient.

### Solution
Add user-based and per-endpoint rate limiting.

**File**: `src/lib/rate-limiter.ts` (ENHANCE)
```typescript
interface RateLimitConfig {
  windowMs: number // Time window in ms
  maxRequests: number // Max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'ai-assistant': { windowMs: 60000, maxRequests: 10 }, // 10 per minute
  'documents-search': { windowMs: 60000, maxRequests: 20 },
  'uploads': { windowMs: 3600000, maxRequests: 50 }, // 50 per hour
  'case-law-search': { windowMs: 60000, maxRequests: 30 }
}

class RateLimiter {
  private requests = new Map<string, number[]>()
  
  isAllowed(key: string, endpoint: string): boolean {
    const config = RATE_LIMITS[endpoint]
    if (!config) return true
    
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Get requests in current window
    let requests = this.requests.get(key) || []
    requests = requests.filter(t => t > windowStart)
    
    if (requests.length >= config.maxRequests) {
      return false
    }
    
    requests.push(now)
    this.requests.set(key, requests)
    
    return true
  }
  
  getRemainingRequests(key: string, endpoint: string): number {
    const config = RATE_LIMITS[endpoint]
    if (!config) return -1
    
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    const requests = (this.requests.get(key) || []).filter(t => t > windowStart)
    return Math.max(0, config.maxRequests - requests.length)
  }
}

export const rateLimiter = new RateLimiter()
```

**Modify**: All API routes
```typescript
import { rateLimiter } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  const userId = user?.id || getClientIP(request)
  
  if (!rateLimiter.isAllowed(userId, 'ai-assistant')) {
    const remaining = rateLimiter.getRemainingRequests(userId, 'ai-assistant')
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString()
        }
      }
    )
  }
  
  // ... process request ...
}
```

### Expected Impact
- Better protection against abuse
- Fairer resource allocation
- Improved system stability

---

## Implementation Checklist

### Phase 1: Caching (2 hours)
- [ ] Create `src/lib/cache.ts`
- [ ] Modify `src/lib/embeddings.ts`
- [ ] Modify `src/app/api/ai-assistant/route.ts`
- [ ] Test caching functionality
- [ ] Measure performance improvement

### Phase 2: Error Handling (1 hour)
- [ ] Create `src/lib/error-handler.ts`
- [ ] Update all API routes
- [ ] Test error messages
- [ ] Verify user experience

### Phase 3: Logging (2 hours)
- [ ] Create `src/lib/logger.ts`
- [ ] Add logging to all API routes
- [ ] Create logging dashboard (optional)
- [ ] Test logging functionality

### Phase 4: Database Optimization (3 hours)
- [ ] Create migration file
- [ ] Run migrations
- [ ] Optimize queries
- [ ] Measure query performance
- [ ] Verify no regressions

### Phase 5: Type Safety (4 hours)
- [ ] Create `src/lib/types.ts`
- [ ] Update all API routes
- [ ] Update all services
- [ ] Run TypeScript compiler
- [ ] Fix any type errors

### Phase 6: Input Validation (2 hours)
- [ ] Create `src/lib/validators.ts`
- [ ] Add validation to all API routes
- [ ] Test validation
- [ ] Verify error messages

### Phase 7: Rate Limiting (2 hours)
- [ ] Enhance `src/lib/rate-limiter.ts`
- [ ] Add rate limiting to all API routes
- [ ] Test rate limiting
- [ ] Verify headers

---

## Testing Strategy

### Unit Tests
- Test cache hit/miss
- Test validators
- Test rate limiter
- Test error handler

### Integration Tests
- Test API with caching
- Test API with validation
- Test API with rate limiting
- Test error handling

### Performance Tests
- Measure response time improvement
- Measure database query improvement
- Measure cache hit rate
- Measure error rate reduction

---

## Deployment Strategy

1. **Create feature branch**: `git checkout -b quick-wins`
2. **Implement changes**: Follow checklist above
3. **Run tests**: `npm run test`
4. **Build**: `npm run build`
5. **Deploy to staging**: Test in staging environment
6. **Deploy to production**: Roll out gradually
7. **Monitor metrics**: Track improvements

---

## Success Metrics

After implementation, measure:
- Response time: Target <2s for 95% of requests
- Cache hit rate: Target >40%
- Error rate: Target <0.5%
- Rate limit violations: Target <1%
- Type errors: Target 0
- Validation failures: Target <2%

---

## Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Caching | 2h | Ready |
| Error Handling | 1h | Ready |
| Logging | 2h | Ready |
| DB Optimization | 3h | Ready |
| Type Safety | 4h | Ready |
| Input Validation | 2h | Ready |
| Rate Limiting | 2h | Ready |
| **Total** | **16h** | **Ready** |

---

**Status**: Ready for implementation  
**Expected Score**: 5.0/5 → 5.2/5  
**Effort**: 16 hours  

