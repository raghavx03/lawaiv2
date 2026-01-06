export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { createGuardedHandler } from '@/lib/security/guards'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { hasFeatureAccess } from '@/lib/auth'
import { env } from '@/lib/env'

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    const { contractText } = await request.json()
    const userId = auth.user.id
    
    if (!contractText) {
      return NextResponse.json({ error: 'Contract text is required' }, { status: 400 })
    }

    // Check feature access
    if (!hasFeatureAccess(auth.user, 'DOC_GENERATOR')) {
      return NextResponse.json({ 
        error: 'Contract review not available in your plan. Upgrade to access this feature.'
      }, { status: 403 })
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(userId, 'DOC_GENERATOR')
    if (!usageCheck.allowed) {
      return NextResponse.json({ 
        error: 'Usage limit reached',
        reason: usageCheck.reason 
      }, { status: 402 })
    }

    if (!env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    console.log('Reviewing contract with OpenAI API...')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional contract review specialist. Provide detailed analysis in a structured format.'
          },
          {
            role: 'user',
            content: `Please review the following contract and provide a detailed analysis:

CONTRACT TEXT:
${contractText.substring(0, 8000)}

Please provide a comprehensive review in the following format:

## CONTRACT OVERVIEW
[Type of contract and its main purpose]

## KEY TERMS ANALYSIS
[Analysis of important terms, conditions, and clauses]

## FINANCIAL OBLIGATIONS
[Payment terms, amounts, penalties, and financial responsibilities]

## RIGHTS AND RESPONSIBILITIES
[What each party is obligated to do and their rights]

## RISK ASSESSMENT
[Potential risks, unfavorable terms, or red flags]

## COMPLIANCE & LEGAL ISSUES
[Legal compliance concerns or regulatory requirements]

## TERMINATION & DISPUTE RESOLUTION
[How the contract can be terminated and how disputes are handled]

## RECOMMENDATIONS
[Specific suggestions for improvements or negotiations]

## MISSING ELEMENTS
[Important clauses or terms that should be added]

## OVERALL ASSESSMENT
[Summary rating and key takeaways]

Please be thorough and include a disclaimer about seeking professional legal counsel for important contracts.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const review = data.choices?.[0]?.message?.content || 'Sorry, I could not review the contract. Please try again.'

    // Increment usage
    await incrementUsage(userId, 'DOC_GENERATOR')

    return NextResponse.json({ review })
  },
  { requireAuth: true, requireCSRF: true }
)