#!/usr/bin/env node

// Test script to verify all AI integrations
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3007';
const TEST_TOKEN = 'test-token'; // You'll need to get a real token

async function testModule(name, endpoint, payload) {
  console.log(`\n🧪 Testing ${name}...`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name} - SUCCESS`);
      console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      console.log(`❌ ${name} - FAILED`);
      console.log(`   Error: ${data.error || data.message}`);
    }
  } catch (error) {
    console.log(`❌ ${name} - ERROR`);
    console.log(`   Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing all AI modules...\n');
  
  // Test AI Assistant
  await testModule('AI Assistant', '/api/ai-assistant', {
    prompt: 'What is Section 420 IPC?'
  });
  
  // Test Draft Generator
  await testModule('Draft Generator', '/api/drafts', {
    type: 'rent',
    inputs: {
      landlord: 'John Doe',
      tenant: 'Jane Smith',
      property: '123 Main St',
      rent: '50000'
    }
  });
  
  // Test Summarizer
  await testModule('Summarizer', '/api/summarizer', {
    title: 'Test Judgment',
    text: 'This is a test legal document that needs to be summarized. It contains various legal provisions and judgments that should be analyzed by the AI system.'
  });
  
  // Test Legal Research
  await testModule('Legal Research', '/api/research?q=theft&type=all', {});
  
  // Test Case Tracker
  await testModule('Case Tracker', '/api/case-tracker', {
    cnr: 'TEST123456',
    partyName: 'Test Party',
    searchType: 'cnr'
  });
  
  // Test Legal Notices
  await testModule('Legal Notices', '/api/notices', {
    noticeType: 'Legal Notice',
    recipient: 'Test Recipient',
    subject: 'Test Subject',
    details: 'Test details for legal notice generation'
  });
  
  // Test CRM
  await testModule('CRM', '/api/crm', {
    type: 'contact',
    name: 'Test Client',
    email: 'test@example.com',
    phone: '9876543210',
    notes: 'Test client notes'
  });
  
  console.log('\n🏁 All tests completed!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start with: npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main().catch(console.error);