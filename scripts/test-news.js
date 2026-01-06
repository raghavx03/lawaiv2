require('dotenv').config({ path: '.env.local' })

async function testNewsAggregator() {
  console.log('🔄 Testing News Aggregator...\n')
  
  try {
    // Import the NewsAggregator class
    const { NewsAggregator } = await import('../src/lib/news-aggregator.ts')
    
    console.log('1. Testing RSS Feeds:')
    const aggregator = NewsAggregator.getInstance()
    
    // Test LiveLaw RSS
    console.log('   - Fetching LiveLaw RSS...')
    const liveLawNews = await aggregator.fetchLiveLawNews()
    console.log(`   ✅ LiveLaw: ${liveLawNews.length} articles`)
    
    // Test Bar & Bench RSS
    console.log('   - Fetching Bar & Bench RSS...')
    const barBenchNews = await aggregator.fetchBarBenchNews()
    console.log(`   ✅ Bar & Bench: ${barBenchNews.length} articles`)
    
    // Test NewsAPI
    console.log('   - Fetching NewsAPI...')
    const newsAPINews = await aggregator.fetchNewsAPI()
    console.log(`   ✅ NewsAPI: ${newsAPINews.length} articles`)
    
    // Test aggregation
    console.log('\n2. Testing News Aggregation:')
    const allNews = await aggregator.aggregateAllNews()
    console.log(`   ✅ Total unique articles: ${allNews.length}`)
    
    // Display sample articles
    console.log('\n3. Sample Articles:')
    allNews.slice(0, 3).forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`)
    console.log(`      Source: ${article.source}`)
      console.log(`      Published: ${article.publishedAt.toLocaleDateString()}`)
      console.log(`      URL: ${article.url}`)
      console.log('')
    })
    
    console.log('✅ News aggregator is working correctly!')
    return true
    
  } catch (error) {
    console.error('❌ News aggregator test failed:', error)
    return false
  }
}

testNewsAggregator().then(success => {
  if (success) {
    console.log('\n🎉 News system is ready for real-time updates!')
  } else {
    console.log('\n❌ News system needs fixes.')
  }
}).catch(console.error)