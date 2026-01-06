// Browser console में यह code run करें payment test के लिए:

async function testPayment() {
  console.log('🔍 Testing payment system...')
  
  try {
    // Test API call
    console.log('📡 Calling API...')
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planType: 'BASIC',
        amount: 499
      })
    })
    
    console.log('📊 Response status:', response.status)
    const data = await response.json()
    console.log('📋 Response data:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'API failed')
    }
    
    // Test Razorpay
    console.log('💳 Testing Razorpay...')
    if (typeof window.Razorpay === 'undefined') {
      console.log('📥 Loading Razorpay script...')
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        console.log('✅ Razorpay loaded')
        openPayment(data)
      }
      script.onerror = () => {
        console.error('❌ Razorpay script failed')
      }
      document.head.appendChild(script)
    } else {
      console.log('✅ Razorpay already available')
      openPayment(data)
    }
    
  } catch (error) {
    console.error('❌ Payment test failed:', error)
  }
}

function openPayment(orderData) {
  console.log('🚀 Opening Razorpay with:', orderData)
  
  const options = {
    key: orderData.keyId,
    amount: orderData.amount,
    currency: orderData.currency,
    name: 'LAW-AI Test',
    description: 'Test Payment',
    order_id: orderData.orderId,
    handler: function (response) {
      console.log('✅ Payment success:', response)
      alert('Payment successful!')
    },
    prefill: {
      name: 'Test User',
      email: 'test@example.com',
    },
    theme: {
      color: '#3B82F6'
    }
  }
  
  const rzp = new window.Razorpay(options)
  rzp.open()
}

// Run the test
testPayment()