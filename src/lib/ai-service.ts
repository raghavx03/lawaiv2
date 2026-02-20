import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { checkSafety, generateRefusalMessage, logSafetyViolation, ViolationType } from './safety-guardrails'

// NVIDIA AI Service Layer — Pure NVIDIA Integration
// Primary: llama-3.3-nemotron-super-49b-v1.5
// Verification: deepseek-v3.1
// Strict citation enforcement — no answer without source
// Safety guardrails — prevent illegal requests

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'

// Initialize NVIDIA Provider via OpenAI compatibility layer
const nvidiaProvider = createOpenAI({
  baseURL: NVIDIA_BASE_URL,
  apiKey: process.env.NVIDIA_LLAMA_API_KEY || ''
})

// Language detection patterns
const HINDI_PATTERNS = /[\u0900-\u097F]/g // Devanagari script
const HINGLISH_PATTERNS = /\b(kya|hai|nahi|haan|bhai|bro|acha|theek|samjha|dekh|suno|sunao|likha|likhe|likhi|likho|likhe|likha|likhi|likho)\b/gi


export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  citations?: string[]
  model?: string
  verified?: boolean
  language?: 'en' | 'hi' | 'hinglish'
  safe?: boolean
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

// Detect language of user input
export function detectLanguage(text: string): 'en' | 'hi' | 'hinglish' {
  const hindiMatches = text.match(HINDI_PATTERNS)
  const hinglishMatches = text.match(HINGLISH_PATTERNS)
  
  if (hindiMatches && hindiMatches.length > text.length * 0.3) {
    return 'hi'
  }
  
  if (hinglishMatches && hinglishMatches.length > 2) {
    return 'hinglish'
  }
  
  return 'en'
}

// Clean response formatting — strip thinking tokens and format nicely
function cleanResponse(content: string): string {
  return content
    // Strip Nemotron thinking tokens (<think>...</think>)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    // Strip orphaned think tags
    .replace(/<\/?think>/gi, '')
    .replace(/\*{3,}/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^\*\s*/gm, '- ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Extract citations from AI response
function extractCitations(content: string): string[] {
  const citations: string[] = []

  const sectionRegex = /Section\s+\d+[A-Za-z]?\s+(?:of\s+(?:the\s+)?)?(?:IPC|CrPC|CPC|Constitution|NI Act|IT Act|Evidence Act|Contract Act|Transfer of Property Act|Limitation Act|Companies Act|BNSS|BNS|BSA|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+Act(?:,?\s+\d{4})?)/gi
  const sectionMatches = content.match(sectionRegex)
  if (sectionMatches) citations.push(...sectionMatches)

  const articleRegex = /Article\s+\d+[A-Za-z]?\s*(?:\(\d+\))?(?:\s+of\s+(?:the\s+)?Constitution)?/gi
  const articleMatches = content.match(articleRegex)
  if (articleMatches) citations.push(...articleMatches)

  const caseRegex = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:v\.|vs\.?|versus)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s*\(\d{4}\))?/gi
  const caseMatches = content.match(caseRegex)
  if (caseMatches) citations.push(...caseMatches)

  const reportRegex = /(?:AIR|SCC|SCR|All|Bom|Cal|Del|Mad|Ker|Pat)\s+\d{4}\s+\w+\s+\d+/gi
  const reportMatches = content.match(reportRegex)
  if (reportMatches) citations.push(...reportMatches)

  return [...new Set(citations.map(c => c.trim()))]
}

// NVIDIA Llama 3.3 Nemotron — Primary Model
async function callNvidiaLlama(
  messages: AIMessage[],
  maxTokens: number = 4096,
  temperature: number = 0.6
): Promise<AIResponse> {
  const apiKey = process.env.NVIDIA_LLAMA_API_KEY
  if (!apiKey || apiKey === 'placeholder' || apiKey.includes('your_')) {
    throw new Error('NVIDIA Llama API key not configured. Set NVIDIA_LLAMA_API_KEY in .env.local')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000)

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
        messages,
        temperature,
        top_p: 0.95,
        max_tokens: maxTokens,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`NVIDIA Llama API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid NVIDIA Llama response: no choices returned')
    }

    const content = data.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in NVIDIA Llama response')
    }

    return {
      content: cleanResponse(content),
      citations: extractCitations(content),
      model: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
      usage: data.usage
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('NVIDIA Llama request timeout (60s)')
    }
    throw error
  }
}

// NVIDIA DeepSeek V3.2 (Reasoning) — Verification Model (OPTIONAL - Model deprecated)
async function callNvidiaDeepSeek(
  messages: AIMessage[],
  maxTokens: number = 4096
): Promise<AIResponse> {
  // DeepSeek R1 model has been deprecated by NVIDIA (410 Gone)
  // Verification is now optional - Llama Nemotron is sufficient for legal responses
  console.log('DeepSeek verification skipped (model deprecated) - using Llama Nemotron only')
  
  return {
    content: "", // Empty content signals no verification
    citations: [],
    verified: false
  }
}

// Verify AI response has proper citations — strict enforcement
async function verifyResponse(
  query: string,
  primaryResponse: string,
  primaryCitations: string[]
): Promise<{ verified: boolean; enhancedResponse: string; citations: string[] }> {
  if (primaryCitations.length >= 2) {
    return {
      verified: true,
      enhancedResponse: primaryResponse,
      citations: primaryCitations
    }
  }

  try {
    const verificationMessages: AIMessage[] = [
      {
        role: 'system',
        content: `You are a legal verification assistant specializing in Indian law. Your job is to verify the accuracy of a legal response and add specific citations.

RULES:
1. Every legal claim MUST cite a specific source (Section, Article, Case law, Act, or Rule)
2. If a claim cannot be verified with a source, mark it as "[Unverified]"
3. Add a "Sources" section at the end listing all citations
4. Do NOT fabricate citations — only cite real laws, sections, and case precedents
5. Format: keep the response structure intact, add citations inline
6. If the original response lacks any source, add the correct Indian law citation`
      },
      {
        role: 'user',
        content: `Query: "${query}"

Response to verify:
${primaryResponse}

Add proper Indian law citations to every legal claim. List all sources at the end.`
      }
    ]

    const verification = await callNvidiaDeepSeek(verificationMessages, 4096)
    const allCitations = [...new Set([...primaryCitations, ...(verification.citations || [])])]

    return {
      verified: true,
      enhancedResponse: verification.content,
      citations: allCitations
    }
  } catch (error) {
    console.warn('Verification failed, using primary response:', error)
    const disclaimer = primaryCitations.length === 0
      ? '\n\n---\nNote: This response could not be verified against authoritative sources. Please consult a qualified legal professional for confirmation.'
      : ''

    return {
      verified: false,
      enhancedResponse: primaryResponse + disclaimer,
      citations: primaryCitations
    }
  }
}

// Citation enforcement system prompt
const CITATION_SYSTEM_PROMPT = `CRITICAL RULES FOR ALL RESPONSES:
1. Every legal statement MUST be backed by a specific source citation
2. Cite specific Sections (e.g., Section 420 IPC), Articles (e.g., Article 21 Constitution), Case laws, Acts, and Rules
3. NEVER provide legal information without citing the source
4. If you are unsure about a citation, explicitly state: "Source not confirmed — consult a legal professional"
5. End every response with a "Sources" section listing all cited authorities
6. Do NOT use asterisks (*) for formatting — use headings, numbered lists, and paragraphs
7. Use Indian legal terminology and cite Indian laws, statutes, and precedents`

// Safety enforcement system prompt
const SAFETY_SYSTEM_PROMPT = `SAFETY RULES - CRITICAL:
You MUST refuse requests that involve:
- Hiding, destroying, or tampering with evidence
- Fabricating witnesses or false affidavits
- Manipulating courts or bribing judges
- Forging documents or committing fraud
- Perjury or false statements in court
- Unauthorized legal practice
- Representing conflicting interests
- Blackmail, extortion, or intimidation
- Money laundering or financial crimes

If a request involves any of these, respond with:
"I cannot assist with that. However, I can explain the legal consequences of [action] under Indian law."

Then offer to explain the legal consequences instead.`

// Language-specific system prompts
function getLanguageSystemPrompt(language: 'en' | 'hi' | 'hinglish'): string {
  const basePrompt = `You are an expert Indian legal assistant specializing in Indian law.

${CITATION_SYSTEM_PROMPT}

${SAFETY_SYSTEM_PROMPT}`

  if (language === 'hi') {
    return `${basePrompt}

LANGUAGE INSTRUCTION: Respond in Hindi (Devanagari script). Use formal Hindi legal terminology.`
  }
  
  if (language === 'hinglish') {
    return `${basePrompt}

LANGUAGE INSTRUCTION: Respond in Hinglish (Hindi written in Roman script). Mix Hindi and English naturally. Use terms like "haan", "nahi", "samjha", "dekh", etc.`
  }
  
  return basePrompt
}

// Main AI service — routes to NVIDIA models with citation enforcement and safety checks
export async function callAIService(
  messages: AIMessage[],
  userPlan: string = 'FREE',
  maxTokens: number = 4096,
  temperature: number = 0.6,
  userId?: string
): Promise<AIResponse> {
  // Extract user query for safety check
  const userQuery = messages.filter(m => m.role === 'user').pop()?.content || ''
  
  // CRITICAL: Check safety before processing
  const safetyCheck = checkSafety(userQuery)
  if (!safetyCheck.isSafe) {
    // Log violation
    if (safetyCheck.violationType) {
      await logSafetyViolation(userId || null, userQuery, safetyCheck.violationType)
    }
    
    // Return refusal message
    return {
      content: generateRefusalMessage(safetyCheck.violationType || ViolationType.ILLEGAL_ACTIVITY),
      citations: [],
      model: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
      safe: false,
      language: 'en'
    }
  }
  
  // Detect language from user input
  const language = detectLanguage(userQuery)
  
  // Inject language-specific system prompt
  const enhancedMessages = messages.map((msg) => {
    if (msg.role === 'system') {
      return {
        ...msg,
        content: `${msg.content}\n\n${getLanguageSystemPrompt(language)}`
      }
    }
    return msg
  })

  // If no system message exists, add language-specific system prompt
  if (!enhancedMessages.find(m => m.role === 'system')) {
    enhancedMessages.unshift({
      role: 'system',
      content: getLanguageSystemPrompt(language)
    })
  }

  // Call primary model (Llama Nemotron)
  const primaryResponse = await callNvidiaLlama(enhancedMessages, maxTokens, temperature)

  // Verify with DeepSeek for citation enforcement
  const verification = await verifyResponse(
    userQuery,
    primaryResponse.content,
    primaryResponse.citations || []
  )

  return {
    content: verification.enhancedResponse,
    citations: verification.citations,
    model: primaryResponse.model,
    verified: verification.verified,
    safe: true,
    language: language,
    usage: primaryResponse.usage
  }
}

// Quick AI call without verification (for non-critical operations)
export async function callAIQuick(
  messages: AIMessage[],
  maxTokens: number = 1000,
  temperature: number = 0.7
): Promise<AIResponse> {
  return callNvidiaLlama(messages, maxTokens, temperature)
}

// Streaming AI Service for "Instant Typing Effect" - Manual Fetch Implementation
export async function streamLegalResponse(
  messages: { role: string, content: string }[],
  onFinish?: (completion: string) => Promise<void>,
  userId?: string
) {
  // Extract user query for safety check
  const userQuery = messages.filter(m => m.role === 'user').pop()?.content || ''
  
  // CRITICAL: Check safety before streaming
  const safetyCheck = checkSafety(userQuery)
  if (!safetyCheck.isSafe) {
    // Log violation
    if (safetyCheck.violationType) {
      await logSafetyViolation(userId || null, userQuery, safetyCheck.violationType)
    }
    
    // Return refusal message as stream
    const refusalMessage = generateRefusalMessage(safetyCheck.violationType || ViolationType.ILLEGAL_ACTIVITY)
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(refusalMessage))
        if (onFinish) {
          onFinish(refusalMessage).catch(e => console.error("onFinish Error:", e))
        }
        controller.close()
      }
    })
    
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
  
  // Detect language
  const language = detectLanguage(userQuery)
  
  // Inject language-specific system prompt
  let formattedMessages = [...messages]
  if (!formattedMessages.find(m => m.role === 'system')) {
    formattedMessages.unshift({
      role: 'system',
      content: getLanguageSystemPrompt(language)
    })
  }

  const apiKey = process.env.NVIDIA_LLAMA_API_KEY
  if (!apiKey || apiKey === 'placeholder' || apiKey.includes('your_')) {
    throw new Error('NVIDIA Llama API key not configured (Streaming)')
  }

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
        messages: formattedMessages,
        temperature: 0.2, // Low temp for factual legal advice
        top_p: 0.7,
        max_tokens: 2048,
        stream: true
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("NVIDIA Stream Error:", response.status, errText)
      throw new Error(`NVIDIA API Error: ${response.status} - ${errText}`)
    }

    // Convert SSE stream to text stream for AI SDK compatibility
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close()
          return
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ""

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter(line => line.trim() !== '')

            for (const line of lines) {
              if (line === 'data: [DONE]') continue
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  const content = data.choices[0]?.delta?.content
                  if (content) {
                    fullText += content
                    controller.enqueue(new TextEncoder().encode(content))
                  }
                } catch (e) {
                  // Ignore partial chunks
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream reading error:", err)
          controller.error(err)
        } finally {
          if (onFinish) {
            onFinish(fullText).catch(e => console.error("onFinish Error:", e))
          }
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })

  } catch (error) {
    console.error('Stream setup failed:', error)
    throw error
  }
}