import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🧪 TEST API - Received:', body)
    
    const { type, inputs } = body
    const currentDate = new Date().toLocaleDateString('en-IN')
    
    // GUARANTEED user data integration - no AI, just direct replacement
    let content = ''
    
    if (type === 'sale') {
      content = `SALE DEED

THIS SALE DEED is made and executed on ${currentDate}

BETWEEN

${inputs.sellerName || '[SELLER NAME MISSING]'} (hereinafter called the "SELLER")
Address: ${inputs.sellerAddress || '[SELLER ADDRESS MISSING]'}

AND

${inputs.buyerName || '[BUYER NAME MISSING]'} (hereinafter called the "PURCHASER") 
Address: ${inputs.buyerAddress || '[BUYER ADDRESS MISSING]'}

PROPERTY DETAILS:
${inputs.propertyDescription || '[PROPERTY DESCRIPTION MISSING]'}

SALE CONSIDERATION:
The total sale consideration is Rs. ${inputs.saleAmount || '[AMOUNT MISSING]'}

ADVANCE PAYMENT:
The PURCHASER has paid Rs. ${inputs.advanceAmount || '0'} as advance.

SELLER: ${inputs.sellerName || '[SELLER NAME MISSING]'}

PURCHASER: ${inputs.buyerName || '[BUYER NAME MISSING]'}

Date: ${currentDate}`
    } else if (type === 'rent') {
      content = `RENTAL AGREEMENT

THIS RENTAL AGREEMENT is made on ${currentDate}

BETWEEN

${inputs.landlordName || '[LANDLORD NAME MISSING]'} (hereinafter called the "LANDLORD")

AND

${inputs.tenantName || '[TENANT NAME MISSING]'} (hereinafter called the "TENANT")

PROPERTY DETAILS:
${inputs.propertyAddress || '[PROPERTY ADDRESS MISSING]'}

RENTAL TERMS:
1. Monthly Rent: Rs. ${inputs.monthlyRent || '[RENT MISSING]'}
2. Security Deposit: Rs. ${inputs.securityDeposit || '[DEPOSIT MISSING]'}
3. Lease Period: ${inputs.leasePeriod || '[PERIOD MISSING]'}

LANDLORD: ${inputs.landlordName || '[LANDLORD NAME MISSING]'}

TENANT: ${inputs.tenantName || '[TENANT NAME MISSING]'}

Date: ${currentDate}`
    } else {
      content = `${type.toUpperCase()} DOCUMENT

Generated on: ${currentDate}

USER DATA:
${Object.entries(inputs).map(([key, value]) => `${key}: ${value}`).join('\n')}`
    }
    
    return NextResponse.json({
      ok: true,
      content,
      timestamp: Date.now(),
      userDataCount: Object.keys(inputs).length,
      debug: {
        inputsReceived: inputs,
        contentLength: content.length
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: 'Failed to generate'
    }, { status: 500 })
  }
}