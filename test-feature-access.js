// Test script to verify feature access logic
const { hasFeatureAccess } = require('./src/lib/feature-access.ts')

console.log('Testing Feature Access Logic:')
console.log('FREE plan with AI_ASSISTANT:', hasFeatureAccess('FREE', 'AI_ASSISTANT'))
console.log('FREE plan with CASE_TRACKER:', hasFeatureAccess('FREE', 'CASE_TRACKER'))
console.log('PRO plan with CASE_TRACKER:', hasFeatureAccess('PRO', 'CASE_TRACKER'))
console.log('PLUS plan with NEWS:', hasFeatureAccess('PLUS', 'NEWS'))
console.log('BASIC plan with CRM:', hasFeatureAccess('BASIC', 'CRM'))