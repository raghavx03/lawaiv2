export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { safeDbOperation } from '@/lib/prisma'

// POST - Generate case preparation summary for hearing
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { caseId } = await request.json()
    if (!caseId) {
      return NextResponse.json({ error: 'Case ID required' }, { status: 400 })
    }

    // Fetch case data
    const caseData = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return null

      // Try new Case model
      let caseRecord = await (prisma as any).case.findFirst({
        where: { id: caseId, userId: user.id },
        include: {
          activities: { orderBy: { createdAt: 'desc' }, take: 20 },
          hearings: { orderBy: { date: 'desc' }, take: 5 },
          documents: { take: 10 }
        }
      }).catch(() => null)

      if (caseRecord) return caseRecord

      // Fallback to CaseTracker
      return prisma.caseTracker.findFirst({
        where: { id: caseId, userId: user.id }
      })
    }, null)

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Build case context for AI
    const caseContext = buildCaseContext(caseData)

    // Generate preparation using AI
    const { callAIService } = await import('@/lib/ai-service')

    const prepPrompt = `You are preparing a lawyer for an upcoming court hearing. Based on the case details below, generate a comprehensive preparation summary.

${caseContext}

Generate the following sections:
1. **Case Summary** (2-3 sentences covering key facts and current status)
2. **Key Issues** (bullet points of main legal issues)
3. **Arguments For** (points supporting our client's position)
4. **Arguments Against** (anticipated opposing arguments)
5. **Relevant Sections** (applicable IPC/CrPC/CPC sections with brief explanation)
6. **Recent Judgments** (2-3 relevant recent judgments if applicable)
7. **Preparation Checklist**:
   - Documents to carry
   - Points to remember
   - Questions to anticipate

Be specific to Indian law and practical for court appearance.`

    const aiResponse = await callAIService([
      { role: 'system', content: 'You are an expert Indian legal assistant helping lawyers prepare for court hearings.' },
      { role: 'user', content: prepPrompt }
    ], 'PRO', 3000, 0.7)

    // Parse the response into sections
    const prepContent = aiResponse.content

    // Get checklist status
    const checklist = await getChecklistStatus(caseId, user.id)

    return NextResponse.json({
      ok: true,
      caseId,
      caseName: caseData.title || caseData.partyName || caseData.cnrNumber,
      nextHearing: caseData.nextHearing || caseData.nextDate,
      preparation: prepContent,
      checklist,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Case prep error:', error)
    return NextResponse.json({
      error: 'Failed to generate preparation',
      ok: false
    }, { status: 500 })
  }
}

function buildCaseContext(caseData: any): string {
  let context = `CASE DETAILS:\n`

  if (caseData.title || caseData.partyName) {
    context += `Title: ${caseData.title || caseData.partyName}\n`
  }
  if (caseData.cnrNumber || caseData.cnr) {
    context += `CNR: ${caseData.cnrNumber || caseData.cnr}\n`
  }
  if (caseData.caseType) {
    context += `Type: ${caseData.caseType}\n`
  }
  if (caseData.court) {
    context += `Court: ${caseData.court}\n`
  }
  if (caseData.judge) {
    context += `Judge: ${caseData.judge}\n`
  }
  if (caseData.petitioner) {
    context += `Petitioner: ${caseData.petitioner}\n`
  }
  if (caseData.respondent) {
    context += `Respondent: ${caseData.respondent}\n`
  }
  if (caseData.status) {
    context += `Status: ${caseData.status}\n`
  }
  if (caseData.stage) {
    context += `Stage: ${caseData.stage}\n`
  }
  if (caseData.nextHearing || caseData.nextDate) {
    context += `Next Hearing: ${caseData.nextHearing || caseData.nextDate}\n`
  }
  if (caseData.aiSummary) {
    context += `\nPrevious Summary: ${caseData.aiSummary}\n`
  }
  if (caseData.notes) {
    context += `\nNotes: ${caseData.notes}\n`
  }

  // Add recent activities if available
  if (caseData.activities && caseData.activities.length > 0) {
    context += `\nRECENT ACTIVITIES:\n`
    caseData.activities.slice(0, 5).forEach((a: any) => {
      context += `- ${a.type}: ${a.title}\n`
    })
  }

  // Add hearing history if available
  if (caseData.hearings && caseData.hearings.length > 0) {
    context += `\nHEARING HISTORY:\n`
    caseData.hearings.slice(0, 3).forEach((h: any) => {
      context += `- ${h.date}: ${h.purpose || 'Hearing'} - ${h.outcome || 'Pending'}\n`
    })
  }

  return context
}

async function getChecklistStatus(caseId: string, userId: string) {
  return safeDbOperation(async () => {
    const { prisma } = await import('@/lib/prisma')
    if (!prisma) return defaultChecklist()

    // Count documents and drafts for this case
    const [draftsCount, docsCount] = await Promise.all([
      prisma.draft.count({ where: { userId, caseId } }),
      prisma.uploadedFile.count({ where: { userId, caseId } })
    ])

    const caseRecord = await prisma.case.findUnique({ where: { id: caseId }, select: { notes: true } })

    return {
      draftsReady: draftsCount > 0,
      draftsCount,
      documentsUploaded: docsCount > 0,
      documentsCount: docsCount,
      notesReady: (typeof caseRecord?.notes === 'string' && caseRecord.notes.length > 10) || false,
      researchDone: (await prisma.research.count({ where: { userId, caseId } })) > 0
    }
  }, defaultChecklist())
}

function defaultChecklist() {
  return {
    draftsReady: false,
    draftsCount: 0,
    documentsUploaded: false,
    documentsCount: 0,
    notesAdded: false,
    researchDone: false
  }
}
