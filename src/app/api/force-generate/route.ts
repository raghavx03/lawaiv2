import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, inputs } = body
  const currentDate = new Date().toLocaleDateString('en-IN')
  
  let content = ''
  
  if (type === 'sale') {
    content = `SALE DEED

THIS SALE DEED is made and executed on this the _____ day of _________, 2025

BETWEEN

Sri. ${inputs.sellerName || '_____________'} s/o. _____________ aged _____________ years
residing at ${inputs.sellerAddress || '_____________'} hereinafter
called the "SELLER" (which expression shall mean and include his legal heirs, successors,
successors-in-interest, executors, administrators, legal representatives, attorneys and assigns)
of ONE PART.

AND

Sri. ${inputs.buyerName || '_____________'} s/o _____________ aged _____________ years
residing at ${inputs.buyerAddress || '_____________'} hereinafter called the "PURCHASER" (which expression shall mean
and include his heirs, successors, executors, administrators,
legal representatives, attorneys and assigns of the OTHER
PART.

WHEREAS THE SELLER is the absolute owner in possession and
enjoyment of the property more fully described in the Schedule
hereunder written.

PROPERTY DESCRIPTION:
${inputs.propertyDescription || '_____________'}

SALE CONSIDERATION:
The total sale consideration agreed between the parties is Rs. ${inputs.saleAmount || '_____________'}

ADVANCE AMOUNT:
Out of the total consideration, Rs. ${inputs.advanceAmount || '_____________'} has been paid as advance.

Balance Amount: Rs. ${inputs.saleAmount && inputs.advanceAmount ? (parseInt(inputs.saleAmount) - parseInt(inputs.advanceAmount)).toLocaleString() : '_____________'}

TERMS AND CONDITIONS:
1. The SELLER has clear and marketable title to the property
2. The property is free from all encumbrances
3. Possession will be handed over on registration
4. All registration expenses to be borne by the PURCHASER

IN WITNESS WHEREOF the parties have executed this deed on the day, month and year first above written.

SELLER: ${inputs.sellerName || '_____________'}

PURCHASER: ${inputs.buyerName || '_____________'}

WITNESS 1: _____________

WITNESS 2: _____________`
  } else if (type === 'rent') {
    content = `RENTAL AGREEMENT

THIS RENTAL AGREEMENT is made on ${currentDate}

BETWEEN

${inputs.landlordName || '_____________'} (hereinafter called the "LANDLORD")
residing at _____________

AND

${inputs.tenantName || '_____________'} (hereinafter called the "TENANT")
residing at _____________

PROPERTY DETAILS:
${inputs.propertyAddress || '_____________'}

RENTAL TERMS:
1. Monthly Rent: Rs. ${inputs.monthlyRent || '_____________'}
2. Security Deposit: Rs. ${inputs.securityDeposit || '_____________'}
3. Lease Period: ${inputs.leasePeriod || '_____________'}
4. Lease Start Date: ${inputs.startDate || currentDate}

TERMS AND CONDITIONS:
1. Rent is payable by the 5th of each month
2. Tenant is responsible for electricity and water bills
3. No subletting without written consent of landlord
4. Either party can terminate with 30 days written notice
5. Any damage to property will be deducted from security deposit

IN WITNESS WHEREOF, the parties have signed this agreement on ${currentDate}

LANDLORD: ${inputs.landlordName || '_____________'}
Signature: _____________

TENANT: ${inputs.tenantName || '_____________'}
Signature: _____________

WITNESS 1: _____________

WITNESS 2: _____________`
  } else {
    content = `LEGAL DOCUMENT

Generated on: ${currentDate}

Document Type: ${type.toUpperCase()}

User Information:
${Object.entries(inputs).map(([key, value]) => `${key}: ${value}`).join('\n')}`
  }

  return NextResponse.json({
    ok: true,
    content,
    userDataCount: Object.keys(inputs).length,
    timestamp: Date.now()
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}