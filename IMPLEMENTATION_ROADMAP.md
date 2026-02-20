# 🚀 LAW.AI - Production Implementation Roadmap

**Status**: Starting Implementation  
**Timeline**: 2-3 weeks for MVP  
**Priority**: CRITICAL FIXES FIRST

---

## PHASE 1: CRITICAL FIXES (Week 1) 🔴

### 1.1 Safety Guardrails Implementation
**File**: `src/lib/safety-guardrails.ts` (NEW)
**Priority**: CRITICAL - Must implement before any AI response

```typescript
// Safety layer to prevent illegal requests
- Detect illegal request patterns
- Refuse with appropriate message
- Log safety violations
- Track refusal patterns
```

**Illegal Patterns to Detect**:
- Evidence hiding/destruction
- Witness fabrication
- Court manipulation
- Fraud/forgery assistance
- Perjury assistance
- Unauthorized practice
- Conflict of interest

### 1.2 Enhanced AI Service with Safety
**File**: `src/lib/ai-service.ts` (MODIFY)
**Changes**:
- Add safety check before LLM call
- Add refusal patterns to system prompt
- Add conflict detection
- Add unauthorized practice detection

### 1.3 Hindi Chat Support
**File**: `src/lib/ai-service.ts` (MODIFY)
**Changes**:
- Add language detection
- Add Hindi response generation
- Add Hinglish support
- Add language toggle in UI

---

## PHASE 2: RAG/Vector DB (Week 1-2) 🟠

### 2.1 Vector DB Setup
**Options**: Pinecone (easiest) / Weaviate / Qdrant

**Implementation**:
- Set up vector DB account
- Add API keys to `.env.local`
- Create embedding service
- Implement document chunking

### 2.2 Document Embedding Pipeline
**File**: `src/lib/embeddings.ts` (NEW)
**Features**:
- Chunk documents (500 tokens)
- Generate embeddings using NVIDIA nv-embed
- Store in vector DB
- Implement retrieval

### 2.3 RAG Integration
**File**: `src/lib/rag-service.ts` (NEW)
**Features**:
- Search vector DB for relevant documents
- Rerank results
- Inject context into LLM prompt
- Track source documents

---

## PHASE 3: Document Processing (Week 2) 🟡

### 3.1 OCR Integration
**File**: `src/lib/ocr-service.ts` (NEW)
**Library**: tesseract.js (already in package.json)
**Features**:
- Extract text from scanned PDFs
- Handle images
- Preserve formatting
- Extract tables

### 3.2 Clause Extraction
**File**: `src/lib/clause-extractor.ts` (NEW)
**Features**:
- Identify contract clauses
- Extract key terms
- Highlight risky clauses
- Suggest improvements

### 3.3 Document Comparison
**File**: `src/app/api/documents/compare/route.ts` (NEW)
**Features**:
- Compare two documents
- Highlight differences
- Show side-by-side view
- Suggest reconciliation

---

## PHASE 4: Advanced Features (Week 2-3) 🟢

### 4.1 Risk Scoring
**File**: `src/lib/risk-scorer.ts` (NEW)
**Features**:
- Analyze case strength
- Score contract risk
- Identify red flags
- Suggest mitigations

### 4.2 Case Law Database
**File**: `src/lib/case-law-db.ts` (NEW)
**Integration**: Indian Kanoon API
**Features**:
- Verify citations
- Find similar cases
- Track precedents
- Link to full judgments

### 4.3 Conflict Detection
**File**: `src/lib/conflict-detector.ts` (NEW)
**Features**:
- Detect conflicting interests
- Check party relationships
- Warn about dual representation
- Track conflicts

---

## PHASE 5: UI/UX Enhancements (Week 3) 🟢

### 5.1 Language Toggle
**File**: `src/components/ai-assistant/LanguageToggle.tsx` (NEW)
**Features**:
- English / Hindi / Hinglish toggle
- Persist user preference
- Real-time language switching

### 5.2 Tone Mode Toggle
**File**: `src/components/ai-assistant/ToneToggle.tsx` (NEW)
**Features**:
- Advocate Mode (technical)
- Client Friendly (simplified)
- Student Mode (educational)

### 5.3 Document Viewer
**File**: `src/components/documents/DocumentViewer.tsx` (NEW)
**Features**:
- View uploaded documents
- Highlight clauses
- Show risk scores
- Compare documents

---

## IMPLEMENTATION DETAILS

### 1. Safety Guardrails (CRITICAL)

```typescript
// src/lib/safety-guardrails.ts
export const ILLEGAL_PATTERNS = [
  'hide evidence',
  'destroy documents',
  'fabricate witness',
  'manipulate court',
  'forge document',
  'perjury',
  'fraud',
  'bribe',
  'blackmail',
  'unauthorized practice'
]

export function checkSafety(prompt: string): {
  isSafe: boolean
  reason?: string
} {
  // Check for illegal patterns
  // Return safety verdict
}

export const SAFETY_REFUSAL = `
I cannot assist with that request as it may involve illegal activity.

However, I can explain the legal consequences of [action] under Indian law.
`
```

### 2. Hindi Chat Support

```typescript
// src/lib/ai-service.ts - Add language detection
export async function detectLanguage(text: string): Promise<'en' | 'hi' | 'hinglish'> {
  // Detect language using simple heuristics
  // Return language code
}

export async function callAIServiceMultilingual(
  messages: AIMessage[],
  language: 'en' | 'hi' | 'hinglish' = 'en'
): Promise<AIResponse> {
  // Add language instruction to system prompt
  // Generate response in requested language
}
```

### 3. Vector DB Setup (Pinecone Example)

```typescript
// src/lib/vector-db.ts
import { Pinecone } from '@pinecone-database/pinecone'

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
})

export async function embedDocument(
  documentId: string,
  chunks: string[]
): Promise<void> {
  // Generate embeddings using NVIDIA nv-embed
  // Store in Pinecone
}

export async function searchDocuments(
  query: string,
  topK: number = 5
): Promise<DocumentChunk[]> {
  // Search vector DB
  // Return relevant chunks
}
```

### 4. OCR Integration

```typescript
// src/lib/ocr-service.ts
import Tesseract from 'tesseract.js'

export async function extractTextFromImage(
  imageBuffer: Buffer
): Promise<string> {
  const result = await Tesseract.recognize(imageBuffer, 'eng+hin')
  return result.data.text
}
```

### 5. Clause Extraction

```typescript
// src/lib/clause-extractor.ts
export interface ExtractedClause {
  title: string
  content: string
  riskLevel: 'low' | 'medium' | 'high'
  suggestions: string[]
}

export async function extractClauses(
  documentText: string
): Promise<ExtractedClause[]> {
  // Use AI to identify clauses
  // Assess risk level
  // Suggest improvements
}
```

---

## ENVIRONMENT VARIABLES NEEDED

```bash
# Vector DB (Pinecone)
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=lawai-documents

# OCR (Optional - tesseract.js is client-side)
# No additional keys needed

# Case Law API
INDIAN_KANOON_API_KEY=your_key

# Language Detection (Optional)
# Can use simple heuristics, no API needed
```

---

## DATABASE MIGRATIONS NEEDED

```sql
-- Add vector column for embeddings
ALTER TABLE documents ADD COLUMN embedding vector(1536);

-- Add clause extraction table
CREATE TABLE extracted_clauses (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  title TEXT,
  content TEXT,
  risk_level TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add safety violations log
CREATE TABLE safety_violations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users_app(user_id),
  prompt TEXT,
  violation_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add case law references
CREATE TABLE case_law_references (
  id UUID PRIMARY KEY,
  case_name TEXT,
  year INTEGER,
  court TEXT,
  citation TEXT,
  summary TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API ROUTES TO CREATE

### New Routes
```
POST /api/safety/check - Check if prompt is safe
POST /api/embeddings/generate - Generate embeddings for document
POST /api/documents/search - Search documents using RAG
POST /api/documents/compare - Compare two documents
POST /api/clauses/extract - Extract clauses from document
POST /api/risk/score - Score case/contract risk
POST /api/case-law/search - Search case law database
POST /api/conflicts/check - Check for conflicts of interest
POST /api/ai-assistant/multilingual - AI response in multiple languages
```

---

## TESTING CHECKLIST

### Safety Guardrails
- [ ] Refuse illegal requests
- [ ] Log violations
- [ ] Provide helpful alternatives
- [ ] No false positives

### RAG/Vector DB
- [ ] Documents embedded correctly
- [ ] Search returns relevant results
- [ ] Context injected into prompts
- [ ] Performance acceptable

### OCR
- [ ] Scanned PDFs readable
- [ ] Images processed correctly
- [ ] Hindi text recognized
- [ ] Formatting preserved

### Hindi Chat
- [ ] Language detection works
- [ ] Hindi responses generated
- [ ] Hinglish supported
- [ ] Toggle works in UI

### Advanced Features
- [ ] Risk scores accurate
- [ ] Case law references verified
- [ ] Conflicts detected
- [ ] Clause extraction works

---

## DEPLOYMENT CHECKLIST

- [ ] All safety guardrails in place
- [ ] RAG pipeline tested
- [ ] OCR working
- [ ] Hindi chat functional
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] API routes tested
- [ ] UI components updated
- [ ] Documentation updated
- [ ] Security audit passed

---

## ESTIMATED EFFORT

| Task | Effort | Timeline |
|------|--------|----------|
| Safety Guardrails | 4 hours | Day 1 |
| Hindi Chat | 3 hours | Day 1 |
| RAG Setup | 6 hours | Day 2 |
| OCR Integration | 4 hours | Day 2 |
| Clause Extraction | 5 hours | Day 3 |
| Risk Scoring | 4 hours | Day 3 |
| Case Law DB | 5 hours | Day 4 |
| UI Components | 6 hours | Day 4-5 |
| Testing | 8 hours | Day 5-6 |
| **TOTAL** | **45 hours** | **~1 week** |

---

## SUCCESS CRITERIA

✅ Safety guardrails prevent illegal requests  
✅ RAG pipeline enables document context  
✅ OCR handles scanned documents  
✅ Hindi chat works seamlessly  
✅ Risk scoring provides insights  
✅ Case law database verified  
✅ All tests passing  
✅ Production ready  

---

**Next Step**: Start with Safety Guardrails (CRITICAL)
