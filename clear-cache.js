const fs = require('fs')
const path = require('path')

console.log('🧹 Clearing all cache...')

// Clear Next.js cache
const cacheFiles = [
  '.next/cache',
  '.next/static',
  'node_modules/.cache'
]

cacheFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.rmSync(file, { recursive: true, force: true })
      console.log(`✅ Cleared ${file}`)
    }
  } catch (e) {
    console.log(`❌ Failed to clear ${file}`)
  }
})

console.log('🔥 Cache cleared! Restart server now.')