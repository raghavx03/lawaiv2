#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log('🔧 Testing Database & Auth Fixes...\n');

function testEndpoint(url, expectedStatus = 200) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: Array.isArray(expectedStatus) ? expectedStatus.includes(res.statusCode) : res.statusCode === expectedStatus,
          status: res.statusCode,
          data: data.substring(0, 200) // First 200 chars
        });
      });
    });
    
    req.on('error', () => resolve({ success: false, status: 'ERROR' }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, status: 'TIMEOUT' });
    });
  });
}

async function runTest() {
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
        if (output.includes('Ready in') || output.includes('Local:')) {
          console.log('✅ Server started\n');
          resolve();
        }
      };
      devServer.stdout.on('data', checkOutput);
      devServer.stderr.on('data', checkOutput);
      
      setTimeout(() => resolve(), 20000); // Longer timeout
    });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🧪 Testing fixed endpoints...\n');
    
    // Test 1: Homepage
    const homeTest = await testEndpoint('http://localhost:3000/');
    console.log(`${homeTest.success ? '✅' : '❌'} Homepage: ${homeTest.status}`);
    
    // Test 2: Login page
    const loginTest = await testEndpoint('http://localhost:3000/auth/login');
    console.log(`${loginTest.success ? '✅' : '❌'} Login page: ${loginTest.status}`);
    
    // Test 3: Dashboard (should redirect or show login form)
    const dashboardTest = await testEndpoint('http://localhost:3000/dashboard', [200, 302, 401]);
    console.log(`${dashboardTest.success ? '✅' : '❌'} Dashboard: ${dashboardTest.status}`);
    
    // Test 4: Theme API (should return 401 without auth)
    const themeTest = await testEndpoint('http://localhost:3000/api/user/theme', [401]);
    console.log(`${themeTest.success ? '✅' : '❌'} Theme API (unauthorized): ${themeTest.status}`);
    
    // Test 5: Profile API (should return 401 without auth)
    const profileTest = await testEndpoint('http://localhost:3000/api/user/profile', [401]);
    console.log(`${profileTest.success ? '✅' : '❌'} Profile API (unauthorized): ${profileTest.status}`);
    
    console.log('\n📊 Fix Results:');
    const tests = [homeTest, loginTest, dashboardTest, themeTest, profileTest];
    const passed = tests.filter(t => t.success).length;
    console.log(`✅ Passed: ${passed}/5`);
    console.log(`❌ Failed: ${5 - passed}/5`);
    
    if (passed >= 4) {
      console.log('\n🎉 Database & Auth issues should be fixed!');
      console.log('\n📝 Manual Test Steps:');
      console.log('1. Go to http://localhost:3000/auth/login');
      console.log('2. Login with email/password or Google');
      console.log('3. Should redirect to dashboard and stay there');
      console.log('4. Dashboard should load without 401 errors');
      console.log('5. Check browser console for any remaining errors');
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

runTest().catch(console.error);