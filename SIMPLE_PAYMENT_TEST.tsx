'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function SimplePaymentTest() {
  const [loading, setLoading] = useState(false)

  const testPayment = async () => {
    setLoading(true)
    console.log('Starting payment test...')

    try {
      // Test 1: Check if API is accessible
      console.log('Testing API endpoint...')
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

      console.log('API Response status:', response.status)
      const data = await response.json()
      console.log('API Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'API call failed')
      }

      // Test 2: Check Razorpay script
      console.log('Checking Razorpay script...')
      if (typeof window.Razorpay === 'undefined') {
        console.log('Loading Razorpay script...')
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          console.log('Razorpay script loaded successfully')
          openRazorpay(data)
        }
        script.onerror = () => {
          console.error('Failed to load Razorpay script')
          alert('Failed to load payment gateway')
        }
        document.head.appendChild(script)
      } else {
        console.log('Razorpay already loaded')
        openRazorpay(data)
      }

    } catch (error) {
      console.error('Payment test error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const openRazorpay = (orderData) => {
    console.log('Opening Razorpay with data:', orderData)
    
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'LAW-AI Test',
      description: 'Test Payment',
      order_id: orderData.orderId,
      handler: function (response) {
        console.log('Payment successful:', response)
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

    // @ts-ignore
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <div className="p-4">
      <Button 
        onClick={testPayment} 
        disabled={loading}
        className="bg-red-500 hover:bg-red-600"
      >
        {loading ? 'Testing...' : 'TEST PAYMENT'}
      </Button>
    </div>
  )
}