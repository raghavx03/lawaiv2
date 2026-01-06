export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { safeDbOperation } from '@/lib/prisma'

// REFINED Indian Law System Prompt - Optimized for Lawyers
const INDIAN_LAW_SYSTEM_PROMPT = `You are LAW.AI, an Indian legal assistant for advocates.

RULES:
- Use only Indian law (IPC, CrPC, CPC, NI Act, Constitution, Evidence Act, etc.)
- Always cite relevant sections when applicable (e.g., "Section 420 IPC", "Section 138 NI Act")
- Explain in simple language that clients can understand
- Add "💡 Practical Tip for Lawyer:" at the end when helpful
- Ask ONE follow-up question if it would help provide better advice
- Do NOT repeat legal disclaimers in every response
- Respond in the same language as the query (Hindi, English, or Hinglish)

KNOWLEDGE AREAS:
- Criminal: IPC, CrPC, POCSO, NDPS, SC/ST Act
- Civil: CPC, Specific Relief Act, Limitation Act
- Family: Hindu Marriage Act, Hindu Succession, Divorce, Maintenance
- Property: Transfer of Property Act, Registration Act, RERA
- Commercial: NI Act (Section 138), Companies Act, Arbitration Act
- Consumer: Consumer Protection Act 2019
- Constitutional: Fundamental Rights, Writs (Article 32, 226)
- Cyber: IT Act 2000
- Labour: Industrial Disputes Act, Factories Act

COURT PROCEDURES:
- Filing FIR, complaints, petitions
- Bail (regular, anticipatory, interim)
- Appeals and revisions
- Execution proceedings
- Limitation periods

FORMAT:
- Be concise but complete
- Use bullet points for steps/procedures
- Cite landmark cases when relevant
- Provide practical next steps

You are helpful, accurate, and focused on actionable legal guidance.`

// Build case context for AI
function buildCaseContext(caseData: any): string {
  if (!caseData) return ''
  
  let context = `\n\n[CASE CONTEXT]\n`
  context += `CNR: ${caseData.cnrNumber}\n`
  if (caseData.caseType) context += `Type: ${caseData.caseType}\n`
  if (caseData.court) context += `Court: ${caseData.court}\n`
  if (caseData.petitioner) context += `Petitioner: ${caseData.petitioner}\n`
  if (caseData.respondent) context += `Respondent: ${caseData.respondent}\n`
  if (caseData.status) context += `Status: ${caseData.status}\n`
  if (caseData.nextHearing) context += `Next Hearing: ${caseData.nextHearing}\n`
  context += `\nProvide advice relevant to this specific case when applicable.`
  
  return context
}

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId')

    const chats = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')
      
      // Filter by case ID in title if provided (workaround until schema migration)
      const whereClause: any = { userId: user.id }
      if (caseId) {
        whereClause.title = { contains: `[case:${caseId}]` }
      }
      
      const sessions = await prisma.chatSession.findMany({
        where: whereClause,
        include: { 
          messages: { 
            orderBy: { createdAt: 'asc' },
            take: 10 
          } 
        },
        orderBy: { updatedAt: 'desc' },
        take: 20
      })

      return sessions.flatMap(session => {
        // Extract caseId from title if present
        const titleMatch = session.title.match(/\[case:([^\]]+)\]/)
        const sessionCaseId = titleMatch ? titleMatch[1] : null
        
        return session.messages
          .filter(msg => msg.role === 'user')
          .map(msg => ({
            id: msg.id,
            prompt: msg.content,
            createdAt: msg.createdAt.toISOString(),
            caseId: sessionCaseId
          }))
      })
    }, [])

    return NextResponse.json(chats)
  } catch (error) {
    console.error('AI Assistant GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, message, caseId, history } = body
    const userPrompt = prompt || message
    
    if (!userPrompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Fetch case data if caseId provided (from CaseTracker model)
    let caseData = null
    if (caseId) {
      caseData = await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) return null
        const tracker = await prisma.caseTracker.findUnique({
          where: { id: caseId }
        })
        if (!tracker) return null
        
        // Map CaseTracker fields to expected format
        const details = tracker.details as any || {}
        return {
          cnrNumber: tracker.cnr,
          caseType: details.caseType || 'General',
          court: tracker.court,
          status: tracker.status,
          nextHearing: tracker.nextDate?.toISOString().split('T')[0],
          petitioner: tracker.partyName,
          respondent: details.respondent || 'Unknown'
        }
      }, null)
    }

    // Build system prompt with case context
    let systemPrompt = INDIAN_LAW_SYSTEM_PROMPT
    if (caseData) {
      systemPrompt += buildCaseContext(caseData)
    }

    // Build conversation history for context
    const conversationHistory: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
      { role: 'system', content: systemPrompt }
    ]

    // Add previous messages for context (last 6 messages)
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach((msg: { role: string, content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          conversationHistory.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })
        }
      })
    }

    // Add current user message
    conversationHistory.push({ role: 'user', content: userPrompt })

    // Get AI response
    const { callAIService } = await import('@/lib/ai-service')
    
    // Get user plan
    let userPlan = 'FREE'
    try {
      const { prisma } = await import('@/lib/prisma')
      if (prisma) {
        const userProfile = await prisma.userApp.findUnique({
          where: { userId: user.id },
          select: { plan: true }
        })
        userPlan = userProfile?.plan || 'FREE'
      }
    } catch (e) {
      console.log('Could not fetch user plan, using FREE')
    }
    
    // Generate AI response
    const aiResponse = await callAIService(
      conversationHistory,
      userPlan,
      2000,
      0.7
    )
    
    const response = aiResponse.content

    // Save to database with case linkage (store caseId in title as workaround)
    const savedData = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return null
      
      // Build title with case ID embedded
      const titlePrefix = caseId ? `[case:${caseId}] ` : ''
      const titleContent = userPrompt.substring(0, 45) + (userPrompt.length > 45 ? '...' : '')
      
      // Create or get existing session for this case
      let session = await prisma.chatSession.findFirst({
        where: { 
          userId: user.id,
          ...(caseId ? { title: { contains: `[case:${caseId}]` } } : {})
        },
        orderBy: { updatedAt: 'desc' }
      })

      if (!session) {
        session = await prisma.chatSession.create({
          data: {
            userId: user.id,
            title: titlePrefix + titleContent
          }
        })
      }

      // Save messages
      const [, assistantMsg] = await prisma.$transaction([
        prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'user',
            content: userPrompt,
            citations: []
          }
        }),
        prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'assistant',
            content: response,
            citations: []
          }
        }),
        prisma.chatSession.update({
          where: { id: session.id },
          data: { updatedAt: new Date() }
        })
      ])

      // Update case tracker with last AI interaction
      if (caseId) {
        try {
          const existingTracker = await prisma.caseTracker.findUnique({
            where: { id: caseId },
            select: { details: true }
          })
          
          const existingDetails = (existingTracker?.details as any) || {}
          
          await prisma.caseTracker.update({
            where: { id: caseId },
            data: { 
              lastUpdate: new Date(),
              details: {
                ...existingDetails,
                lastAiQuery: userPrompt.substring(0, 200),
                lastAiQueryAt: new Date().toISOString()
              }
            }
          })
        } catch (e) {
          // Non-critical, continue
          console.log('Could not update case tracker:', e)
        }
      }
      
      return { sessionId: session.id, messageId: assistantMsg.id }
    }, null)
    
    return NextResponse.json({
      response,
      message: response,
      success: true,
      caseId,
      sessionId: savedData?.sessionId,
      messageId: savedData?.messageId
    })
  } catch (error: any) {
    console.error('AI Assistant POST error:', error)
    
    const fallbackResponse = `I apologize, but I'm experiencing technical difficulties. 

Quick resources:
• Indian Kanoon (indiankanoon.org) - Case law database
• eCourts (ecourts.gov.in) - Case status
• Legislative.gov.in - Acts and laws

Please try again or consult a qualified advocate.`
    
    return NextResponse.json({
      response: fallbackResponse,
      message: fallbackResponse,
      success: false,
      error: error.message
    })
  }
}
