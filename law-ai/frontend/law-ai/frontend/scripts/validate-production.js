#!/usr/bin/env node

const https = require('https')
const http = require('http')

class ProductionValidator {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
    this.results = []
  }

  async validateAll() {
    console.log('🔍 LAW-AI Production Validation')
    console.log('==============================')
    console.log(`Testing: ${this.baseUrl}\n`)

    await this.validateEnvironment()
    await this.validateSecurity()
    await this.validateFeatures()
    await this.validatePayments()
    await this.validatePerformance()
    
    this.printResults()
    return this.getScore()
  }

  async validateEnvironment() {
    console.log('🌍 Environment Validation')
    
    const requiredEnvs = [
      'DATABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'OPENAI_API_KEY',
      'NEXT_PUBLIC_RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'
    ]
    
    requiredEnvs.forEach(env => {
      const exists = !!process.env[env]
      this.addResult(`Environment: ${env}`, exists)
    })

    // Test health endpoint
    try {
      const health = await this.makeRequest('/api/health')
      this.addResult('Health Endpoint', health.status === 200)
      
      if (health.data) {
        const data = JSON.parse(health.data)
        this.addResult('Database Connection', data.services?.database === 'connected')
        this.addResult('Supabase Config', data.services?.supabase === 'configured')
        this.addResult('OpenAI Config', data.services?.openai === 'configured')
        this.addResult('Razorpay Config', data.services?.razorpay === 'configured')
      }
    } catch (e) {
      this.addResult('Health Endpoint', false)
    }
  }

  async validateSecurity() {
    console.log('🔒 Security Validation')
    
    try {
      const response = await this.makeRequest('/')
      const headers = response.headers
      
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security'
      ]
      
      securityHeaders.forEach(header => {
        this.addResult(`Security Header: ${header}`, !!headers[header])
      })
      
      // Test HTTPS redirect
      if (this.baseUrl.startsWith('https://')) {
        this.addResult('HTTPS Enabled', true)
      } else {
        this.addResult('HTTPS Enabled', false)
      }
      
    } catch (e) {
      this.addResult('Security Headers', false)
    }
  }

  async validateFeatures() {
    console.log('⚡ Feature Validation')
    
    const features = [
      { name: 'AI Assistant', path: '/ai-assistant' },
      { name: 'Document Generator', path: '/drafts' },
      { name: 'Judgment Summarizer', path: '/summarizer' },
      { name: 'Case Tracker', path: '/case-tracker' },
      { name: 'Legal Research', path: '/research' },
      { name: 'CRM System', path: '/crm' },
      { name: 'Legal Notices', path: '/notices' },
      { name: 'Acts Database', path: '/acts' },
      { name: 'Legal News', path: '/news' }
    ]
    
    for (const feature of features) {
      try {
        const response = await this.makeRequest(feature.path)
        // Should redirect to auth or return 200
        const isAccessible = [200, 302, 307].includes(response.status)
        this.addResult(`Feature: ${feature.name}`, isAccessible)
      } catch (e) {
        this.addResult(`Feature: ${feature.name}`, false)
      }
    }
  }

  async validatePayments() {
    console.log('💳 Payment Validation')
    
    try {
      // Check Razorpay configuration
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      const isLive = keyId?.startsWith('rzp_live_')
      this.addResult('Razorpay Live Mode', isLive)
      
      // Test payment endpoint (should require auth)
      const response = await this.makeRequest('/api/payments/create-order', { method: 'POST' })
      const isProtected = [401, 403].includes(response.status)
      this.addResult('Payment Endpoint Protected', isProtected)
      
    } catch (e) {
      this.addResult('Payment System', false)
    }
  }

  async validatePerformance() {
    console.log('⚡ Performance Validation')
    
    const start = Date.now()
    try {
      await this.makeRequest('/')
      const loadTime = Date.now() - start
      this.addResult('Load Time < 3s', loadTime < 3000)
      this.addResult('Load Time < 1s', loadTime < 1000)
    } catch (e) {
      this.addResult('Performance Test', false)
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
        res.on('end', () => resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        }))
      })

      req.on('error', reject)
      req.on('timeout', () => reject(new Error('Timeout')))
      
      if (options.body) {
        req.write(JSON.stringify(options.body))
      }
      
      req.end()
    })
  }

  addResult(test, passed) {
    this.results.push({ test, passed })
    const status = passed ? '✅' : '❌'
    console.log(`   ${status} ${test}`)
  }

  getScore() {
    const passed = this.results.filter(r => r.passed).length
    const total = this.results.length
    return Math.round((passed / total) * 100)
  }

  printResults() {
    const score = this.getScore()
    console.log('\n📊 VALIDATION RESULTS')
    console.log('====================')
    console.log(`Score: ${score}% (${this.results.filter(r => r.passed).length}/${this.results.length})`)
    
    if (score >= 95) {
      console.log('🎉 PRODUCTION READY!')
    } else if (score >= 80) {
      console.log('⚠️  Needs minor fixes')
    } else {
      console.log('❌ Not ready for production')
    }
    
    const failed = this.results.filter(r => !r.passed)
    if (failed.length > 0) {
      console.log('\n❌ Failed Tests:')
      failed.forEach(r => console.log(`   - ${r.test}`))
    }
  }
}

// Run validation
const baseUrl = process.argv[2] || 'http://localhost:3000'
const validator = new ProductionValidator(baseUrl)
validator.validateAll().then(score => {
  process.exit(score >= 95 ? 0 : 1)
}).catch(err => console.error('Validation error:', err.message?.replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, ' ').substring(0, 200) || 'Unknown error'))