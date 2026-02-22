export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { streamLegalResponse } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, history } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build conversation history
    const conversationHistory: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: `You are LAW.AI, an Indian legal assistant for advocates.

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
      }
    ]

    // Add history if provided
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          conversationHistory.push({
            role: msg.role,
            content: msg.content
          })
        }
      })
    }

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message
    })

    // Stream response
    const response = await streamLegalResponse(conversationHistory, undefined, user.id)
    return response
  } catch (error: any) {
    console.error('Stream error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to stream response' },
      { status: 500 }
    )
  }
}
