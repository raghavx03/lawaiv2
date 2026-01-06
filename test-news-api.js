const { NewsAggregator } = require('./src/lib/news-aggregator.ts')

async function testNewsAPI() {
  console.log('🔄 Testing News API...')
  
  try {
    const newsAggregator = NewsAggregator.getInstance()
    
    console.log('📰 Fetching LiveLaw news...')
    const liveLawNews = await newsAggregator.fetchLiveLawNews()
    console.log(`✅ LiveLaw: ${liveLawNews.length} articles`)
    
    console.log('📰 Fetching Bar & Bench news...')
    const barBenchNews = await newsAggregator.fetchBarBenchNews()
    console.log(`✅ Bar & Bench: ${barBenchNews.length} articles`)
    
    console.log('📰 Fetching NewsAPI...')
    const newsAPINews = await newsAggregator.fetchNewsAPI()
    console.log(`✅ NewsAPI: ${newsAPINews.length} articles`)
    
    console.log('📰 Aggregating all news...')
    const allNews = await newsAggregator.aggregateAllNews()
    console.log(`✅ Total unique articles: ${allNews.length}`)
    
    if (allNews.length > 0) {
      console.log('\\n📋 Sample articles:')
      allNews.slice(0, 3).forEach((article, i) => {
        console.log(`${i + 1}. ${article.title}`)
        console.log(`   Source: ${article.source}`)
        console.log(`   Published: ${article.publishedAt}`)
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('❌ Error testing news API:', error.message)
  }
}

testNewsAPI()