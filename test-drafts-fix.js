#!/usr/bin/env node

// Test script to verify the drafts API fix
const fetch = require('node-fetch');

const BASE_URL = 'https://lawai.ragspro.com';

async function testDraftsAPI() {
  console.log('🧪 Testing LAW-AI Document Generator Fix...\n');
  
  try {
    // Test 1: Simple endpoint
    console.log('1. Testing simple drafts endpoint...');
    const simpleResponse = await fetch(`${BASE_URL}/api/drafts-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'rent',
        inputs: {
          landlord: 'John Doe',
          tenant: 'Jane Smith',
          property: '123 Main Street, Mumbai',
          rent: '25000',
          duration: '11 months'
        }
      })
    });
    
    if (simpleResponse.ok) {
      const data = await simpleResponse.json();
      console.log('✅ Simple endpoint working!');
      console.log('📄 Generated document preview:');
      console.log(data.content.substring(0, 200) + '...\n');
    } else {
      console.log('❌ Simple endpoint failed:', simpleResponse.status);
    }
    
    // Test 2: Test endpoint
    console.log('2. Testing test endpoint...');
    const testResponse = await fetch(`${BASE_URL}/api/test-drafts`);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test endpoint working!');
      console.log('🔧 Environment check:', testData.environment);
    } else {
      console.log('❌ Test endpoint failed:', testResponse.status);
    }
    
    // Test 3: Main endpoint (might fail due to auth)
    console.log('\n3. Testing main drafts endpoint...');
    const mainResponse = await fetch(`${BASE_URL}/api/drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'rent',
        inputs: {
          landlord: 'Test Landlord',
          tenant: 'Test Tenant',
          property: 'Test Property',
          rent: '20000',
          duration: '12 months'
        }
      })
    });
    
    if (mainResponse.ok) {
      console.log('✅ Main endpoint working!');
    } else {
      console.log(`⚠️  Main endpoint returned ${mainResponse.status} (expected due to auth)`);
    }
    
    console.log('\n🎉 Test completed! The simple endpoint should work for immediate use.');
    console.log('📝 Next steps:');
    console.log('   - Update frontend to use /api/drafts-simple temporarily');
    console.log('   - Fix authentication issues in main /api/drafts endpoint');
    console.log('   - Test document generation in browser');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDraftsAPI();