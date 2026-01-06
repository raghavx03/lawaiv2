// Simple test for document generation
const testData = {
  sellerName: 'Rajesh Kumar',
  buyerName: 'Priya Sharma',
  propertyDescription: 'Flat 301, Green Valley Apartments',
  saleAmount: '5000000',
  advanceAmount: '500000'
};

console.log('Test Data:', testData);

// Test template replacement
let template = `SALE DEED

BETWEEN

Sri. {sellerName} (SELLER)

AND

Sri. {buyerName} (PURCHASER)

Property: {propertyDescription}
Sale Amount: Rs. {saleAmount}
Advance: Rs. {advanceAmount}`;

console.log('\nOriginal Template:');
console.log(template);

// Replace placeholders
for (const [key, value] of Object.entries(testData)) {
  const regex = new RegExp(`\\{${key}\\}`, 'g');
  template = template.replace(regex, value);
}

console.log('\nFilled Template:');
console.log(template);