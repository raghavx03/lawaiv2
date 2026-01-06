import { NextRequest, NextResponse } from 'next/server'

function generateDocument(type: string, inputs: any): string {
  const today = new Date().toLocaleDateString('en-IN')
  
  switch (type) {
    case 'sale':
      return `SALE DEED

THIS SALE DEED is made and executed on ${today}

BETWEEN

${inputs.sellerName || '[SELLER NAME]'} (hereinafter called the "SELLER")
Address: ${inputs.sellerAddress || '[SELLER ADDRESS]'}

AND

${inputs.buyerName || '[BUYER NAME]'} (hereinafter called the "PURCHASER")
Address: ${inputs.buyerAddress || '[BUYER ADDRESS]'}

PROPERTY DETAILS:
${inputs.propertyDescription || '[PROPERTY DESCRIPTION]'}

SALE CONSIDERATION:
The total sale consideration is Rs. ${inputs.saleAmount || '[AMOUNT]'}

ADVANCE PAYMENT:
The PURCHASER has paid Rs. ${inputs.advanceAmount || '0'} as advance.
Balance amount: Rs. ${(parseInt(inputs.saleAmount || '0') - parseInt(inputs.advanceAmount || '0'))}

SELLER: ${inputs.sellerName || '[SELLER NAME]'}

PURCHASER: ${inputs.buyerName || '[BUYER NAME]'}

Date: ${today}`

    case 'rent':
      return `RENTAL AGREEMENT

THIS RENTAL AGREEMENT is made on ${today}

BETWEEN

${inputs.landlordName || '[LANDLORD NAME]'} (hereinafter called the "LANDLORD")

AND

${inputs.tenantName || '[TENANT NAME]'} (hereinafter called the "TENANT")

PROPERTY ADDRESS:
${inputs.propertyAddress || '[PROPERTY ADDRESS]'}

RENTAL TERMS:
Monthly Rent: Rs. ${inputs.monthlyRent || '[RENT AMOUNT]'}
Lease Period: ${inputs.leasePeriod || '[LEASE PERIOD]'}
Security Deposit: Rs. ${inputs.securityDeposit || '[DEPOSIT AMOUNT]'}
Start Date: ${inputs.startDate || '[START DATE]'}

LANDLORD: ${inputs.landlordName || '[LANDLORD NAME]'}

TENANT: ${inputs.tenantName || '[TENANT NAME]'}

Date: ${today}`

    case 'employment':
      return `EMPLOYMENT CONTRACT

THIS EMPLOYMENT CONTRACT is made on ${today}

BETWEEN

${inputs.companyName || '[COMPANY NAME]'} (hereinafter called the "COMPANY")

AND

${inputs.employeeName || '[EMPLOYEE NAME]'} (hereinafter called the "EMPLOYEE")

EMPLOYMENT DETAILS:
Designation: ${inputs.designation || '[DESIGNATION]'}
Salary: Rs. ${inputs.totalSalary || '[SALARY]'}
Joining Date: ${inputs.joiningDate || '[JOINING DATE]'}
Working Hours: ${inputs.workingHours || '[WORKING HOURS]'}

COMPANY: ${inputs.companyName || '[COMPANY NAME]'}

EMPLOYEE: ${inputs.employeeName || '[EMPLOYEE NAME]'}

Date: ${today}`

    case 'nda':
      return `NON-DISCLOSURE AGREEMENT

THIS NON-DISCLOSURE AGREEMENT is made on ${today}

BETWEEN

${inputs.disclosingParty || '[DISCLOSING PARTY]'} (hereinafter called the "DISCLOSING PARTY")

AND

${inputs.receivingParty || '[RECEIVING PARTY]'} (hereinafter called the "RECEIVING PARTY")

AGREEMENT DETAILS:
Purpose: ${inputs.purpose || '[PURPOSE]'}
Duration: ${inputs.agreementTerm || '[DURATION]'}
Information Type: ${inputs.informationNature || '[INFORMATION TYPE]'}

DISCLOSING PARTY: ${inputs.disclosingParty || '[DISCLOSING PARTY]'}

RECEIVING PARTY: ${inputs.receivingParty || '[RECEIVING PARTY]'}

Date: ${today}`

    case 'partnership':
      return `PARTNERSHIP AGREEMENT

THIS PARTNERSHIP AGREEMENT is made on ${today}

BETWEEN

${inputs.partner1Name || '[PARTNER 1 NAME]'} (hereinafter called "FIRST PARTNER")

AND

${inputs.partner2Name || '[PARTNER 2 NAME]'} (hereinafter called "SECOND PARTNER")

PARTNERSHIP DETAILS:
Firm Name: ${inputs.firmName || '[FIRM NAME]'}
Business Nature: ${inputs.businessNature || '[BUSINESS NATURE]'}
Total Capital: Rs. ${inputs.totalCapital || '[TOTAL CAPITAL]'}

FIRST PARTNER: ${inputs.partner1Name || '[PARTNER 1 NAME]'}

SECOND PARTNER: ${inputs.partner2Name || '[PARTNER 2 NAME]'}

Date: ${today}`

    case 'loan':
      return `LOAN AGREEMENT

THIS LOAN AGREEMENT is made on ${today}

BETWEEN

${inputs.lenderName || '[LENDER NAME]'} (hereinafter called the "LENDER")

AND

${inputs.borrowerName || '[BORROWER NAME]'} (hereinafter called the "BORROWER")

LOAN DETAILS:
Loan Amount: Rs. ${inputs.loanAmount || '[LOAN AMOUNT]'}
Interest Rate: ${inputs.interestRate || '[INTEREST RATE]'}% per annum
Tenure: ${inputs.numberOfInstallments || '[TENURE]'} months
Purpose: ${inputs.loanPurpose || '[LOAN PURPOSE]'}

LENDER: ${inputs.lenderName || '[LENDER NAME]'}

BORROWER: ${inputs.borrowerName || '[BORROWER NAME]'}

Date: ${today}`

    default:
      return `LEGAL DOCUMENT

Generated on ${today}

User Data:
${JSON.stringify(inputs, null, 2)}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, inputs } = body
    
    console.log('🚀 Emergency API called with:', { type, inputs })
    
    const content = generateDocument(type, inputs)
    
    console.log('✅ Generated content:', content.substring(0, 100))
    
    return NextResponse.json({
      ok: true,
      content,
      debug: {
        type,
        inputCount: Object.keys(inputs || {}).length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Emergency API error:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to generate document'
    }, { status: 500 })
  }
}