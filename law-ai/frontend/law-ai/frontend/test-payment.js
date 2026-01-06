// Test Razorpay payment integration
const testPayment = async () => {
  console.log('🧪 Testing Razorpay Payment Integration...')
  
  // Test 1: Check environment variables
  console.log('\n1️⃣ Checking Environment Variables:')
  console.log('RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing')
  console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing')
  
  // Test 2: Test order creation API
  console.log('\n2️⃣ Testing Order Creation API:')
  try {
    const response = await fetch('http://localhost:3000/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planType: 'BASIC',
        amount: 499
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Order creation successful:', data)
    } else {
      console.log('❌ Order creation failed:', data)
    }
  } catch (error) {
    console.log('❌ Order creation error:', error.message)
  }
  
  // Test 3: Check Razorpay script loading
  console.log('\n3️⃣ Checking Razorpay Script:')
  if (typeof window !== 'undefined') {
    if (window.Razorpay) {
      console.log('✅ Razorpay script loaded')
    } else {
      console.log('❌ Razorpay script not loaded')
    }
  } else {
    console.log('⚠️ Running in Node.js environment')
  }
}

// Run test if in browser
if (typeof window !== 'undefined') {
  testPayment()
} else {
  console.log('Run this script in browser console on localhost:3000')
}

module.exports = { testPayment }