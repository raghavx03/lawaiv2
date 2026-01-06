#!/usr/bin/env node

// Mobile Testing Script for LAW-AI
console.log('📱 LAW-AI Mobile Testing Script\n')

const testUrls = [
  'https://lawai.ragspro.com',
  'https://lawai.ragspro.com/auth/signup',
  'https://lawai.ragspro.com/auth/login',
  'https://lawai.ragspro.com/dashboard',
  'https://lawai.ragspro.com/ai-assistant',
  'https://lawai.ragspro.com/case-tracker',
  'https://lawai.ragspro.com/api/health'
]

async function testUrl(url) {
  try {
    console.log(`🔍 Testing: ${url}`)
    
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    })
    
    const status = response.status
    const statusText = response.statusText
    
    if (status === 200) {
      console.log(`  ✅ ${status} ${statusText}`)
    } else if (status === 404) {
      console.log(`  ❌ ${status} Not Found`)
    } else if (status >= 500) {
      console.log(`  🚨 ${status} Server Error`)
    } else {
      console.log(`  ⚠️  ${status} ${statusText}`)
    }
    
    return { url, status, ok: response.ok }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`)
    return { url, status: 0, ok: false, error: error.message }
  }
}

async function runTests() {
  console.log('🚀 Starting mobile compatibility tests...\n')
  
  const results = []
  
  for (const url of testUrls) {
    const result = await testUrl(url)
    results.push(result)
    console.log('')
  }
  
  // Summary
  console.log('📊 Test Summary:')
  console.log('================')
  
  const passed = results.filter(r => r.ok).length
  const failed = results.filter(r => !r.ok).length
  
  console.log(`✅ Passed: ${passed}/${results.length}`)
  console.log(`❌ Failed: ${failed}/${results.length}`)
  
  if (failed > 0) {
    console.log('\n🚨 Failed URLs:')
    results.filter(r => !r.ok).forEach(r => {
      console.log(`  - ${r.url} (${r.status || 'Error'})`)
    })
  }
  
  console.log('\n📱 Manual Mobile Tests Needed:')
  console.log('1. Open https://lawai.ragspro.com on phone')
  console.log('2. Test navigation menu (hamburger)')
  console.log('3. Try signup/login flow')
  console.log('4. Test AI Assistant chat')
  console.log('5. Check Case Tracker functionality')
  console.log('6. Verify all buttons are touch-friendly (44px+)')
  console.log('7. Check no horizontal scrolling')
  console.log('8. Test form inputs work properly')
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testUrl, runTests }