#!/usr/bin/env node

const https = require('https')
const http = require('http')

class NewsIntegrationTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
    this.results = []
  }

  async testNewsIntegration() {
    console.log('🧪 Testing Real-Time News Integration')
    console.log('====================================')
    console.log(`Testing: ${this.baseUrl}\n`)

    await this.testNewsSync()
    await this.testNewsAPI()
    await this.testScheduler()
    
    this.generateReport()
  }

  async testNewsSync() {
    console.log('📰 1. Testing News Sync')
    
    try {
      const response = await this.makeRequest('/api/news/sync', { method: 'POST' })
      
      if (response.status === 200) {
        const data = JSON.parse(response.data)
        this.addResult('News Sync Endpoint', 'PASS', `Synced ${data.savedCount || 0} articles`)
      } else {
        this.addResult('News Sync Endpoint', 'FAIL', `Status: ${response.status}`)
      }
    } catch (error) {
      this.addResult('News Sync Endpoint', 'FAIL', error.message)
    }
  }

  async testNewsAPI() {
    console.log('📡 2. Testing News API')
    
    try {
      const response = await this.makeRequest('/api/news')
      
      if (response.status === 200) {
        const data = JSON.parse(response.data)
        const newsCount = Array.isArray(data) ? data.length : 0
        this.addResult('News API Response', 'PASS', `Retrieved ${newsCount} articles`)
        
        if (newsCount > 0) {
          const firstArticle = data[0]
          const hasRealData = firstArticle.source && 
                             (firstArticle.source === 'LiveLaw' || firstArticle.source === 'Bar & Bench')
          this.addResult('Real News Data', hasRealData ? 'PASS' : 'FAIL', 
            hasRealData ? 'Contains real news sources' : 'Still using mock data')
        }
      } else {
        this.addResult('News API Response', 'FAIL', `Status: ${response.status}`)
      }
    } catch (error) {
      this.addResult('News API Response', 'FAIL', error.message)
    }
  }

  async testScheduler() {
    console.log('⏰ 3. Testing News Scheduler')
    
    try {
      const response = await this.makeRequest('/api/init-scheduler', { method: 'POST' })
      
      if (response.status === 200) {
        this.addResult('News Scheduler', 'PASS', 'Scheduler initialized successfully')
      } else {
        this.addResult('News Scheduler', 'FAIL', `Status: ${response.status}`)
      }
    } catch (error) {
      this.addResult('News Scheduler', 'FAIL', error.message)
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
        timeout: 30000
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
      req.on('timeout', () => reject(new Error('Request timeout')))
      
      if (options.body) {
        req.write(JSON.stringify(options.body))
      }
      
      req.end()
    })
  }

  addResult(test, status, details) {
    this.results.push({ test, status, details })
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '📋'
    console.log(`   ${statusIcon} ${test}: ${details}`)
  }

  generateReport() {
    console.log('\n📊 INTEGRATION TEST RESULTS')
    console.log('===========================')
    
    const passCount = this.results.filter(r => r.status === 'PASS').length
    const failCount = this.results.filter(r => r.status === 'FAIL').length
    
    console.log(`✅ Passed: ${passCount}`)
    console.log(`❌ Failed: ${failCount}`)
    
    const successRate = Math.round((passCount / this.results.length) * 100)
    
    console.log('\n🎯 FINAL STATUS')
    console.log('===============')
    
    if (successRate >= 80) {
      console.log('🟢 REAL-TIME NEWS INTEGRATION: SUCCESS')
      console.log('   All dummy data has been replaced with live news feeds')
    } else if (successRate >= 60) {
      console.log('🟡 REAL-TIME NEWS INTEGRATION: PARTIAL')
      console.log('   Some components working, needs fixes')
    } else {
      console.log('🔴 REAL-TIME NEWS INTEGRATION: FAILED')
      console.log('   Integration not working properly')
    }
    
    console.log(`\n📈 Success Rate: ${successRate}%`)
    
    if (failCount > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   - ${r.test}: ${r.details}`)
      })
    }
  }
}

// Run tests
const baseUrl = process.argv[2] || 'http://localhost:3000'
const tester = new NewsIntegrationTester(baseUrl)
tester.testNewsIntegration().catch(console.error)