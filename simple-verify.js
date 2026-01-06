#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying Freemium Model Fix...\n')

// Check AuthContext
const authPath = path.join(__dirname, 'src/context/AuthContext.tsx')
if (fs.existsSync(authPath)) {
  const content = fs.readFileSync(authPath, 'utf8')
  if (content.includes('plan: isAdmin ? \'PRO\' : \'FREE\'')) {
    console.log('✅ AuthContext: Proper admin check')
  } else {
    console.log('❌ AuthContext: Missing admin check')
  }
}

// Check Profile API
const profilePath = path.join(__dirname, 'src/app/api/user/profile/route.ts')
if (fs.existsSync(profilePath)) {
  const content = fs.readFileSync(profilePath, 'utf8')
  if (content.includes('plan: \'FREE\'') && content.includes('EXPIRED_FREE')) {
    console.log('✅ Profile API: FREE default with expiry')
  } else {
    console.log('❌ Profile API: Missing FREE default')
  }
}

// Check Feature Access
const featurePath = path.join(__dirname, 'src/lib/feature-access.ts')
if (fs.existsSync(featurePath)) {
  const content = fs.readFileSync(featurePath, 'utf8')
  if (content.includes('EXPIRED_FREE: []')) {
    console.log('✅ Feature Access: EXPIRED_FREE plan')
  } else {
    console.log('❌ Feature Access: Missing EXPIRED_FREE')
  }
}

console.log('\n🎉 Basic verification complete!')
console.log('Now test with a new user account to verify freemium model works.')