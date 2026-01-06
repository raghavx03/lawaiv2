// Emergency fix - run this to clear everything
const { createClient } = require('@supabase/supabase-js')

async function emergencyFix() {
  try {
    // Clear Supabase drafts
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'dummy',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
    )
    
    await supabase.from('drafts').delete().neq('id', 'dummy')
    console.log('✅ Database cleared')
    
    // Clear any local files
    const fs = require('fs')
    const path = require('path')
    
    const cacheFiles = [
      '.next/cache',
      'node_modules/.cache',
      '.vercel/cache'
    ]
    
    cacheFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.rmSync(file, { recursive: true, force: true })
          console.log(`✅ Cleared ${file}`)
        }
      } catch (e) {}
    })
    
    console.log('🔥 Emergency fix complete!')
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

emergencyFix()