#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 LAW-AI Development Environment Setup Verification\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if required files exist
const requiredFiles = [
  '.env.local',
  'package.json',
  'prisma/schema.prisma',
  'next.config.js'
];

console.log('\n📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
  }
});

// Check if node_modules exists
console.log('\n📦 Checking dependencies:');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules directory exists');
} else {
  console.log('❌ node_modules directory missing - Run npm install');
}

// Check environment variables
console.log('\n🔧 Environment Configuration Status:');
try {
  require('dotenv').config({ path: '.env.local' });
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'DATABASE_URL'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar] && process.env[envVar] !== `your_${envVar.toLowerCase()}`) {
      console.log(`✅ ${envVar} - Configured`);
    } else {
      console.log(`⚠️  ${envVar} - Needs configuration`);
    }
  });
} catch (error) {
  console.log('❌ Error reading environment variables');
}

console.log('\n🚀 Next Steps:');
console.log('1. Configure your environment variables in .env.local');
console.log('2. Set up your Supabase database');
console.log('3. Run: npm run dev');
console.log('4. Visit: http://localhost:3000');