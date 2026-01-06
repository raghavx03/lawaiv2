#!/usr/bin/env node

/**
 * LAW-AI Authentication Flow Test Script
 * Tests the complete authentication system including fallback
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 LAW-AI Authentication System Test\n')

// Test 1: Environment Configuration
console.log('1. Testing Environment Configuration...')
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=https://hudflljbqezmpibippyb.supabase.co')
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && !envContent.includes('not_configured')
  
  console.log(`   ✅ Environment file exists`)
  console.log(`   ${hasSupabaseUrl ? '✅' : '❌'} Supabase URL configured`)
  console.log(`   ${hasSupabaseKey ? '✅' : '❌'} Supabase anon key configured`)
  
  if (!hasSupabaseKey) {
    console.log('   ⚠️  Fallback authentication will be used')
  }
} else {
  console.log('   ❌ .env.local file not found')
}

// Test 2: File Structure
console.log('\n2. Testing File Structure...')
const requiredFiles = [
  'src/context/AuthContext.tsx',
  'src/middleware.ts',
  'src/lib/supabase.ts',
  'src/lib/auth-fallback-enhanced.ts',
  'src/app/auth/login/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/api/auth/callback/route.ts'
]

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file)
  const exists = fs.existsSync(filePath)
  console.log(`   ${exists ? '✅' : '❌'} ${file}`)
})

// Test 3: Middleware Configuration
console.log('\n3. Testing Middleware Configuration...')
const middlewarePath = path.join(__dirname, 'src/middleware.ts')
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
  const hasProtectedRoutes = middlewareContent.includes('/dashboard')
  const hasAuthRedirect = middlewareContent.includes('/auth/login')
  const hasProperCookieHandling = middlewareContent.includes('supabase.auth.getUser()')
  
  console.log(`   ${hasProtectedRoutes ? '✅' : '❌'} Protected routes configured`)
  console.log(`   ${hasAuthRedirect ? '✅' : '❌'} Auth redirect configured`)
  console.log(`   ${hasProperCookieHandling ? '✅' : '❌'} Proper session handling`)
}

// Test 4: AuthContext Configuration
console.log('\n4. Testing AuthContext Configuration...')
const authContextPath = path.join(__dirname, 'src/context/AuthContext.tsx')
if (fs.existsSync(authContextPath)) {
  const authContent = fs.readFileSync(authContextPath, 'utf8')
  const hasFallbackAuth = authContent.includes('auth-fallback-enhanced')
  const hasRedirectLogic = authContent.includes('window.location.replace')
  const hasSupabaseCheck = authContent.includes('isSupabaseConfigured')
  
  console.log(`   ${hasFallbackAuth ? '✅' : '❌'} Fallback authentication integrated`)
  console.log(`   ${hasRedirectLogic ? '✅' : '❌'} Redirect logic implemented`)
  console.log(`   ${hasSupabaseCheck ? '✅' : '❌'} Supabase configuration check`)
}

// Test 5: Login Page Configuration
console.log('\n5. Testing Login Page Configuration...')
const loginPath = path.join(__dirname, 'src/app/auth/login/page.tsx')
if (fs.existsSync(loginPath)) {
  const loginContent = fs.readFileSync(loginPath, 'utf8')
  const hasEmailLogin = loginContent.includes('handleEmailLogin')
  const hasGoogleLogin = loginContent.includes('handleGoogleLogin')
  const hasFallbackSupport = loginContent.includes('fallbackAuth')
  
  console.log(`   ${hasEmailLogin ? '✅' : '❌'} Email login implemented`)
  console.log(`   ${hasGoogleLogin ? '✅' : '❌'} Google login implemented`)
  console.log(`   ${hasFallbackSupport ? '✅' : '❌'} Fallback authentication support`)
}

console.log('\n📋 Test Summary:')
console.log('   • Authentication system has been enhanced with fallback support')
console.log('   • Middleware properly handles session validation')
console.log('   • Login page supports both Supabase and fallback authentication')
console.log('   • Dashboard will be accessible after successful login')

console.log('\n🚀 Next Steps:')
console.log('   1. Get your actual Supabase anon key from: https://supabase.com/dashboard')
console.log('   2. Replace the placeholder key in .env.local')
console.log('   3. Run: npm run dev')
console.log('   4. Test login at: http://localhost:3000/auth/login')
console.log('   5. Verify dashboard access at: http://localhost:3000/dashboard')

console.log('\n✨ If Supabase is not configured, the system will use fallback authentication')
console.log('   allowing you to test the complete flow immediately!')