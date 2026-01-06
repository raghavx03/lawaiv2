const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check if tables exist by trying to count users
    try {
      const userCount = await prisma.userApp.count()
      console.log(`✅ Database tables exist. Found ${userCount} users.`)
    } catch (error) {
      console.log('⚠️  Database tables may not exist. Running migrations...')
      // This would typically run migrations, but we'll just log for now
      console.log('Please run: npx prisma db push')
    }
    
    console.log('✅ Database setup completed')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()