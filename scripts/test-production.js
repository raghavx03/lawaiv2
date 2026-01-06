#!/usr/bin/env node

const https = require('https')
const http = require('http')

class ProductionTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.results = []
  }

  async runAllTests() {
    console.log('🧪 LAW-AI Production Testing Suite')
    console.log('==================================')
    console.log(`Testing: ${this.baseUrl}\n`)

    // 1. Basic Health Checks
    await this.testHealthEndpoint()
    await this.testSSLCertificate()
    await this.testSecurityHeaders()

    // 2. Authentication Tests
    await this.testAuthEndpoints()

    // 3. API Endpoint Tests
    await this.testAPIEndpoints()

    // 4. Payment System Tests
    await this.testPaymentEndpoints()

    // 5. Feature Tests
    await this.testFeatureEndpoints()

    // 6. Performance Tests
    await this.testPerformance()

    this.printResults()
  }

  async testHealthEndpoint() {
    console.log('🏥 Health Check Tests')
    
    try {
      const response = await this.makeRequest('/api/health')
      this.addResult('Health Endpoint', response.status === 200, `Status: ${response.status}`)
    } catch (error) {
      this.addResult('Health Endpoint', false, error.message)
    }
  }

  async testSSLCertificate() {
    console.log('🔒 SSL Certificate Tests')
    
    if (!this.baseUrl.startsWith('https://')) {
      this.addResult('SSL Certificate', false, 'Not using HTTPS')
      return
    }

    try {
      const response = await this.makeRequest('/')
      this.addResult('SSL Certificate', true, 'HTTPS working')
    } catch (error) {
      this.addResult('SSL Certificate', false, error.message)
    }
  }

  async testSecurityHeaders() {
    console.log('🛡️  Security Headers Tests')
    
    try {
      const response = await this.makeRequest('/api/health', { method: 'GET' })
      const headers = response.headers
      
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options', 
        'x-xss-protection'
      ]

      securityHeaders.forEach(header => {
        const exists = headers[header] !== undefined
        this.addResult(`Security Header: ${header}`, exists, exists ? headers[header] : 'Missing')
      })
    } catch (error) {
      this.addResult('Security Headers', false, error.message)
    }
  }

  async testAuthEndpoints() {
    console.log('🔐 Authentication Tests')
    
    const authEndpoints = [
      '/api/auth/callback',
      '/api/user/profile'
    ]

    for (const endpoint of authEndpoints) {
      try {
        const response = await this.makeRequest(endpoint)
        // Should return 401 or redirect for unauthenticated requests
        const isProtected = response.status === 401 || response.status === 302 || response.status === 307
        this.addResult(`Auth Protection: ${endpoint}`, isProtected, `Status: ${response.status}`)
      } catch (error) {
        this.addResult(`Auth Protection: ${endpoint}`, false, error.message)
      }
    }
  }

  async testAPIEndpoints() {
    console.log('🔌 API Endpoint Tests')
    
    const apiEndpoints = [
      '/api/health',
      '/api/chat-enhanced',
      '/api/summarizer',
      '/api/payments/create-order',
      '/api/drafts',
      '/api/research'
    ]

    for (const endpoint of apiEndpoints) {
      try {
        const response = await this.makeRequest(endpoint, { method: 'POST' })
        // Should return proper error codes, not 500
        const isWorking = response.status !== 500
        this.addResult(`API Endpoint: ${endpoint}`, isWorking, `Status: ${response.status}`)
      } catch (error) {
        this.addResult(`API Endpoint: ${endpoint}`, false, error.message)
      }
    }
  }

  async testPaymentEndpoints() {
    console.log('💳 Payment System Tests')
    
    try {
      // Test Razorpay key configuration
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      const isLiveMode = keyId && keyId.startsWith('rzp_live_')
      this.addResult('Razorpay Live Mode', isLiveMode, keyId ? `Key: ${keyId.substring(0, 12)}...` : 'Key not set')

      // Test payment endpoints
      const response = await this.makeRequest('/api/payments/create-order', { method: 'POST' })
      const isProtected = response.status === 401 || response.status === 403
      this.addResult('Payment Endpoint Protection', isProtected, `Status: ${response.status}`)
    } catch (error) {
      this.addResult('Payment System', false, error.message)
    }
  }

  async testFeatureEndpoints() {
    console.log('⚡ Feature Tests')
    
    const features = [
      'AI Assistant',
      'Document Generator', 
      'Judgment Summarizer',
      'Case Tracker',
      'Legal Research',
      'CRM System',
      'Legal Notices',
      'Acts Database',
      'Legal News'
    ]

    // Test that all 9 features are accessible (should require auth)
    const featureEndpoints = [
      '/ai-assistant',
      '/drafts',
      '/summarizer', 
      '/case-tracker',
      '/research',
      '/crm',
      '/notices',
      '/acts',
      '/news'
    ]

    for (let i = 0; i < featureEndpoints.length; i++) {
      try {
        const response = await this.makeRequest(featureEndpoints[i])
        const isAccessible = response.status === 200 || response.status === 302 || response.status === 307
        this.addResult(`Feature: ${features[i]}`, isAccessible, `Status: ${response.status}`)
      } catch (error) {
        this.addResult(`Feature: ${features[i]}`, false, error.message)
      }
    }
  }

  async testPerformance() {
    console.log('⚡ Performance Tests')
    
    const start = Date.now()
    try {
      await this.makeRequest('/')
      const loadTime = Date.now() - start
      const isFast = loadTime < 3000 // Under 3 seconds
      this.addResult('Page Load Time', isFast, `${loadTime}ms`)
    } catch (error) {
      this.addResult('Page Load Time', false, error.message)
    }
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`
      const isHttps = url.startsWith('https://')
      const client = isHttps ? https : http
      
      const req = client.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 10000
      }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          })
        })
      })

      req.on('error', reject)
      req.on('timeout', () => reject(new Error('Request timeout')))
      
      if (options.body) {
        req.write(JSON.stringify(options.body))
      }
      
      req.end()
    })
  }

  addResult(test, passed, details) {
    this.results.push({ test, passed, details })
    const status = passed ? '✅' : '❌'
    console.log(`   ${status} ${test}: ${details}`)
  }

  printResults() {
    console.log('\n📊 Test Results Summary')
    console.log('========================')
    
    const passed = this.results.filter(r => r.passed).length
    const total = this.results.length
    const percentage = Math.round((passed / total) * 100)
    
    console.log(`Passed: ${passed}/${total} (${percentage}%)`)
    
    if (percentage >= 90) {
      console.log('🎉 Production Ready!')
    } else if (percentage >= 70) {
      console.log('⚠️  Needs attention before production')
    } else {
      console.log('❌ Not ready for production')
    }

    console.log('\nFailed Tests:')
    this.results.filter(r => !r.passed).forEach(r => {
      console.log(`   ❌ ${r.test}: ${r.details}`)
    })
  }
}

// Run tests
const baseUrl = process.argv[2] || 'http://localhost:3000'
const tester = new ProductionTester(baseUrl)
tester.runAllTests().catch(console.error)