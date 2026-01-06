// Direct API test
const testData = {
  type: 'sale',
  inputs: {
    sellerName: 'Rajesh Kumar',
    buyerName: 'Priya Sharma',
    propertyDescription: 'Flat 301, Green Valley Apartments',
    saleAmount: '5000000',
    advanceAmount: '500000',
    sellerAddress: 'House No. 123, Sector 10, Gurgaon',
    buyerAddress: 'House No. 456, Sector 20, Gurgaon'
  }
};

console.log('🧪 Testing API with data:', testData);

// Test the simple template function directly
const { generateSimpleDocument } = require('./src/lib/simple-templates.ts');

try {
  const result = generateSimpleDocument(testData.type, testData.inputs);
  console.log('\n✅ Direct template test successful!');
  console.log('Generated document:');
  console.log('='.repeat(80));
  console.log(result);
  console.log('='.repeat(80));
} catch (error) {
  console.error('❌ Direct template test failed:', error.message);
}