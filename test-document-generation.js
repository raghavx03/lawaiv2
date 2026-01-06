#!/usr/bin/env node

// Test script for document generation with user data
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testDocumentGeneration() {
  console.log('🧪 Testing Document Generation with User Data...\n');

  // Test data for rental agreement
  const testData = {
    landlordName: 'Rajesh Kumar',
    tenantName: 'Priya Sharma', 
    propertyAddress: 'Flat 301, Green Valley Apartments, Sector 15, Gurgaon',
    monthlyRent: '25000',
    leasePeriod: '11 months',
    securityDeposit: '50000',
    startDate: '1st January 2024'
  };

  console.log('📋 Test Data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n');

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'test-key');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Create a professional Rental Agreement document using the following user data:

User Data:
${Object.entries(testData).map(([key, value]) => `${key}: ${value}`).join('\n')}

Instructions:
1. Replace ALL placeholders with actual user data
2. Fill missing information intelligently based on document type
3. Use proper legal language and formatting
4. Include current date where needed
5. Make it legally sound and professional
6. Generate a complete rental agreement document

Generate the complete document with all user data properly filled in:`;

    console.log('🤖 Generating document with AI...');
    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();
    
    console.log('✅ Document Generated Successfully!\n');
    console.log('📄 Generated Document:');
    console.log('=' .repeat(80));
    console.log(generatedText);
    console.log('=' .repeat(80));
    
    // Check if user data is properly filled
    const dataFilled = Object.values(testData).every(value => 
      generatedText.includes(value)
    );
    
    console.log(`\n✅ User Data Properly Filled: ${dataFilled ? 'YES' : 'NO'}`);
    
    if (!dataFilled) {
      console.log('❌ Missing data:');
      Object.entries(testData).forEach(([key, value]) => {
        if (!generatedText.includes(value)) {
          console.log(`   - ${key}: ${value}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Fallback test with template
    console.log('\n🔄 Testing fallback template method...');
    
    const template = `RENTAL AGREEMENT

THIS RENTAL AGREEMENT is made on ${new Date().toLocaleDateString()}

BETWEEN

{landlordName}, hereinafter called the "LANDLORD"

AND

{tenantName}, hereinafter called the "TENANT"

PROPERTY: {propertyAddress}
MONTHLY RENT: Rs. {monthlyRent}
LEASE PERIOD: {leasePeriod}
SECURITY DEPOSIT: Rs. {securityDeposit}
START DATE: {startDate}

[Rest of the agreement terms...]`;

    let filledTemplate = template;
    Object.entries(testData).forEach(([key, value]) => {
      filledTemplate = filledTemplate.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    
    console.log('📄 Template-based Document:');
    console.log('=' .repeat(50));
    console.log(filledTemplate);
    console.log('=' .repeat(50));
  }
}

// Run test
testDocumentGeneration().catch(console.error);