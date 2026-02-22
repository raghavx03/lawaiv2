export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { safeDbOperation } from '@/lib/prisma'
import { logDraftCreated } from '@/lib/case-activity'

// POST - Convert AI response to editable draft
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { aiContent, caseId, draftType, title } = await request.json()
    
    if (!aiContent) {
      return NextResponse.json({ error: 'AI content required' }, { status: 400 })
    }

    // Determine draft type from content or use provided
    const detectedType = draftType || detectDraftType(aiContent)
    const draftTitle = title || generateTitle(aiContent, detectedType)

    // Format AI content into draft structure
    const formattedContent = formatAsDraft(aiContent, detectedType)

    // Save as draft
    const savedDraft = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return null

      return prisma.draft.create({
        data: {
          userId: user.id,
          type: detectedType,
          title: draftTitle,
          content: formattedContent,
          inputs: { 
            source: 'ai_conversion',
            originalContent: aiContent.substring(0, 5000)
          },
          caseId: caseId || null
        }
      })
    }, null)

    // Log to case timeline
    if (savedDraft && caseId) {
      await logDraftCreated(caseId, user.id, detectedType, draftTitle, savedDraft.id)
    }

    return NextResponse.json({
      ok: true,
      draft: {
        id: savedDraft?.id || 'temp-' + Date.now(),
        title: draftTitle,
        type: detectedType,
        content: formattedContent,
        caseId,
        createdAt: savedDraft?.createdAt || new Date()
      }
    })
  } catch (error) {
    console.error('AI to Draft error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to convert to draft' 
    }, { status: 500 })
  }
}

function detectDraftType(content: string): string {
  const lowerContent = content.toLowerCase()
  
  if (lowerContent.includes('legal notice') || lowerContent.includes('hereby give notice')) {
    return 'legal_notice'
  }
  if (lowerContent.includes('affidavit') || lowerContent.includes('solemnly affirm')) {
    return 'affidavit'
  }
  if (lowerContent.includes('bail') || lowerContent.includes('anticipatory bail')) {
    return 'bail_application'
  }
  if (lowerContent.includes('complaint') || lowerContent.includes('complainant')) {
    return 'complaint'
  }
  if (lowerContent.includes('reply') || lowerContent.includes('written statement')) {
    return 'written_statement'
  }
  if (lowerContent.includes('petition') || lowerContent.includes('writ')) {
    return 'petition'
  }
  if (lowerContent.includes('agreement') || lowerContent.includes('contract')) {
    return 'agreement'
  }
  
  return 'legal_document'
}

function generateTitle(content: string, type: string): string {
  const typeLabels: Record<string, string> = {
    legal_notice: 'Legal Notice',
    affidavit: 'Affidavit',
    bail_application: 'Bail Application',
    complaint: 'Complaint',
    written_statement: 'Written Statement',
    petition: 'Petition',
    agreement: 'Agreement',
    legal_document: 'Legal Document'
  }

  const date = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })

  return `${typeLabels[type] || 'Document'} - ${date}`
}

function formatAsDraft(content: string, type: string): string {
  // Add header based on type
  let header = ''
  
  switch (type) {
    case 'legal_notice':
      header = `LEGAL NOTICE
Under Section 80 CPC / Section 138 NI Act (as applicable)

Date: ${new Date().toLocaleDateString('en-IN')}

`
      break
    case 'affidavit':
      header = `AFFIDAVIT

I, _________________________, do hereby solemnly affirm and state as under:

`
      break
    case 'bail_application':
      header = `IN THE COURT OF ________________________

APPLICATION FOR BAIL/ANTICIPATORY BAIL

`
      break
    case 'complaint':
      header = `COMPLAINT

Before the Hon'ble Court of ________________________

`
      break
    default:
      header = `LEGAL DOCUMENT

Date: ${new Date().toLocaleDateString('en-IN')}

`
  }

  // Clean and format the content
  let formattedContent = content
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/\*/g, '')   // Remove markdown italic
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .trim()

  // Add footer
  const footer = `

---
Generated from AI Assistant
Date: ${new Date().toLocaleDateString('en-IN')}
[DRAFT - Please review and edit before use]
`

  return header + formattedContent + footer
}
