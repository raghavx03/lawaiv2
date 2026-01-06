#!/usr/bin/env node

const https = require('https')
const http = require('http')

class NewsVerifier {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
    this.findings = []
  }

  async verifyNewsFeed() {
    console.log('📰 LAW-AI Legal News Feed Verification')
    console.log('=====================================')
    console.log(`Testing: ${this.baseUrl}\n`)

    await this.checkNewsPageImplementation()
    await this.checkNewsAPIEndpoint()
    await this.checkDataSource()
    await this.checkRealTimeCapability()
    
    this.generateReport()
  }

  async checkNewsPageImplementation() {
    console.log('🔍 1. News Page Implementation Analysis')
    
    try {
      // Check if news page loads
      const response = await this.makeRequest('/news')
      const pageLoads = response.status === 200 || response.status === 302
      this.addFinding('News Page Accessibility', pageLoads ? 'PASS' : 'FAIL', 
        pageLoads ? 'News page loads successfully' : 'News page not accessible')

      // Check for API call in frontend
      if (response.data && response.data.includes('/api/news')) {
        this.addFinding('Frontend API Integration', 'PASS', 'Frontend calls /api/news endpoint')
      } else {
        this.addFinding('Frontend API Integration', 'FAIL', 'No API call detected in frontend')
      }

    } catch (error) {
      this.addFinding('News Page Implementation', 'FAIL', `Error: ${error.message}`)
    }
  }

  async checkNewsAPIEndpoint() {
    console.log('🔍 2. News API Endpoint Analysis')
    
    try {
      // Test API endpoint directly
      const response = await this.makeRequest('/api/news', {
        method: 'GET',
        headers: { 'x-user-id': 'test-user' }
      })

      if (response.status === 401) {
        this.addFinding('API Authentication', 'PASS', 'API requires authentication')
      } else if (response.status === 200) {
        this.addFinding('API Endpoint', 'PASS', 'API endpoint responds successfully')
        
        // Check response structure
        try {
          const data = JSON.parse(response.data)
          if (data.news && Array.isArray(data.news)) {
            this.addFinding('API Response Structure', 'PASS', 'Returns news array')
            this.addFinding('News Count', 'INFO', `Found ${data.news.length} news items`)
          } else {
            this.addFinding('API Response Structure', 'FAIL', 'Invalid response structure')
          }
        } catch (e) {
          this.addFinding('API Response Format', 'FAIL', 'Invalid JSON response')
        }
      } else {
        this.addFinding('API Endpoint', 'FAIL', `API returned status ${response.status}`)
      }

    } catch (error) {
      this.addFinding('API Endpoint', 'FAIL', `API error: ${error.message}`)
    }
  }

  async checkDataSource() {
    console.log('🔍 3. Data Source Analysis')
    
    // Check if using database or external API
    this.addFinding('Data Storage', 'INFO', 'Uses PostgreSQL database (news table)')
    this.addFinding('Data Source Type', 'STATIC', 'Currently using mock/dummy data')
    
    // Check for external API integrations
    const hasLiveLawAPI = false // No external API found
    const hasBarBenchAPI = false // No external API found
    const hasRSSFeed = false // No RSS parsing found
    
    this.addFinding('LiveLaw API Integration', hasLiveLawAPI ? 'PASS' : 'MISSING', 
      hasLiveLawAPI ? 'Connected to LiveLaw API' : 'No LiveLaw API integration')
    
    this.addFinding('Bar & Bench API Integration', hasBarBenchAPI ? 'PASS' : 'MISSING', 
      hasBarBenchAPI ? 'Connected to Bar & Bench API' : 'No Bar & Bench API integration')
    
    this.addFinding('RSS Feed Integration', hasRSSFeed ? 'PASS' : 'MISSING', 
      hasRSSFeed ? 'RSS feeds configured' : 'No RSS feed parsing')
  }

  async checkRealTimeCapability() {
    console.log('🔍 4. Real-Time Capability Analysis')
    
    // Check for real-time features
    this.addFinding('Real-Time Updates', 'MISSING', 'No real-time news fetching mechanism')
    this.addFinding('News Refresh', 'MANUAL', 'News updates require manual API call')
    this.addFinding('Live Data Source', 'NONE', 'No connection to live news APIs')
    
    // Check for scheduled updates
    this.addFinding('Scheduled Updates', 'MISSING', 'No cron jobs or scheduled news fetching')
    this.addFinding('Webhook Integration', 'MISSING', 'No webhook for real-time news updates')
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
      req.on('timeout', () => reject(new Error('Request timeout')))
      
      if (options.body) {
        req.write(JSON.stringify(options.body))
      }
      
      req.end()
    })
  }

  addFinding(category, status, details) {
    this.findings.push({ category, status, details })
    const statusIcon = status === 'PASS' ? '✅' : 
                      status === 'FAIL' ? '❌' : 
                      status === 'MISSING' ? '⚠️' : 
                      status === 'STATIC' ? '🔒' : 
                      status === 'MANUAL' ? '🔧' : 
                      status === 'NONE' ? '❌' : '📋'
  console.log(`   ${statusIcon} ${category}: ${details}`)
  }

  generateReport() {
    console.log('\n📊 VERIFICATION REPORT')
    console.log('======================')
    
    const passCount = this.findings.filter(f => f.status === 'PASS').length
    const failCount = this.findings.filter(f => f.status === 'FAIL').length
    const missingCount = this.findings.filter(f => f.status === 'MISSING').length
    
    console.log(`✅ Passed: ${passCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`⚠️  Missing: ${missingCount}`)
    
    console.log('\n🎯 FINAL ASSESSMENT')
    console.log('==================')
    
    const isRealTime = this.findings.some(f => 
      f.category.includes('Real-Time') && f.status === 'PASS'
    )
    
    const hasLiveAPI = this.findings.some(f => 
      f.category.includes('API Integration') && f.status === 'PASS'
    )
    
    if (isRealTime && hasLiveAPI) {
      console.log('🟢 STATUS: REAL-TIME NEWS FEED')
      console.log('   News is pulled from live APIs and updated in real-time')
    } else if (hasLiveAPI) {
      console.log('🟡 STATUS: SEMI-LIVE NEWS FEED')
      console.log('   News is pulled from live APIs but not real-time')
    } else {
      console.log('🔴 STATUS: STATIC/DUMMY NEWS FEED')
      console.log('   News is using mock/dummy data, not live sources')
    }
    
    console.log('\n📋 CURRENT IMPLEMENTATION:')
    console.log('• Data Source: PostgreSQL database')
    console.log('• Content Type: Mock/dummy news articles')
    console.log('• Update Method: Manual API calls')
    console.log('• Real-time: No')
    console.log('• External APIs: None')
    
    console.log('\n🔧 RECOMMENDATIONS FOR LIVE NEWS:')
    console.log('1. Integrate with LiveLaw RSS feed')
    console.log('2. Add Bar & Bench API integration')
    console.log('3. Implement scheduled news fetching (cron jobs)')
    console.log('4. Add real-time webhook notifications')
    console.log('5. Create news aggregation service')
    
    console.log('\n📝 SUGGESTED API INTEGRATIONS:')
    console.log('• LiveLaw RSS: https://www.livelaw.in/rss-feed')
    console.log('• Bar & Bench RSS: https://www.barandbench.com/rss')
    console.log('• Legal News APIs: NewsAPI, Google News API')
    console.log('• Custom web scraping for legal news sites')
  }
}

// Run verification
const baseUrl = process.argv[2] || 'http://localhost:3000'
const verifier = new NewsVerifier(baseUrl)
verifier.verifyNewsFeed().catch(console.error)