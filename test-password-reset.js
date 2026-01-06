const { createClient } = require('@supabase/supabase-js')

// Test password reset functionality
async function testPasswordReset() {
  const supabaseUrl = 'https://hudflljbqezmpibippyb.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGZsbGpicWV6bXBpYmlwcHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTc3OTYsImV4cCI6MjA2OTM5Mzc5Nn0.5z1fB8tfgBcgyveiNJ9d2eElbOWaoHmZKKcyEwHrans'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('Testing password reset functionality...')
  
  try {
    // Test sending password reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail('test@example.com', {
      redirectTo: 'http://localhost:3000/auth/reset-password'
    })
    
    if (error) {
      console.error('Password reset error:', error.message)
    } else {
      console.log('Password reset email sent successfully!')
      console.log('Data:', data)
    }
    
    // Test getting current session
    const { data: sessionData } = await supabase.auth.getSession()
    console.log('Current session:', sessionData.session ? 'Active' : 'None')
    
  } catch (err) {
    console.error('Test failed:', err.message)
  }
}

testPasswordReset()