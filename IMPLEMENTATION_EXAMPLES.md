# LAW.AI - Implementation Examples

**Date**: February 20, 2026  
**Focus**: Ready-to-use code snippets for quick wins  
**Time to Implement**: 2-3 hours  

---

## Example 1: Response Caching (30 minutes)

### Create Cache Service

**File**: `src/lib/cache.ts`

```typescript
/**
 * Simple in-memory cache with TTL
 * Used for embeddings, AI responses, and search results
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class Cache<T> {
  private store = new Map<string, CacheEntry<T>>()
  private stats = { hits: 0, misses: 0 }

  /**
   * Set a value in cache with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttlMs Time to live in milliseconds (default: 1 hour)
   */
  set(key: string, value: T, ttlMs: number = 3600000): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    })
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or null if expired/not found
   */
  get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return entry.value
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Delete a specific key
   */
  delete(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.store.clear()
    this.stats = { hits: 0, misses: 0 }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : '0'
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate}%`,
      size: this.store.size
    }
  }
}

// Export singleton instances with different TTLs
export const embeddingCache = new Cache<number[]>()
export const responseCache = new Cache<string>()
export const searchCache = new Cache<any[]>()
export const riskCache = new Cache<any>()

// Helper function to create cache keys
export function createCacheKey(...parts: string[]): string {
  return parts.join(':')
}

// Helper function to hash text for cache keys
export function hashText(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}
```

### Use Cache in Embeddings

**Modify**: `src/lib/embeddings.ts`

```typescript
import { embeddingCache, createCacheKey, hashText } from './cache'

/**
 * Generate embedding for text with caching
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Create cache key from text hash
  const cacheKey = createCacheKey('embedding', hashText(text))

  // Check cache first
  const cached = embeddingCache.get(cacheKey)
  if (cached) {
    console.log('✓ Cache hit for embedding')
    return cached
  }

  console.log('⟳ Generating new embedding...')

  // Generate new embedding
  const embedding = await generateEmbeddingFromAPI(text)

  // Store in cache (24 hours)
  embeddingCache.set(cacheKey, embedding, 24 * 3600 * 1000)

  return embedding
}

/**
 * Generate embeddings for multiple texts with caching
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = []

  for (const text of texts) {
    const embedding = await generateEmbedding(text)
    results.push(embedding)
  }

  return results
}
```

### Use Cache in AI Assistant

**Modify**: `src/app/api/ai-assistant/route.ts`

```typescript
import { responseCache, createCacheKey, hashText } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, caseId } = body
    const userPrompt = prompt?.trim()

    if (!userPrompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Create cache key from prompt and case
    const cacheKey = createCacheKey(
      'response',
      hashText(userPrompt),
      caseId || 'none'
    )

    // Check cache first
    const cached = responseCache.get(cacheKey)
    if (cached) {
      console.log('✓ Cache hit for AI response')
      return NextResponse.json({
        response: cached,
        message: cached,
        success: true,
        cached: true,
        caseId
      })
    }

    console.log('⟳ Generating new AI response...')

    // ... rest of the code to generate response ...

    const response = aiResponse.content

    // Store in cache (12 hours)
    responseCache.set(cacheKey, response, 12 * 3600 * 1000)

    return NextResponse.json({
      response,
      message: response,
      success: true,
      cached: false,
      caseId
    })
  } catch (error: any) {
    console.error('AI Assistant error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
```

---

## Example 2: Better Error Handling (20 minutes)

### Create Error Handler

**File**: `src/lib/error-handler.ts`

```typescript
/**
 * Centralized error handling for all API routes
 */

export interface ErrorResponse {
  error: string
  code: string
  suggestion?: string
  nextSteps?: string[]
  details?: any
}

export enum ErrorCode {
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Create standardized error response
 */
export function createErrorResponse(error: any): ErrorResponse {
  const message = error?.message || String(error)

  // AI Service Errors
  if (message.includes('NVIDIA') || message.includes('API')) {
    return {
      error: 'AI service temporarily unavailable',
      code: ErrorCode.AI_SERVICE_ERROR,
      suggestion: 'Please try again in a few moments',
      nextSteps: [
        'Refresh the page',
        'Try a simpler query',
        'Check your internet connection'
      ]
    }
  }

  // Authentication Errors
  if (message.includes('Unauthorized') || message.includes('401')) {
    return {
      error: 'Authentication required',
      code: ErrorCode.AUTH_ERROR,
      suggestion: 'Please log in to continue',
      nextSteps: [
        'Click "Sign In" button',
        'Enter your credentials',
        'Try again'
      ]
    }
  }

  // Timeout Errors
  if (message.includes('timeout') || message.includes('TIMEOUT')) {
    return {
      error: 'Request took too long',
      code: ErrorCode.TIMEOUT_ERROR,
      suggestion: 'Try with a shorter or simpler query',
      nextSteps: [
        'Simplify your question',
        'Break it into smaller parts',
        'Try again'
      ]
    }
  }

  // Validation Errors
  if (message.includes('required') || message.includes('invalid')) {
    return {
      error: 'Invalid input',
      code: ErrorCode.VALIDATION_ERROR,
      suggestion: 'Please check your input and try again',
      nextSteps: [
        'Review the error message',
        'Correct the input',
        'Try again'
      ]
    }
  }

  // Database Errors
  if (message.includes('database') || message.includes('prisma')) {
    return {
      error: 'Database error',
      code: ErrorCode.DATABASE_ERROR,
      suggestion: 'Please try again later',
      nextSteps: [
        'Wait a moment',
        'Refresh the page',
        'Contact support if problem persists'
      ]
    }
  }

  // Rate Limit Errors
  if (message.includes('rate') || message.includes('429')) {
    return {
      error: 'Too many requests',
      code: ErrorCode.RATE_LIMIT,
      suggestion: 'Please wait before trying again',
      nextSteps: [
        'Wait a few minutes',
        'Try again',
        'Contact support for higher limits'
      ]
    }
  }

  // Unknown Errors
  return {
    error: 'Something went wrong',
    code: ErrorCode.UNKNOWN_ERROR,
    suggestion: 'Please try again',
    nextSteps: [
      'Refresh the page',
      'Try a different action',
      'Contact support if problem persists'
    ],
    details: process.env.NODE_ENV === 'development' ? message : undefined
  }
}

/**
 * Get HTTP status code for error
 */
export function getStatusCode(errorCode: ErrorCode): number {
  const statusMap: Record<ErrorCode, number> = {
    [ErrorCode.AI_SERVICE_ERROR]: 503,
    [ErrorCode.AUTH_ERROR]: 401,
    [ErrorCode.TIMEOUT_ERROR]: 504,
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.RATE_LIMIT]: 429,
    [ErrorCode.DATABASE_ERROR]: 500,
    [ErrorCode.UNKNOWN_ERROR]: 500
  }
  return statusMap[errorCode] || 500
}
```

### Use Error Handler in API Routes

**Modify**: `src/app/api/ai-assistant/route.ts`

```typescript
import { createErrorResponse, getStatusCode } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      const errorResponse = createErrorResponse(new Error('Unauthorized'))
      return NextResponse.json(
        errorResponse,
        { status: getStatusCode(errorResponse.code as any) }
      )
    }

    // ... process request ...

    return NextResponse.json({
      response,
      message: response,
      success: true
    })
  } catch (error: any) {
    console.error('AI Assistant error:', error)

    const errorResponse = createErrorResponse(error)
    const statusCode = getStatusCode(errorResponse.code as any)

    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
```

---

## Example 3: Comprehensive Logging (20 minutes)

### Create Logger

**File**: `src/lib/logger.ts`

```typescript
/**
 * Structured logging service for all API calls
 */

export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  service: string
  message: string
  data?: any
  duration?: number
  userId?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  /**
   * Log a message
   */
  private log(
    level: string,
    service: string,
    message: string,
    data?: any,
    userId?: string,
    duration?: number
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level as any,
      service,
      message,
      data,
      userId,
      duration
    }

    this.logs.push(entry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${level.toUpperCase()}] ${service}`
      const durationStr = duration ? ` (${duration}ms)` : ''
      console.log(`${prefix}: ${message}${durationStr}`, data || '')
    }
  }

  /**
   * Log info level
   */
  info(service: string, message: string, data?: any, userId?: string) {
    this.log('info', service, message, data, userId)
  }

  /**
   * Log warning level
   */
  warn(service: string, message: string, data?: any, userId?: string) {
    this.log('warn', service, message, data, userId)
  }

  /**
   * Log error level
   */
  error(service: string, message: string, data?: any, userId?: string) {
    this.log('error', service, message, data, userId)
  }

  /**
   * Log debug level
   */
  debug(service: string, message: string, data?: any, userId?: string) {
    this.log('debug', service, message, data, userId)
  }

  /**
   * Log API call with duration
   */
  logApiCall(
    service: string,
    method: string,
    path: string,
    duration: number,
    status: number,
    userId?: string
  ) {
    const level = status >= 400 ? 'warn' : 'info'
    this.log(
      level,
      service,
      `${method} ${path} - ${status}`,
      { method, path, status },
      userId,
      duration
    )
  }

  /**
   * Get recent logs
   */
  getLogs(limit: number = 100, level?: string): LogEntry[] {
    let filtered = this.logs.slice(-limit)
    if (level) {
      filtered = filtered.filter(l => l.level === level)
    }
    return filtered
  }

  /**
   * Get logs for a specific service
   */
  getServiceLogs(service: string, limit: number = 100): LogEntry[] {
    return this.logs
      .filter(l => l.service === service)
      .slice(-limit)
  }

  /**
   * Get logs for a specific user
   */
  getUserLogs(userId: string, limit: number = 100): LogEntry[] {
    return this.logs
      .filter(l => l.userId === userId)
      .slice(-limit)
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = []
  }

  /**
   * Get statistics
   */
  getStats() {
    const errors = this.logs.filter(l => l.level === 'error').length
    const warnings = this.logs.filter(l => l.level === 'warn').length
    const avgDuration = this.logs
      .filter(l => l.duration)
      .reduce((sum, l) => sum + (l.duration || 0), 0) / this.logs.length

    return {
      totalLogs: this.logs.length,
      errors,
      warnings,
      avgDuration: avgDuration.toFixed(2)
    }
  }
}

export const logger = new Logger()
```

### Use Logger in API Routes

**Modify**: `src/app/api/ai-assistant/route.ts`

```typescript
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const method = 'POST'
  const path = '/api/ai-assistant'

  try {
    const user = await getServerUser()
    if (!user) {
      logger.warn('ai-assistant', 'Unauthorized request', {}, undefined)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('ai-assistant', 'Request received', { userId: user.id }, user.id)

    const body = await request.json()
    const { prompt, caseId } = body

    if (!prompt?.trim()) {
      logger.warn('ai-assistant', 'Empty prompt', { userId: user.id }, user.id)
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // ... process request ...

    const response = aiResponse.content
    const duration = Date.now() - startTime

    logger.logApiCall('ai-assistant', method, path, duration, 200, user.id)
    logger.info(
      'ai-assistant',
      'Response sent',
      {
        userId: user.id,
        duration,
        responseLength: response.length,
        caseId
      },
      user.id
    )

    return NextResponse.json({
      response,
      message: response,
      success: true
    })
  } catch (error: any) {
    const duration = Date.now() - startTime

    logger.error(
      'ai-assistant',
      'Request failed',
      {
        error: error.message,
        duration,
        stack: error.stack
      }
    )

    logger.logApiCall('ai-assistant', method, path, duration, 500)

    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
```

---

## Example 4: Input Validation (20 minutes)

### Create Validators

**File**: `src/lib/validators.ts`

```typescript
/**
 * Input validation utilities for all API endpoints
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validate prompt input
 */
export function validatePrompt(prompt: any): string {
  if (typeof prompt !== 'string') {
    throw new ValidationError('Prompt must be a string')
  }

  const trimmed = prompt.trim()

  if (trimmed.length === 0) {
    throw new ValidationError('Prompt cannot be empty')
  }

  if (trimmed.length > 5000) {
    throw new ValidationError('Prompt too long (max 5000 characters)')
  }

  return trimmed
}

/**
 * Validate case ID
 */
export function validateCaseId(caseId: any): string | null {
  if (caseId === null || caseId === undefined) {
    return null
  }

  if (typeof caseId !== 'string') {
    throw new ValidationError('Case ID must be a string')
  }

  const trimmed = caseId.trim()

  if (trimmed.length === 0) {
    return null
  }

  if (trimmed.length > 100) {
    throw new ValidationError('Case ID too long')
  }

  return trimmed
}

/**
 * Validate search query
 */
export function validateQuery(query: any): string {
  if (typeof query !== 'string') {
    throw new ValidationError('Query must be a string')
  }

  const trimmed = query.trim()

  if (trimmed.length === 0) {
    throw new ValidationError('Query cannot be empty')
  }

  if (trimmed.length > 1000) {
    throw new ValidationError('Query too long (max 1000 characters)')
  }

  return trimmed
}

/**
 * Validate topK parameter
 */
export function validateTopK(topK: any): number {
  if (topK === undefined || topK === null) {
    return 5 // default
  }

  const num = Number(topK)

  if (!Number.isInteger(num)) {
    throw new ValidationError('topK must be an integer')
  }

  if (num < 1 || num > 100) {
    throw new ValidationError('topK must be between 1 and 100')
  }

  return num
}

/**
 * Validate threshold parameter
 */
export function validateThreshold(threshold: any): number {
  if (threshold === undefined || threshold === null) {
    return 0.3 // default
  }

  const num = Number(threshold)

  if (isNaN(num)) {
    throw new ValidationError('threshold must be a number')
  }

  if (num < 0 || num > 1) {
    throw new ValidationError('threshold must be between 0 and 1')
  }

  return num
}

/**
 * Validate file upload
 */
export function validateFile(file: any): File {
  if (!(file instanceof File)) {
    throw new ValidationError('Invalid file')
  }

  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    throw new ValidationError('File too large (max 50MB)')
  }

  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(
      `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
    )
  }

  return file
}

/**
 * Validate user ID
 */
export function validateUserId(userId: any): string {
  if (typeof userId !== 'string') {
    throw new ValidationError('User ID must be a string')
  }

  const trimmed = userId.trim()

  if (trimmed.length === 0) {
    throw new ValidationError('User ID cannot be empty')
  }

  return trimmed
}
```

### Use Validators in API Routes

**Modify**: `src/app/api/documents/search/route.ts`

```typescript
import {
  validateQuery,
  validateTopK,
  validateThreshold,
  validateCaseId,
  ValidationError
} from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate inputs
    const query = validateQuery(body.query)
    const topK = validateTopK(body.topK)
    const threshold = validateThreshold(body.threshold)
    const caseId = validateCaseId(body.caseId)

    // ... process request ...

    return NextResponse.json({
      success: true,
      query,
      resultsFound: results.length
    })
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    )
  }
}
```

---

## Implementation Order

1. **Start with Caching** (30 min)
   - Biggest performance impact
   - Easiest to implement
   - Immediate results

2. **Add Error Handling** (20 min)
   - Better user experience
   - Easier debugging
   - Quick to implement

3. **Add Logging** (20 min)
   - Better monitoring
   - Easier troubleshooting
   - Helps with debugging

4. **Add Validation** (20 min)
   - Better security
   - Fewer invalid requests
   - Clearer error messages

---

## Testing the Implementations

### Test Caching
```bash
# First request (cache miss)
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is Section 420 IPC?"}'

# Second request (cache hit) - should be faster
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is Section 420 IPC?"}'
```

### Test Error Handling
```bash
# Missing prompt
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{}'

# Should return helpful error message
```

### Test Logging
```bash
# Check logs in console or database
# Should see structured log entries with timestamps and durations
```

### Test Validation
```bash
# Invalid query
curl -X POST http://localhost:3000/api/documents/search \
  -H "Content-Type: application/json" \
  -d '{"query": ""}'

# Should return validation error
```

---

## Performance Metrics to Track

After implementation, measure:

```typescript
// In logger.ts
export function getPerformanceMetrics() {
  const logs = logger.getLogs(1000)
  
  const apiCalls = logs.filter(l => l.duration)
  const avgDuration = apiCalls.reduce((sum, l) => sum + (l.duration || 0), 0) / apiCalls.length
  const maxDuration = Math.max(...apiCalls.map(l => l.duration || 0))
  const minDuration = Math.min(...apiCalls.map(l => l.duration || 0))
  
  const errors = logs.filter(l => l.level === 'error').length
  const errorRate = (errors / logs.length * 100).toFixed(2)
  
  return {
    avgDuration: avgDuration.toFixed(2),
    maxDuration,
    minDuration,
    errorRate: `${errorRate}%`,
    cacheHitRate: `${embeddingCache.getStats().hitRate}`
  }
}
```

---

**Status**: Ready to implement  
**Time**: 2-3 hours  
**Impact**: 5.0/5 → 5.2/5  

