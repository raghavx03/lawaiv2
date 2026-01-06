import cron from 'node-cron'

import { prisma } from './prisma'

class NewsScheduler {
  private static instance: NewsScheduler
  private isRunning = false

  static getInstance(): NewsScheduler {
    if (!NewsScheduler.instance) {
      NewsScheduler.instance = new NewsScheduler()
    }
    return NewsScheduler.instance
  }

  start() {
    if (this.isRunning) return

    console.log('Starting news scheduler...')
    
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await this.fetchAndSaveNews()
    })

    // Run immediately on startup
    this.fetchAndSaveNews()
    
    this.isRunning = true
  }

  private async fetchAndSaveNews() {
    try {
      // Skip during build time
      if (process.env.VERCEL_ENV === 'production' && !process.env.DATABASE_URL) {
        console.log('Skipping news fetch during build')
        return
      }
      
      console.log('Fetching latest news...')
      // const newsAggregator = NewsAggregator.getInstance()
      
      // Get a sample user ID for storing news (or use system user)
      const sampleUser = await prisma.userApp.findFirst()
      if (!sampleUser) {
        console.log('No users found, skipping news fetch')
        return
      }

      const savedCount = 0 // Placeholder for news sync
      console.log(`Saved ${savedCount} new articles`)
    } catch (error) {
      console.error('Error in scheduled news fetch:', error)
    }
  }

  stop() {
    this.isRunning = false
    console.log('News scheduler stopped')
  }
}

export const newsScheduler = NewsScheduler.getInstance()

// Auto-start in production (but not during build)
if (process.env.NODE_ENV === 'production' && process.env.VERCEL && !process.env.VERCEL_ENV) {
  // Only start after deployment, not during build
  setTimeout(() => newsScheduler.start(), 5000)
}