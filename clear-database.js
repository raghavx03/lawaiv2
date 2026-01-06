const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function clearDrafts() {
  try {
    console.log('🗑️ Clearing all drafts from database...')
    
    const { data, error } = await supabase
      .from('drafts')
      .delete()
      .neq('id', 'dummy')
    
    if (error) {
      console.error('❌ Error:', error)
    } else {
      console.log('✅ All drafts cleared from database')
    }
  } catch (error) {
    console.error('❌ Database clear failed:', error)
  }
}

clearDrafts()