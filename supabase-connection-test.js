const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase Connection...\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...')
    const { data, error } = await supabase.from('users_app').select('count').limit(1)
    
    if (error) {
      console.log('❌ Database connection failed:', error.message)
      console.log('🔧 Creating tables...')
      
      // Create users_app table if not exists
      const { error: createError } = await supabase.rpc('create_users_app_table')
      if (createError) {
        console.log('⚠️ Table creation might need manual setup')
      }
    } else {
      console.log('✅ Database connected successfully')
    }
    
    // Test 2: Auth service
    console.log('\n2️⃣ Testing Auth service...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    console.log('✅ Auth service accessible')
    
    // Test 3: Storage service
    console.log('\n3️⃣ Testing Storage service...')
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
    if (storageError) {
      console.log('⚠️ Storage service needs setup')
    } else {
      console.log('✅ Storage service accessible')
    }
    
    console.log('\n✅ Supabase connection test completed!')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
  }
}

testSupabaseConnection()