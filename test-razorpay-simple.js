const Razorpay = require('razorpay')

// Test Razorpay connection
async function testRazorpay() {
  console.log('🧪 Testing Razorpay connection...')
  
  const keyId = 'rzp_live_RG0L6Hhhx1bRg0'
  const keySecret = 'rDC62KAl4Jt8alHlH9C74yhi'
  
  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
    
    // Test order creation
    const order = await razorpay.orders.create({
      amount: 49900, // ₹499 in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: {
        planType: 'BASIC',
        test: true
      }
    })
    
    console.log('✅ Order created successfully:', order.id)
    console.log('💰 Amount:', order.amount / 100, 'INR')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes('authentication')) {
      console.log('🔑 Check your Razorpay keys')
    }
    if (error.message.includes('network')) {
      console.log('🌐 Check internet connection')
    }
  }
}

testRazorpay()