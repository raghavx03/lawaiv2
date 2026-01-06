export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'

// Simple drafts endpoint without authentication for testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, inputs = {}, formData = {} } = body
    
    // Use inputs or formData
    const data = Object.keys(inputs).length > 0 ? inputs : formData
    
    // Generate simple document based on type
    let content = ''
    
    switch (type) {
      case 'rent':
        content = `RENTAL AGREEMENT

This Rental Agreement is executed on ${new Date().toLocaleDateString()} between:

LANDLORD: ${data.landlord || '[Landlord Name]'}
TENANT: ${data.tenant || '[Tenant Name]'}

PROPERTY DETAILS:
Address: ${data.property || '[Property Address]'}
Monthly Rent: ₹${data.rent || '[Rent Amount]'}
Lease Duration: ${data.duration || '[Duration]'}

TERMS AND CONDITIONS:

1. RENT PAYMENT
   The Tenant agrees to pay monthly rent of ₹${data.rent || '[Amount]'} on or before the 5th of each month.

2. SECURITY DEPOSIT
   A security deposit equivalent to 2 months' rent shall be paid by the Tenant.

3. MAINTENANCE
   The Tenant shall maintain the property in good condition and report any damages immediately.

4. TERMINATION
   Either party may terminate this agreement with 30 days written notice.

5. GOVERNING LAW
   This agreement shall be governed by Indian law and subject to local jurisdiction.

IN WITNESS WHEREOF, both parties have executed this agreement on the date mentioned above.

LANDLORD: _________________    TENANT: _________________
Signature                     Signature`
        break
        
      case 'employment':
        content = `EMPLOYMENT CONTRACT

This Employment Contract is made on ${new Date().toLocaleDateString()} between:

EMPLOYER: ${data.employer || '[Company Name]'}
EMPLOYEE: ${data.employee || '[Employee Name]'}

JOB DETAILS:
Position: ${data.position || '[Job Title]'}
Salary: ₹${data.salary || '[Salary Amount]'} per annum
Start Date: ${data.startDate || '[Start Date]'}

TERMS OF EMPLOYMENT:

1. DUTIES AND RESPONSIBILITIES
   The Employee shall perform duties as assigned and maintain confidentiality.

2. COMPENSATION
   Annual salary of ₹${data.salary || '[Amount]'} payable monthly.

3. WORKING HOURS
   Standard working hours as per company policy.

4. TERMINATION
   Either party may terminate with 30 days notice.

5. CONFIDENTIALITY
   Employee agrees to maintain confidentiality of company information.

EMPLOYER: _________________    EMPLOYEE: _________________
Signature                     Signature`
        break
        
      case 'nda':
        content = `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is made on ${new Date().toLocaleDateString()} between:

DISCLOSING PARTY: ${data.discloser || '[Disclosing Party]'}
RECEIVING PARTY: ${data.recipient || '[Receiving Party]'}

PURPOSE: ${data.purpose || '[Purpose of disclosure]'}
DURATION: ${data.duration || '[Duration]'}

CONFIDENTIALITY TERMS:

1. DEFINITION OF CONFIDENTIAL INFORMATION
   All information shared between parties shall be considered confidential.

2. OBLIGATIONS
   The Receiving Party agrees to maintain strict confidentiality.

3. DURATION
   This agreement shall remain in effect for ${data.duration || '[Duration]'}.

4. REMEDIES
   Breach of this agreement may result in legal action.

DISCLOSING PARTY: _________________    RECEIVING PARTY: _________________
Signature                             Signature`
        break
        
      default:
        content = `LEGAL DOCUMENT

This document is created on ${new Date().toLocaleDateString()}.

PARTIES:
First Party: ${data.party1 || '[First Party]'}
Second Party: ${data.party2 || '[Second Party]'}

TERMS: ${data.terms || '[Terms and conditions]'}

This document is governed by Indian law.

PARTY 1: _________________    PARTY 2: _________________
Signature                    Signature`
    }
    
    return NextResponse.json({
      ok: true,
      content: content.trim(),
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Agreement - ${new Date().toLocaleDateString()}`,
      id: 'temp-' + Date.now(),
      createdAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Simple drafts error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    drafts: []
  })
}