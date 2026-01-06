// Simple test for news aggregator
const fetch = require('node-fetch')

async function testNewsAggregator() {
  console.log('🔄 Testing News Aggregator...')
  
  try {
    // Test NewsAPI directly
    const apiKey = 'ab38ae8dd5d14d26b9c89a1ee2d9b736'
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=legal+court+law+judgment&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
    )
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ NewsAPI Status: ${data.status}`)
      console.log(`✅ Total Results: ${data.totalResults}`)
      console.log(`✅ Articles Retrieved: ${data.articles?.length || 0}`)
      
      if (data.articles && data.articles.length > 0) {
        console.log('\n📰 Sample Articles:')
        data.articles.slice(0, 3).forEach((article, i) => {
          console.log(`${i + 1}. ${article.title}`)
          console.log(`   Source: ${article.source?.name}`)
          console.log(`   Published: ${article.publishedAt}`)
          console.log('')
        })
      }
    } else {
      console.error('❌ NewsAPI Error:', response.status, response.statusText)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testNewsAggregator()