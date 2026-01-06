import { env } from './env'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

// Clean response to remove excessive asterisks
function cleanResponse(content: string): string {
  return content
    .replace(/\*{3,}/g, '') // Remove 3+ consecutive asterisks
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
    .replace(/^\*\s*/gm, '• ') // Convert asterisk bullets to proper bullets
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
    .trim()
}

// Check if user is on free plan
function isFreeUser(userPlan: string): boolean {
  return userPlan.toUpperCase() === 'FREE'
}

// Call Google Gemini API
async function callGeminiAPI(messages: AIMessage[], maxTokens: number = 1000): Promise<AIResponse> {
  const apiKey = env.GEMINI_API_KEY
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('placeholder')) {
    throw new Error('Gemini API key not configured')
  }
  console.log('Using Gemini API key:', apiKey.substring(0, 10) + '...')

  // Convert messages to Gemini format
  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const userMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant')
  
  // Build conversation context with formatting instructions
  let prompt = systemMessage ? `${systemMessage} IMPORTANT: Do not use asterisks (*) for formatting. Use clear headings, numbered lists, and proper paragraph breaks instead.\n\n` : 'IMPORTANT: Do not use asterisks (*) for formatting. Use clear headings, numbered lists, and proper paragraph breaks instead.\n\n'
  userMessages.forEach(msg => {
    if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n`
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n`
    }
  })
  
  // Get the last user message
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || ''
  if (lastUserMessage) {
    prompt += `User: ${lastUserMessage}\nAssistant:`
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid Gemini response structure')
  }

  const content = data.candidates[0].content.parts[0]?.text
  if (!content) {
    throw new Error('No content in Gemini response')
  }

  return {
    content: cleanResponse(content),
    usage: data.usageMetadata ? {
      prompt_tokens: data.usageMetadata.promptTokenCount,
      completion_tokens: data.usageMetadata.candidatesTokenCount,
      total_tokens: data.usageMetadata.totalTokenCount
    } : undefined
  }
}

// Call OpenAI API
async function callOpenAIAPI(messages: AIMessage[], maxTokens: number = 1000, temperature: number = 0.7): Promise<AIResponse> {
  if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.includes('placeholder') || env.OPENAI_API_KEY.includes('your_')) {
    throw new Error('OpenAI API key not configured')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: maxTokens,
        temperature
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid OpenAI response structure')
    }

    const content = data.choices[0]?.message?.content
    if (!content) {
      throw new Error('No message content in OpenAI response')
    }

    return {
      content: cleanResponse(content),
      usage: data.usage
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

// Main AI service function that routes to appropriate API based on user plan
export async function callAIService(
  messages: AIMessage[], 
  userPlan: string, 
  maxTokens: number = 1000, 
  temperature: number = 0.7
): Promise<AIResponse> {
  if (isFreeUser(userPlan)) {
    return await callGeminiAPI(messages, maxTokens)
  } else {
    return await callOpenAIAPI(messages, maxTokens, temperature)
  }
}