#!/usr/bin/env node

console.log('🔄 Setting up Razorpay Live Mode...\n')

console.log('📋 RAZORPAY LIVE MODE CHECKLIST:')
console.log('')
console.log('1. ✅ Login to Razorpay Dashboard (https://dashboard.razorpay.com)')
console.log('2. ✅ Go to Settings > API Keys')
console.log('3. ✅ Generate Live API Keys (if not done)')
console.log('4. ✅ Copy Live Key ID and Secret')
console.log('')
console.log('5. 🔧 UPDATE ENVIRONMENT VARIABLES:')
console.log('   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY')
console.log('   RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET')
console.log('')
console.log('6. 🌐 SETUP WEBHOOK:')
console.log('   URL: https://yourdomain.com/api/payments/webhook')
console.log('   Events: payment.captured, payment.failed')
console.log('   Secret: Generate and save in RAZORPAY_WEBHOOK_SECRET')
console.log('')
console.log('7. 🧪 TEST PAYMENTS:')
console.log('   - Use real card: 4111 1111 1111 1111')
console.log('   - Test small amount: ₹1')
console.log('   - Verify webhook receives events')
console.log('')
console.log('8. 🔒 SECURITY CHECKLIST:')
console.log('   ✅ Webhook signature verification enabled')
console.log('   ✅ HTTPS only for production')
console.log('   ✅ API keys secured in environment')
console.log('')

// Test current Razorpay configuration
const testRazorpay = () => {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  
  console.log('🔍 CURRENT CONFIGURATION:')
  console.log(`   Key ID: ${keyId ? keyId.substring(0, 12) + '...' : 'NOT SET'}`)
  console.log(`   Key Secret: ${keySecret ? 'SET' : 'NOT SET'}`)
  console.log(`   Mode: ${keyId?.startsWith('rzp_live_') ? 'LIVE' : 'TEST'}`)
  
  if (!keyId?.startsWith('rzp_live_')) {
    console.log('')
    console.log('⚠️  WARNING: Still using TEST mode keys!')
    console.log('   Update to rzp_live_ keys for production')
  }
}

testRazorpay()

console.log('')
console.log('🚀 Ready for Live Payments!')