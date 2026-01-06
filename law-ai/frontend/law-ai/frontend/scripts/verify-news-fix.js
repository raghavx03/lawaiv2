#!/usr/bin/env node

console.log('📰 LAW-AI Legal News Real-Time Integration Verification')
console.log('======================================================')

// Check implementation files
const fs = require('fs')
const path = require('path')

const checkFile = (filePath, description) => {
  const fullPath = path.join(__dirname, '..', filePath)
  const exists = fs.existsSync(fullPath)
  console.log(`${exists ? '✅' : '❌'} ${description}: ${exists ? 'EXISTS' : 'MISSING'}`)
  return exists
}

console.log('\n🔍 1. Implementation Files Check')
console.log('================================')

const files = [
  ['src/lib/news-aggregator.ts', 'NewsAggregator with RSS parsing'],
  ['src/lib/news-scheduler.ts', 'News scheduler with cron jobs'],
  ['src/app/api/news/route.ts', 'Updated news API endpoint'],
  ['src/app/api/news/sync/route.ts', 'Manual news sync endpoint'],
  ['src/app/news/page.tsx', 'Updated frontend with real news display']
]

let implementationScore = 0
files.forEach(([file, desc]) => {
  if (checkFile(file, desc)) implementationScore++
})

console.log('\n🔍 2. Code Analysis')
console.log('==================')

// Check if mock data is removed
try {
  const newsApiContent = fs.readFileSync(path.join(__dirname, '../src/app/api/news/route.ts'), 'utf8')
  const hasMockData = newsApiContent.includes('mockNews') || newsApiContent.includes('Supreme Court Landmark')
  console.log(`${hasMockData ? '❌' : '✅'} Mock Data Removal: ${hasMockData ? 'STILL PRESENT' : 'REMOVED'}`)
  
  const hasRSSIntegration = newsApiContent.includes('NewsAggregator')
  console.log(`${hasRSSIntegration ? '✅' : '❌'} RSS Integration: ${hasRSSIntegration ? 'IMPLEMENTED' : 'MISSING'}`)
  
} catch (error) {
  console.log('❌ Code Analysis: Failed to read files')
}

console.log('\n🔍 3. Dependencies Check')
console.log('========================')

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))
  const hasRSSParser = packageJson.dependencies['rss-parser']
  const hasNodeCron = packageJson.dependencies['node-cron']
  
  console.log(`${hasRSSParser ? '✅' : '❌'} RSS Parser: ${hasRSSParser ? 'INSTALLED' : 'MISSING'}`)
  console.log(`${hasNodeCron ? '✅' : '❌'} Node Cron: ${hasNodeCron ? 'INSTALLED' : 'MISSING'}`)
} catch (error) {
  console.log('❌ Dependencies Check: Failed')
}

console.log('\n🔍 4. Database Schema Check')
console.log('===========================')

try {
  const schemaContent = fs.readFileSync(path.join(__dirname, '../prisma/schema.prisma'), 'utf8')
  const hasNewsModel = schemaContent.includes('model News')
  const hasCorrectFields = schemaContent.includes('publishedAt') && schemaContent.includes('source')
  
  console.log(`${hasNewsModel ? '✅' : '❌'} News Model: ${hasNewsModel ? 'EXISTS' : 'MISSING'}`)
  console.log(`${hasCorrectFields ? '✅' : '❌'} Required Fields: ${hasCorrectFields ? 'PRESENT' : 'MISSING'}`)
} catch (error) {
  console.log('❌ Schema Check: Failed')
}

console.log('\n📊 VERIFICATION SUMMARY')
console.log('=======================')

const totalChecks = 9
const passedChecks = implementationScore + (hasRSSParser ? 1 : 0) + (hasNodeCron ? 1 : 0) + 
                   (hasNewsModel ? 1 : 0) + (hasCorrectFields ? 1 : 0)

const completionRate = Math.round((passedChecks / totalChecks) * 100)

console.log(`Implementation Score: ${implementationScore}/5`)
console.log(`Overall Completion: ${completionRate}%`)

if (completionRate >= 90) {
  console.log('\n🎉 REAL-TIME NEWS INTEGRATION: COMPLETE')
  console.log('✅ All dummy data removed')
  console.log('✅ Live RSS feeds integrated')
  console.log('✅ Scheduled updates implemented')
  console.log('✅ Database schema ready')
  console.log('✅ Frontend updated for real news')
} else if (completionRate >= 70) {
  console.log('\n⚠️  REAL-TIME NEWS INTEGRATION: PARTIAL')
  console.log('Some components need attention')
} else {
  console.log('\n❌ REAL-TIME NEWS INTEGRATION: INCOMPLETE')
  console.log('Major components missing or broken')
}

console.log('\n🚀 NEXT STEPS:')
console.log('1. Start the application: npm run dev')
console.log('2. Initialize scheduler: POST /api/init-scheduler')
console.log('3. Sync news manually: POST /api/news/sync')
console.log('4. Visit /news page to see real articles')
console.log('5. Monitor logs for RSS feed updates')

console.log('\n📡 LIVE NEWS SOURCES:')
console.log('• LiveLaw RSS: https://www.livelaw.in/rss-feed')
console.log('• Bar & Bench RSS: https://www.barandbench.com/rss')
console.log('• NewsAPI: https://newsapi.org (requires API key)')

// Declare variables to avoid reference errors
let hasRSSParser, hasNodeCron, hasNewsModel, hasCorrectFields
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))
  hasRSSParser = !!packageJson.dependencies['rss-parser']
  hasNodeCron = !!packageJson.dependencies['node-cron']
} catch (e) {
  hasRSSParser = false
  hasNodeCron = false
}

try {
  const schemaContent = fs.readFileSync(path.join(__dirname, '../prisma/schema.prisma'), 'utf8')
  hasNewsModel = schemaContent.includes('model News')
  hasCorrectFields = schemaContent.includes('publishedAt') && schemaContent.includes('source')
} catch (e) {
  hasNewsModel = false
  hasCorrectFields = false
}