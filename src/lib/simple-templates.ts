// Simple working templates with guaranteed data integration

export const SIMPLE_TEMPLATES = {
  sale: {
    name: 'Sale Deed',
    generate: (inputs: Record<string, string>) => {
      const currentDate = new Date().toLocaleDateString('en-IN')
      
      return `SALE DEED

THIS SALE DEED is made and executed on ${currentDate}

BETWEEN

${inputs.sellerName || '_____________'} (hereinafter called the "SELLER")
Address: ${inputs.sellerAddress || '_____________'}

AND

${inputs.buyerName || '_____________'} (hereinafter called the "PURCHASER") 
Address: ${inputs.buyerAddress || '_____________'}

WHEREAS the SELLER is the absolute owner of the property described below and desires to sell the same to the PURCHASER.

PROPERTY DETAILS:
${inputs.propertyDescription || '_____________'}

SALE CONSIDERATION:
The total sale consideration is Rs. ${inputs.saleAmount || '_____________'} (Rupees ${numberToWords(parseInt(inputs.saleAmount || '0'))} only).

ADVANCE PAYMENT:
The PURCHASER has paid Rs. ${inputs.advanceAmount || '_____________'} as advance.
Balance amount: Rs. ${(parseInt(inputs.saleAmount || '0') - parseInt(inputs.advanceAmount || '0')).toString()}

TERMS AND CONDITIONS:
1. The SELLER has clear and marketable title to the property
2. The property is free from all encumbrances
3. Possession will be handed over on registration
4. All registration expenses to be borne by the PURCHASER

IN WITNESS WHEREOF both parties have signed this deed.

SELLER: ${inputs.sellerName || '_____________'}

PURCHASER: ${inputs.buyerName || '_____________'}

Date: ${currentDate}`
    }
  },

  rent: {
    name: 'Rental Agreement',
    generate: (inputs: Record<string, string>) => {
      const currentDate = new Date().toLocaleDateString('en-IN')
      
      return `RENTAL AGREEMENT

THIS RENTAL AGREEMENT is made on ${currentDate}

BETWEEN

${inputs.landlordName || '_____________'} (hereinafter called the "LANDLORD")

AND

${inputs.tenantName || '_____________'} (hereinafter called the "TENANT")

PROPERTY DETAILS:
${inputs.propertyAddress || '_____________'}

RENTAL TERMS:
1. Monthly Rent: Rs. ${inputs.monthlyRent || '_____________'}
2. Security Deposit: Rs. ${inputs.securityDeposit || '_____________'}
3. Lease Period: ${inputs.leasePeriod || '_____________'}
4. Start Date: ${inputs.startDate || '_____________'}

TERMS AND CONDITIONS:
1. Rent payable on or before 5th of each month
2. Tenant responsible for electricity and water bills
3. No subletting without landlord's consent
4. Property to be used for residential purposes only
5. Either party can terminate with 30 days notice

LANDLORD: ${inputs.landlordName || '_____________'}

TENANT: ${inputs.tenantName || '_____________'}

Date: ${currentDate}`
    }
  },

  employment: {
    name: 'Employment Contract',
    generate: (inputs: Record<string, string>) => {
      const currentDate = new Date().toLocaleDateString('en-IN')
      
      return `EMPLOYMENT AGREEMENT

THIS EMPLOYMENT AGREEMENT is made on ${currentDate}

BETWEEN

${inputs.companyName || '_____________'} (hereinafter called the "COMPANY")

AND

${inputs.employeeName || '_____________'} (hereinafter called the "EMPLOYEE")

EMPLOYMENT DETAILS:
1. Position: ${inputs.designation || '_____________'}
2. Salary: Rs. ${inputs.totalSalary || '_____________'} per month
3. Joining Date: ${inputs.joiningDate || '_____________'}
4. Working Hours: ${inputs.workingHours || '9'} hours per day

TERMS AND CONDITIONS:
1. Employee shall work diligently and honestly
2. Confidentiality to be maintained
3. Either party can terminate with 30 days notice
4. Employee entitled to leave as per company policy

COMPANY: ${inputs.companyName || '_____________'}

EMPLOYEE: ${inputs.employeeName || '_____________'}

Date: ${currentDate}`
    }
  },

  nda: {
    name: 'Non-Disclosure Agreement',
    generate: (inputs: Record<string, string>) => {
      const currentDate = new Date().toLocaleDateString('en-IN')
      
      return `NON-DISCLOSURE AGREEMENT

THIS NON-DISCLOSURE AGREEMENT is made on ${currentDate}

BETWEEN

${inputs.disclosingParty || '_____________'} (hereinafter called the "DISCLOSING PARTY")

AND

${inputs.receivingParty || '_____________'} (hereinafter called the "RECEIVING PARTY")

PURPOSE: ${inputs.purpose || '_____________'}

CONFIDENTIAL INFORMATION:
The information relates to: ${inputs.informationNature || '_____________'}

OBLIGATIONS:
1. Receiving Party shall keep all information confidential
2. Information not to be disclosed to third parties
3. Information to be used only for stated purpose
4. Agreement valid for: ${inputs.agreementTerm || '_____________'}

DISCLOSING PARTY: ${inputs.disclosingParty || '_____________'}

RECEIVING PARTY: ${inputs.receivingParty || '_____________'}

Date: ${currentDate}`
    }
  },

  partnership: {
    name: 'Partnership Agreement',
    generate: (inputs: Record<string, string>) => {
      const currentDate = new Date().toLocaleDateString('en-IN')
      
      return `PARTNERSHIP AGREEMENT

THIS PARTNERSHIP AGREEMENT is made on ${currentDate}

BETWEEN

${inputs.partner1Name || '_____________'} (FIRST PARTNER)

AND

${inputs.partner2Name || '_____________'} (SECOND PARTNER)

BUSINESS DETAILS:
1. Firm Name: ${inputs.firmName || '_____________'}
2. Business Nature: ${inputs.businessNature || '_____________'}
3. Total Capital: Rs. ${inputs.totalCapital || '_____________'}

TERMS:
1. Profits and losses to be shared equally
2. Both partners have equal management rights
3. No partner can bind the firm without other's consent
4. Partnership can be dissolved by mutual consent

FIRST PARTNER: ${inputs.partner1Name || '_____________'}

SECOND PARTNER: ${inputs.partner2Name || '_____________'}

Date: ${currentDate}`
    }
  },

  loan: {
    name: 'Loan Agreement',
    generate: (inputs: Record<string, string>) => {
      const currentDate = new Date().toLocaleDateString('en-IN')
      const amount = parseInt(inputs.loanAmount || '0')
      const rate = parseFloat(inputs.interestRate || '12')
      const tenure = parseInt(inputs.numberOfInstallments || '12')
      
      return `LOAN AGREEMENT

THIS LOAN AGREEMENT is made on ${currentDate}

BETWEEN

${inputs.lenderName || '_____________'} (hereinafter called the "LENDER")

AND

${inputs.borrowerName || '_____________'} (hereinafter called the "BORROWER")

LOAN DETAILS:
1. Loan Amount: Rs. ${inputs.loanAmount || '_____________'}
2. Interest Rate: ${inputs.interestRate || '_____________'}% per annum
3. Tenure: ${inputs.numberOfInstallments || '_____________'} months
4. Purpose: ${inputs.loanPurpose || '_____________'}

REPAYMENT:
Monthly installments to be paid on or before 5th of each month.

TERMS:
1. Borrower shall use loan only for stated purpose
2. Default in payment will attract penalty
3. Lender has right to recover amount with interest

LENDER: ${inputs.lenderName || '_____________'}

BORROWER: ${inputs.borrowerName || '_____________'}

Date: ${currentDate}`
    }
  }
}

export function generateSimpleDocument(type: string, inputs: Record<string, string>): string {
  const template = SIMPLE_TEMPLATES[type as keyof typeof SIMPLE_TEMPLATES]
  if (!template) {
    throw new Error('Invalid document type')
  }
  
  console.log('🔧 Generating simple document with inputs:', inputs)
  const document = template.generate(inputs)
  console.log('✅ Simple document generated, length:', document.length)
  
  return document
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero'
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  
  if (num < 10) return ones[num]
  if (num < 20) return teens[num - 10]
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '')
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '')
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '')
  
  return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '')
}