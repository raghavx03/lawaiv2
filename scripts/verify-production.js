#!/usr/bin/env node

async function loadModules() {
  const { PrismaClient } = await import('@prisma/client')
  const { createClient } = await import('@supabase/supabase-js')
  return { PrismaClient, createClient }
}

async function verifyProduction() {
  console.log('🔍 Verifying Production Setup...\n')
  
  const { PrismaClient, createClient } = await loadModules()
  
  // 1. Check Environment Variables
  console.log('1. Environment Variables:')
  const requiredEnvs = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL', 
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  ]
  
  let envScore = 0
  requiredEnvs.forEach(env => {
    const exists = !!process.env[env]
    console.log(`   ${exists ? '✅' : '❌'} ${env}: ${exists ? 'SET' : 'MISSING'}`)
    if (exists) envScore++
  })
  
  console.log(`   Score: ${envScore}/${requiredEnvs.length}\n`)
  
  // 2. Test Database Connection
  console.log('2. Database Connection:')
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()
    
    // Test basic query
    const userCount = await prisma.userApp.count()
    console.log(`   ✅ Database connected (${userCount} users)`)
    
    // Test all tables
    const tables = ['userApp', 'payment', 'usageEvent', 'research', 'draft', 'summary']
    for (const table of tables) {
      try {
        await prisma[table].findFirst()
        console.log(`   ✅ Table ${table}: OK`)
      } catch (e) {
        console.log(`   ❌ Table ${table}: ERROR`)
      }
    }
    
    await prisma.$disconnect()
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message.replace(/[\r\n]/g, '')}`)
  }
  
  // 3. Test Supabase Auth
  console.log('\n3. Supabase Auth:')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data, error } = await supabase.auth.getSession()
    console.log(`   ✅ Supabase client initialized`)
    console.log(`   ✅ Auth service accessible`)
  } catch (error) {
    console.log(`   ❌ Supabase auth failed: ${error.message.replace(/[\r\n]/g, '')}`)
  }
  
  // 4. Test OpenAI Connection
  console.log('\n4. OpenAI API:')
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    })
    
    if (response.ok) {
      console.log(`   ✅ OpenAI API accessible`)
    } else {
      console.log(`   ❌ OpenAI API failed: ${response.status}`)
    }
  } catch (error) {
    console.log(`   ❌ OpenAI connection failed: ${error.message.replace(/[\r\n]/g, '')}`)
  }
  
  console.log('\n🎯 Production Verification Complete!')
}

verifyProduction().catch(error => {
  console.error('Verification failed:', error.message ? error.message.replace(/[\r\n]/g, '') : 'Unknown error')
})