const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "postgresql://postgres:Raghav%40123@db.hudflljbqezmpibippyb.supabase.co:5432/postgres"
      }
    }
  })

  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query test successful:', result)
    
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message.replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, ' ').substring(0, 200))
    await prisma.$disconnect()
    return false
  }
}

testConnection()