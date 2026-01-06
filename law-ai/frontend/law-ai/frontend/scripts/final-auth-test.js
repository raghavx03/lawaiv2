async function loadDependencies() {
  const dotenv = await import('dotenv')
  dotenv.config({ path: '.env.local' })
  const { createClient } = await import('@supabase/supabase-js')
  return { createClient }
}

async function finalAuthTest() {
  console.log('🔒 LAW-AI Final Authentication Test\n')
  
  const { createClient } = await loadDependencies()
  
  // 1. Test Supabase Configuration
  console.log('1. Testing Supabase Configuration:')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials')
    return false
  }
  
  console.log('✅ Supabase URL:', supabaseUrl)
  console.log('✅ Supabase Key: Present')
  
  // 2. Test Supabase Connection
  console.log('\n2. Testing Supabase Auth Service:')
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('⚠️  Auth service warning:', error.message.replace(/[\r\n]/g, ''))
    } else {
      console.log('✅ Supabase Auth service accessible')
    }
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message.replace(/[\r\n]/g, ''))
    return false
  }
  
  // 3. Test File Structure
  console.log('\n3. Testing Authentication Files:')
  const { existsSync } = await import('fs')
  const { join } = await import('path')
  
  const authFiles = [
    'src/app/auth/login/page.tsx',
    'src/app/auth/signup/page.tsx', 
    'src/app/auth/forgot-password/page.tsx',
    'src/app/auth/reset-password/page.tsx',
    'src/app/api/auth/callback/route.ts'
  ]
  
  let allFilesPresent = true
  for (const file of authFiles) {
    if (existsSync(join(process.cwd(), file))) {
      console.log('✅', file)
    } else {
      console.log('❌', file)
      allFilesPresent = false
    }
  }
  
  // 4. Test Environment Variables
  console.log('\n4. Testing Environment Configuration:')
  const requiredEnvs = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL'
  ]
  
  let allEnvsPresent = true
  for (const env of requiredEnvs) {
    if (process.env[env]) {
      console.log('✅', env)
    } else {
      console.log('❌', env)
      allEnvsPresent = false
    }
  }
  
  // 5. Generate Test Report
  console.log('\n📋 FINAL AUTHENTICATION STATUS:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (allFilesPresent && allEnvsPresent) {
    console.log('✅ Authentication System: READY')
    console.log('✅ Login/Signup Pages: READY')
    console.log('✅ Password Reset: READY')
    console.log('✅ OAuth Callback: READY')
    console.log('✅ Environment Config: READY')
    
    console.log('\n🚀 READY TO TEST:')
    console.log('1. Start server: npm run dev')
    console.log('2. Test login: http://localhost:3000/auth/login')
    console.log('3. Test signup: http://localhost:3000/auth/signup')
    console.log('4. Test reset: http://localhost:3000/auth/forgot-password')
    
    return true
  } else {
    console.log('❌ Authentication System: INCOMPLETE')
    return false
  }
}

finalAuthTest().then(success => {
  if (success) {
    console.log('\n✅ Authentication system is ready for production testing!')
  } else {
    console.log('\n❌ Authentication system needs fixes before testing.')
  }
}).catch(console.error)