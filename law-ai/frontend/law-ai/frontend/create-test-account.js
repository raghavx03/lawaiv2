const { createClient } = require('@supabase/supabase-js')

// Test account credentials for Razorpay team
const TEST_ACCOUNT = {
  email: 'testuser@lawai.com',
  password: 'Test@12345',
  fullName: 'Test User - Razorpay',
  organization: 'Razorpay Testing Team'
}

async function createTestAccount() {
  const supabaseUrl = 'https://hudflljbqezmpibippyb.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGZsbGpicWV6bXBpYmlwcHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTc3OTYsImV4cCI6MjA2OTM5Mzc5Nn0.5z1fB8tfgBcgyveiNJ9d2eElbOWaoHmZKKcyEwHrans'
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('🔄 Creating test account...')
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: TEST_ACCOUNT.email,
      password: TEST_ACCOUNT.password,
      options: {
        data: {
          full_name: TEST_ACCOUNT.fullName,
          organization: TEST_ACCOUNT.organization
        }
      }
    })

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return
    }

    console.log('✅ Test account created successfully!')
    console.log('\n📋 Test Account Details for Razorpay Team:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📧 Email: ${TEST_ACCOUNT.email}`)
    console.log(`🔐 Password: ${TEST_ACCOUNT.password}`)
    console.log(`👤 Name: ${TEST_ACCOUNT.fullName}`)
    console.log(`🏢 Organization: ${TEST_ACCOUNT.organization}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🎯 Instructions for Razorpay Team:')
    console.log('1. Go to: https://lawai.ragspro.com')
    console.log('2. Click "Sign In" and use above credentials')
    console.log('3. Navigate to pricing page')
    console.log('4. Select any paid plan (Basic/Plus/Pro)')
    console.log('5. Complete ₹1 test payment')
    console.log('\n💳 Test Payment Cards:')
    console.log('• Card: 4111 1111 1111 1111')
    console.log('• CVV: 123')
    console.log('• Expiry: Any future date')
    console.log('• Name: Test User')

  } catch (error) {
    console.error('❌ Error creating test account:', error.message)
  }
}

createTestAccount()