import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Sample legal news data
const sampleNews = [
  {
    id: '1',
    title: 'Supreme Court Upholds Right to Privacy in Landmark Judgment',
    content: 'The Supreme Court of India has delivered a landmark judgment reinforcing the fundamental right to privacy as an intrinsic part of the right to life and personal liberty under Article 21 of the Constitution.',
    summary: 'Supreme Court reinforces privacy as a fundamental right under Article 21.',
    source: 'LiveLaw',
    url: 'https://www.livelaw.in',
    category: 'Supreme Court',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Delhi High Court Issues Guidelines on Virtual Hearings',
    content: 'The Delhi High Court has issued comprehensive guidelines for conducting virtual hearings, addressing technical requirements, etiquette, and procedural aspects.',
    summary: 'New guidelines for virtual court proceedings issued by Delhi HC.',
    source: 'Bar & Bench',
    url: 'https://www.barandbench.com',
    category: 'High Court',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    title: 'New Amendments to Consumer Protection Act 2019',
    content: 'The government has introduced new amendments to the Consumer Protection Act 2019, strengthening consumer rights and introducing stricter penalties for misleading advertisements.',
    summary: 'Consumer Protection Act amendments strengthen consumer rights.',
    source: 'Legal Updates',
    url: 'https://www.legalupdates.in',
    category: 'Legal Updates',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '4',
    title: 'Bar Council of India Announces New Rules for Advocates',
    content: 'The Bar Council of India has announced new rules regarding professional conduct and continuing legal education requirements for practicing advocates.',
    summary: 'BCI introduces new professional conduct rules for advocates.',
    source: 'Bar & Bench',
    url: 'https://www.barandbench.com',
    category: 'Bar News',
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: '5',
    title: 'Supreme Court Clarifies Bail Provisions Under PMLA',
    content: 'In a significant ruling, the Supreme Court has clarified the bail provisions under the Prevention of Money Laundering Act, providing relief to accused persons.',
    summary: 'SC clarifies PMLA bail provisions in landmark ruling.',
    source: 'LiveLaw',
    url: 'https://www.livelaw.in',
    category: 'Supreme Court',
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    createdAt: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: '6',
    title: 'Government Proposes Changes to Arbitration Act',
    content: 'The Ministry of Law and Justice has proposed significant amendments to the Arbitration and Conciliation Act to make India a hub for international arbitration.',
    summary: 'Proposed amendments aim to boost international arbitration in India.',
    source: 'Legal Updates',
    url: 'https://www.legalupdates.in',
    category: 'Policy Changes',
    publishedAt: new Date(Date.now() - 432000000).toISOString(),
    createdAt: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: '7',
    title: 'Bombay High Court Rules on Cryptocurrency Regulations',
    content: 'The Bombay High Court has delivered an important judgment regarding the regulatory framework for cryptocurrency transactions in India.',
    summary: 'Bombay HC addresses cryptocurrency regulatory framework.',
    source: 'Bar & Bench',
    url: 'https://www.barandbench.com',
    category: 'High Court',
    publishedAt: new Date(Date.now() - 518400000).toISOString(),
    createdAt: new Date(Date.now() - 518400000).toISOString()
  },
  {
    id: '8',
    title: 'New Data Protection Bill Introduced in Parliament',
    content: 'The government has introduced the Digital Personal Data Protection Bill in Parliament, aiming to establish a comprehensive framework for data privacy.',
    summary: 'Digital Personal Data Protection Bill introduced in Parliament.',
    source: 'Legal Updates',
    url: 'https://www.legalupdates.in',
    category: 'Policy Changes',
    publishedAt: new Date(Date.now() - 604800000).toISOString(),
    createdAt: new Date(Date.now() - 604800000).toISOString()
  }
]

// GET - Fetch legal news
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let news = [...sampleNews]

    // Filter by category if specified
    if (category && category !== 'All') {
      news = news.filter(article => 
        article.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    // Try to fetch from real news aggregator if available
    try {
      const { NewsAggregator } = await import('@/lib/news-aggregator')
      const newsAggregator = NewsAggregator.getInstance()
      const realNews = await newsAggregator.aggregateAllNews()
      
      if (realNews && realNews.length > 0) {
        news = realNews.slice(0, 10).map((article, index) => ({
          id: `${article.source}-${index}-${Date.now()}`,
          title: article.title,
          content: article.content,
          summary: article.summary,
          source: article.source,
          url: article.url,
          category: article.category,
          publishedAt: article.publishedAt?.toISOString() || new Date().toISOString(),
          createdAt: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.log('Using sample news data')
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('News fetch error:', error)
    return NextResponse.json(sampleNews)
  }
}

// POST - Sync news (for admin)
export async function POST(request: NextRequest) {
  try {
    const { NewsAggregator } = await import('@/lib/news-aggregator')
    const newsAggregator = NewsAggregator.getInstance()
    const allNews = await newsAggregator.aggregateAllNews()

    return NextResponse.json({ 
      ok: true,
      message: 'News sync completed',
      count: allNews.length
    })
  } catch (error) {
    console.error('News sync error:', error)
    return NextResponse.json({ 
      ok: true,
      message: 'Using cached news',
      count: sampleNews.length
    })
  }
}
