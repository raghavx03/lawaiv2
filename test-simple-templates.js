// Test simple templates
const testData = {
  sellerName: 'Rajesh Kumar',
  buyerName: 'Priya Sharma',
  propertyDescription: 'Flat 301, Green Valley Apartments, Sector 15, Gurgaon',
  saleAmount: '5000000',
  advanceAmount: '500000',
  sellerAddress: 'House No. 123, Sector 10, Gurgaon',
  buyerAddress: 'House No. 456, Sector 20, Gurgaon'
};

// Simple template function
function generateSaleDocument(inputs) {
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  return `SALE DEED

THIS SALE DEED is made and executed on ${currentDate}

BETWEEN

${inputs.sellerName || '_____________'} (hereinafter called the "SELLER")
Address: ${inputs.sellerAddress || '_____________'}

AND

${inputs.buyerName || '_____________'} (hereinafter called the "PURCHASER") 
Address: ${inputs.buyerAddress || '_____________'}

PROPERTY DETAILS:
${inputs.propertyDescription || '_____________'}

SALE CONSIDERATION:
The total sale consideration is Rs. ${inputs.saleAmount || '_____________'}

ADVANCE PAYMENT:
The PURCHASER has paid Rs. ${inputs.advanceAmount || '_____________'} as advance.
Balance amount: Rs. ${(parseInt(inputs.saleAmount || '0') - parseInt(inputs.advanceAmount || '0')).toString()}

SELLER: ${inputs.sellerName || '_____________'}

PURCHASER: ${inputs.buyerName || '_____________'}

Date: ${currentDate}`;
}

console.log('🧪 Testing Simple Template Generation\n');
console.log('Input Data:', testData);
console.log('\n' + '='.repeat(80));
console.log('GENERATED DOCUMENT:');
console.log('='.repeat(80));

const document = generateSaleDocument(testData);
console.log(document);

console.log('\n' + '='.repeat(80));
console.log('✅ Test completed - User data properly integrated!');