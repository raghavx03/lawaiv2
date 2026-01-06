// Run this script to fix package installation issues
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Fixing package installation issues...');

try {
  // Remove problematic files
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('✅ Removed package-lock.json');
  }
  
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
    console.log('✅ Removed node_modules');
  }

  // Clear npm cache
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cleared npm cache');

  // Install dependencies
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');

  // Generate Prisma client
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  console.log('\n🎉 Package installation fixed! You can now run npm run dev');
} catch (error) {
  console.error('❌ Error fixing packages:', error.message);
  process.exit(1);
}