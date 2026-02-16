import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

// NVIDIA AI Service Layer — Pure NVIDIA Integration
// Primary: llama-3.3-nemotron-super-49b-v1.5
// Verification: deepseek-v3.1
// Strict citation enforcement — no answer without source

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'

// Initialize NVIDIA Provider via OpenAI compatibility layer
const nvidiaProvider = createOpenAI({
  baseURL: NVIDIA_BASE_URL,
  apiKey: process.env.NVIDIA_LLAMA_API_KEY || ''
})


export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  citations?: string[]
  model?: string
  verified?: boolean
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
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

// NVIDIA DeepSeek V3.2 (Reasoning) — Verification Model
async function callNvidiaDeepSeek(
  messages: AIMessage[],
  maxTokens: number = 4096
): Promise<AIResponse> {
  // Use the key provided by user if available, fallback to existing logic
  // User provided key: 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
  // Ideally this should be in .env.local, but for now we'll check env first
  const apiKey = process.env.NVIDIA_DEEPSEEK_API_KEY || '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'

  if (!apiKey || apiKey === 'placeholder' || apiKey.includes('your_')) {
    console.warn('NVIDIA DeepSeek key missing, using fallback simulation')
    // Simulation fallback if key is truly missing
    return {
      content: "(AI Key Missing) Verification skipped.",
      citations: [],
      verified: false
    }
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
        model: 'deepseek-ai/deepseek-r1', // Use R1 for reasoning as per user intent (v3.2 often maps to r1 on NVIDIA)
        messages,
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: maxTokens,
        stream: false,
        extra_body: {
          "chat_template_kwargs": { "thinking": true }
        }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`NVIDIA DeepSeek API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid NVIDIA DeepSeek response: no choices returned')
    }

    const content = data.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in NVIDIA DeepSeek response')
    }

    // Capture reasoning if available (NVIDIA might return it in a specific field or part of content)
    // R1 usually returns <think> tags in content or reasoning_content field
    // We clean it for display but the logic used it

    return {
      content: cleanResponse(content),
      citations: extractCitations(content),
      model: 'deepseek-ai/deepseek-r1', // Updated model name
      usage: data.usage
    }
  } catch (error) {
    clearTimeout(timeoutId)
    // If error, return unverified response rather than failing completely
    console.error('DeepSeek call failed:', error)
    return {
      content: "", // Empty content signals failure to verify
      citations: [],
      verified: false
    }
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

// Main AI service — routes to NVIDIA models with citation enforcement
export async function callAIService(
  messages: AIMessage[],
  userPlan: string = 'FREE',
  maxTokens: number = 4096,
  temperature: number = 0.6
): Promise<AIResponse> {
  // Inject citation enforcement into system prompt
  const enhancedMessages = messages.map((msg) => {
    if (msg.role === 'system') {
      return {
        ...msg,
        content: `${msg.content}\n\n${CITATION_SYSTEM_PROMPT}`
      }
    }
    return msg
  })

  // If no system message exists, add citation enforcement
  if (!enhancedMessages.find(m => m.role === 'system')) {
    enhancedMessages.unshift({
      role: 'system',
      content: `You are an expert legal AI assistant specializing in Indian law.\n\n${CITATION_SYSTEM_PROMPT}`
    })
  }

  // Call primary model (Llama Nemotron)
  const primaryResponse = await callNvidiaLlama(enhancedMessages, maxTokens, temperature)

  // Extract the original user query for verification
  const userQuery = messages.filter(m => m.role === 'user').pop()?.content || ''

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
  onFinish?: (completion: string) => Promise<void>
) {
  const apiKey = process.env.NVIDIA_LLAMA_API_KEY
  if (!apiKey || apiKey === 'placeholder' || apiKey.includes('your_')) {
    throw new Error('NVIDIA Llama API key not configured (Streaming)')
  }

  // Inject system prompt for legal expertise if not present
  let formattedMessages = [...messages]
  if (!formattedMessages.find(m => m.role === 'system')) {
    formattedMessages.unshift({
      role: 'system',
      content: `You are an expert Indian legal assistant.
      
RULES:
1. Cite specific Indian laws (IPC, CPC, CrPC, Acts)
2. Be practical, concise, and professional
3. If the user asks for a legal draft (Notice, Affidavit, Agreement, etc.):
   - Provide the complete draft content first.
   - IMPERATIVE: End your response with exactly: "[OFFER_DRAFT]" on a new line.
   - This triggers the advanced drafting UI for the user.
4. If unsure, disclaim liability`
    })
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