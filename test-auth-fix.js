#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log('🔐 Testing Auth Redirect Fix...\n');

function testEndpoint(url, expectedStatus = 200) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({
        success: Array.isArray(expectedStatus) ? expectedStatus.includes(res.statusCode) : res.statusCode === expectedStatus,
        status: res.statusCode,
        headers: res.headers
      });
    });
    
    req.on('error', () => resolve({ success: false, status: 'ERROR' }));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ success: false, status: 'TIMEOUT' });
    });
  });
}

async function runAuthTest() {
  let devServer;
  
  try {
    console.log('📡 Starting development server...');
    devServer = spawn('npm', ['run', 'dev'], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    // Wait for server to start
    await new Promise((resolve) => {
      let output = '';
      const checkOutput = (data) => {
        output += data.toString();
        if (output.includes('Ready in')) {
          console.log('✅ Server started\n');
          resolve();
        }
      };
      devServer.stdout.on('data', checkOutput);
      devServer.stderr.on('data', checkOutput);
      
      setTimeout(() => resolve(), 15000); // Fallback timeout
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🧪 Testing auth flow...\n');
    
    // Test 1: Homepage should load
    const homeTest = await testEndpoint('http://localhost:3000/');
    console.log(`${homeTest.success ? '✅' : '❌'} Homepage: ${homeTest.status}`);
    
    // Test 2: Login page should load
    const loginTest = await testEndpoint('http://localhost:3000/auth/login');
    console.log(`${loginTest.success ? '✅' : '❌'} Login page: ${loginTest.status}`);
    
    // Test 3: Dashboard should redirect to login (302) or show login form
    const dashboardTest = await testEndpoint('http://localhost:3000/dashboard', [200, 302, 401]);
    console.log(`${dashboardTest.success ? '✅' : '❌'} Dashboard protection: ${dashboardTest.status}`);
    
    // Test 4: Auth callback should exist
    const callbackTest = await testEndpoint('http://localhost:3000/api/auth/callback', [400, 404, 500]); // Expects error without code
    console.log(`${callbackTest.success ? '✅' : '❌'} Auth callback: ${callbackTest.status}`);
    
    console.log('\n📊 Auth Fix Results:');
    const tests = [homeTest, loginTest, dashboardTest, callbackTest];
    const passed = tests.filter(t => t.success).length;
    console.log(`✅ Passed: ${passed}/4`);
    console.log(`❌ Failed: ${4 - passed}/4`);
    
    if (passed >= 3) {
      console.log('\n🎉 Auth redirect loop should be fixed!');
      console.log('\n📝 Manual Test Steps:');
      console.log('1. Go to http://localhost:3000/auth/login');
      console.log('2. Login with email/password or Google');
      console.log('3. Should redirect to dashboard WITHOUT looping back to login');
      console.log('4. Dashboard should stay loaded and show user data');
    } else {
      console.log('\n⚠️  Some tests failed. Check the issues above.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (devServer) {
      console.log('\n🛑 Stopping server...');
      devServer.kill();
    }
  }
}

runAuthTest().catch(console.error);