'use client'

const PLANS = {
  BASIC: { price: 499, name: 'Basic Plan' },
  PLUS: { price: 999, name: 'Plus Plan' },
  PRO: { price: 1499, name: 'Pro Plan' }
} as const

declare global {
  interface Window {
    Razorpay: any
  }
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: any) => void
  prefill: {
    name: string
    email: string
  }
  theme: {
    color: string
  }
  modal: {
    ondismiss: () => void
  }
}

export class RazorpayService {
  static loadScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  static async createOrder(plan: keyof typeof PLANS, userId: string) {
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan, userId }),
    })

    if (!response.ok) {
      throw new Error('Failed to create order')
    }

    return response.json()
  }

  static async openCheckout(options: RazorpayOptions): Promise<void> {
    const isLoaded = await this.loadScript()
    
    if (!isLoaded) {
      throw new Error('Razorpay SDK failed to load')
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  static async verifyPayment(paymentData: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      throw new Error('Payment verification failed')
    }

    return response.json()
  }
}