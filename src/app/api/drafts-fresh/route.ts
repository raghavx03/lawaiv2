import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔥 FRESH API - Received:', body)
    
    const { type, inputs } = body
    const currentDate = new Date().toLocaleDateString('en-IN')
    
    // Use Gemini AI to generate document with user data
    let content = ''
    
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDummy')
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `Generate a professional ${type === 'sale' ? 'Sale Deed' : type === 'rent' ? 'Rental Agreement' : 'Legal Document'} using this user data:

User Data:
${Object.entries(inputs).map(([key, value]) => `${key}: ${value}`).join('\n')}

Instructions:
1. Create a complete legal document in proper format
2. Fill ALL user data in appropriate places
3. Use current date: ${currentDate}
4. Make it legally sound and professional
5. Replace all placeholders with actual user data
6. If any data is missing, use appropriate legal language

Generate the complete document now:`

      const result = await model.generateContent(prompt)
      content = result.response.text()
      
      console.log('✅ Gemini generated document, length:', content.length)
      
    } catch (aiError) {
      console.warn('❌ Gemini failed, using fallback:', aiError)
      
      // Fallback template with user data
      if (type === 'sale') {
        content = `SALE DEED

THIS SALE DEED is made and executed on ${currentDate}

BETWEEN

${inputs.sellerName || 'SELLER NAME NOT PROVIDED'} (hereinafter called the "SELLER")
Address: ${inputs.sellerAddress || 'SELLER ADDRESS NOT PROVIDED'}

AND

${inputs.buyerName || 'BUYER NAME NOT PROVIDED'} (hereinafter called the "PURCHASER") 
Address: ${inputs.buyerAddress || 'BUYER ADDRESS NOT PROVIDED'}

WHEREAS the SELLER is the absolute owner of the property described below:

PROPERTY DETAILS:
${inputs.propertyDescription || 'PROPERTY DESCRIPTION NOT PROVIDED'}

SALE CONSIDERATION:
The total sale consideration is Rs. ${inputs.saleAmount || 'AMOUNT NOT PROVIDED'}

ADVANCE PAYMENT:
The PURCHASER has paid Rs. ${inputs.advanceAmount || 'ADVANCE NOT PROVIDED'} as advance.

TERMS:
1. The SELLER has clear and marketable title
2. Property is free from encumbrances
3. Possession on registration
4. Registration expenses by PURCHASER

SELLER: ${inputs.sellerName || 'SELLER NAME NOT PROVIDED'}

PURCHASER: ${inputs.buyerName || 'BUYER NAME NOT PROVIDED'}

Date: ${currentDate}`
      } else if (type === 'rent') {
        content = `RENTAL AGREEMENT

THIS RENTAL AGREEMENT is made on ${currentDate}

BETWEEN

${inputs.landlordName || 'LANDLORD NAME NOT PROVIDED'} (hereinafter called the "LANDLORD")

AND

${inputs.tenantName || 'TENANT NAME NOT PROVIDED'} (hereinafter called the "TENANT")

PROPERTY DETAILS:
${inputs.propertyAddress || 'PROPERTY ADDRESS NOT PROVIDED'}

RENTAL TERMS:
1. Monthly Rent: Rs. ${inputs.monthlyRent || 'RENT NOT PROVIDED'}
2. Security Deposit: Rs. ${inputs.securityDeposit || 'DEPOSIT NOT PROVIDED'}
3. Lease Period: ${inputs.leasePeriod || 'PERIOD NOT PROVIDED'}
4. Start Date: ${inputs.startDate || currentDate}

TERMS AND CONDITIONS:
1. Rent payable by 5th of each month
2. Tenant responsible for utilities
3. No subletting without consent
4. 30 days notice for termination

LANDLORD: ${inputs.landlordName || 'LANDLORD NAME NOT PROVIDED'}

TENANT: ${inputs.tenantName || 'TENANT NAME NOT PROVIDED'}

Date: ${currentDate}`
      } else {
        content = `${type.toUpperCase()} DOCUMENT

Generated on: ${currentDate}

User Data Provided:
${Object.entries(inputs).map(([key, value]) => `${key}: ${value}`).join('\n')}

This document contains all the user-provided information above.`
      }
    }
    
    const response = NextResponse.json({
      ok: true,
      content,
      timestamp: Date.now(),
      message: 'Document generated with user data',
      userDataCount: Object.keys(inputs).length
    })
    
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
    
  } catch (error) {
    console.error('🔥 FRESH API Error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to generate'
    }, { status: 500 })
  }
}