import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🧪 Test API - Received body:', body)
    
    // Import and test document generation
    const { generateDocument } = await import('@/lib/document-templates')
    
    const testInputs = {
      sellerName: 'Rajesh Kumar',
      buyerName: 'Priya Sharma', 
      propertyDescription: 'Flat 301, Green Valley Apartments, Sector 15, Gurgaon',
      saleAmount: '5000000',
      advanceAmount: '500000'
    }
    
    console.log('🧪 Test inputs:', testInputs)
    
    const content = await generateDocument('sale', testInputs)
    
    console.log('🧪 Generated content length:', content.length)
    console.log('🧪 Generated content preview:', content.substring(0, 200))
    
    return NextResponse.json({
      ok: true,
      message: 'Test successful',
      inputs: testInputs,
      contentLength: content.length,
      contentPreview: content.substring(0, 500),
      fullContent: content
    })
    
  } catch (error) {
    console.error('🧪 Test API error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Test failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Test drafts API is working' })
}