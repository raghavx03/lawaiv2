const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test if CRM table exists and can be queried
    const crmCount = await prisma.cRM.count()
    console.log(`✅ CRM table accessible, ${crmCount} records found`)
    
    // Test if UserApp table exists
    const userCount = await prisma.userApp.count()
    console.log(`✅ UserApp table accessible, ${userCount} users found`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()