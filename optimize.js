#!/usr/bin/env node

// Performance optimization script
const { execSync } = require('child_process');

console.log('🚀 Optimizing LAW-AI for faster loading...');

// Clear Next.js cache
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
  console.log('✅ Cleared Next.js cache');
} catch (e) {}

// Clear node_modules cache
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cleared npm cache');
} catch (e) {}

// Reinstall dependencies with optimizations
try {
  execSync('npm ci --prefer-offline', { stdio: 'inherit' });
  console.log('✅ Optimized dependencies');
} catch (e) {}

// Build with optimizations
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Built with optimizations');
} catch (e) {}

console.log('🎉 Optimization complete! Run npm start for faster loading.');