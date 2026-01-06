const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function verifySupabaseSetup() {
  console.log('🔍 LAW-AI Supabase Setup Verification\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('📊 Connection Details:')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Key: ${supabaseKey.substring(0, 20)}...`)
  console.log()
  
  const tables = [
    'users_app', 'payments', 'usage_events', 'research', 'drafts',
    'summaries', 'case_tracker', 'notices', 'crm', 'acts', 'news',
    'chat_sessions', 'chat_messages', 'uploaded_files', 'audit_logs',
    'rate_limits', 'ai_prompts', 'ai_interactions'
  ]
  
  let successCount = 0
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: Table accessible`)
        successCount++
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`)
    }
  }
  
  console.log(`\n📈 Setup Status: ${successCount}/${tables.length} tables accessible`)
  
  // Test AI prompts
  try {
    const { data: prompts, error } = await supabase
      .from('ai_prompts')
      .select('name, category')
      .eq('is_active', true)
    
    if (error) {
      console.log('\n❌ AI Prompts: Not configured')
    } else {
      console.log(`\n✅ AI Prompts: ${prompts.length} active prompts found`)
      prompts.forEach(p => console.log(`   - ${p.name} (${p.category})`))
    }
  } catch (err) {
    console.log('\n❌ AI Prompts: Error accessing prompts')
  }
  
  // Test Auth
  try {
    const { data: session } = await supabase.auth.getSession()
    console.log('\n✅ Auth Service: Working')
  } catch (err) {
    console.log('\n❌ Auth Service: Error')
  }
  
  // Test Storage
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    console.log(`✅ Storage Service: ${buckets?.length || 0} buckets found`)
  } catch (err) {
    console.log('❌ Storage Service: Error')
  }
  
  console.log('\n🎯 Next Steps:')
  if (successCount < tables.length) {
    console.log('1. Run the SQL setup files in Supabase SQL Editor:')
    console.log('   - supabase-setup-complete.sql')
    console.log('   - supabase-ai-prompts.sql')
  } else {
    console.log('✅ Database setup complete!')
    console.log('✅ AI prompts configured!')
    console.log('✅ Ready for development!')
  }
  
  console.log('\n📚 Setup Files Created:')
  console.log('- supabase-setup-complete.sql (Database schema)')
  console.log('- supabase-ai-prompts.sql (AI prompts & functions)')
  console.log('- supabase-connection-test.js (Connection test)')
  console.log('- verify-supabase-setup.js (This verification)')
}

verifySupabaseSetup()