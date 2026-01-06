#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting comprehensive LAW-AI feature test...\n');

// Test configuration
let BASE_URL = 'http://localhost:3000';

// Function to detect available port
function detectPort() {
  const ports = [3000, 3001, 3002, 3003, 3004];
  for (const port of ports) {
    try {
      const req = http.get(`http://localhost:${port}/`, { timeout: 1000 }, (res) => {
        BASE_URL = `http://localhost:${port}`;
        return port;
      });
      req.on('error', () => {});
      req.setTimeout(1000);
    } catch (e) {}
  }
  return 3000; // fallback
}
const ENDPOINTS = [
  { path: '/', name: 'Homepage', expected: 200 },
  { path: '/auth/login', name: 'Login Page', expected: 200 },
  { path: '/auth/sign-up', name: 'Sign Up Page', expected: 200 },
  { path: '/dashboard', name: 'Dashboard', expected: 200 },
  { path: '/ai-assistant', name: 'AI Assistant', expected: 200 },
  { path: '/summarizer', name: 'Summarizer', expected: 200 },
  { path: '/drafts', name: 'Document Generator', expected: 200 },
  { path: '/case-tracker', name: 'Case Tracker', expected: 200 },
  { path: '/crm', name: 'CRM', expected: 200 },
  { path: '/news', name: 'Legal News', expected: 200 },
  { path: '/research', name: 'Research Tool', expected: 200 },
  { path: '/notices', name: 'Legal Notices', expected: 200 },
  { path: '/acts', name: 'Acts Database', expected: 200 },
  { path: '/api/health', name: 'Health Check API', expected: [200, 503] },
  { path: '/api/system/status', name: 'System Status API', expected: 200 },
  { path: '/api/dashboard/stats', name: 'Dashboard Stats API', expected: 401 }, // Should be unauthorized
];

// Helper function to test HTTP endpoint
function testEndpoint(url, expectedStatus) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const isExpected = Array.isArray(expectedStatus) 
        ? expectedStatus.includes(res.statusCode)
        : res.statusCode === expectedStatus;
      
      resolve({
        success: isExpected,
        status: res.statusCode,
        expected: expectedStatus
      });
    });
    
    req.on('error', () => {
      resolve({ success: false, status: 'ERROR', expected: expectedStatus });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, status: 'TIMEOUT', expected: expectedStatus });
    });
  });
}

// Start dev server
function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('📡 Starting development server...');
    const devServer = spawn('npm', ['run', 'dev'], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    let output = '';
    devServer.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Ready in')) {
        console.log('✅ Development server started successfully\n');
        resolve(devServer);
      }
    });
    
    devServer.stderr.on('data', (data) => {
      output += data.toString();
      if (output.includes('Ready in')) {
        console.log('✅ Development server started successfully\n');
        resolve(devServer);
      }
    });
    
    setTimeout(() => {
      if (!output.includes('Ready in')) {
        reject(new Error('Server startup timeout'));
      }
    }, 30000);
  });
}

// Main test function
async function runTests() {
  let devServer;
  
  try {
    // Start server
    devServer = await startDevServer();
    
    // Wait a bit for server to be fully ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🧪 Testing all endpoints...\n');
    
    const results = [];
    let passed = 0;
    let failed = 0;
    
    // Test each endpoint
    for (const endpoint of ENDPOINTS) {
      const url = `${BASE_URL}${endpoint.path}`;
      const result = await testEndpoint(url, endpoint.expected);
      
      const status = result.success ? '✅' : '❌';
      const statusText = `${result.status}${Array.isArray(endpoint.expected) ? ` (expected: ${endpoint.expected.join('|')})` : ` (expected: ${endpoint.expected})`}`;
      
      console.log(`${status} ${endpoint.name.padEnd(20)} - ${statusText}`);
      
      results.push({
        ...endpoint,
        ...result
      });
      
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
    }
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    // Feature analysis
    console.log('\n🔍 Feature Analysis:');
    
    const frontendPages = results.filter(r => !r.path.startsWith('/api'));
    const apiEndpoints = results.filter(r => r.path.startsWith('/api'));
    
    const frontendSuccess = frontendPages.filter(r => r.success).length;
    const apiSuccess = apiEndpoints.filter(r => r.success).length;
    
    console.log(`📱 Frontend Pages: ${frontendSuccess}/${frontendPages.length} working`);
    console.log(`🔌 API Endpoints: ${apiSuccess}/${apiEndpoints.length} working`);
    
    // Specific feature checks
    console.log('\n🎯 Feature Status:');
    console.log(`🏠 Homepage: ${results.find(r => r.path === '/').success ? '✅' : '❌'}`);
    console.log(`🔐 Authentication Pages: ${results.filter(r => r.path.includes('/auth')).every(r => r.success) ? '✅' : '❌'}`);
    console.log(`📊 Dashboard: ${results.find(r => r.path === '/dashboard').success ? '✅' : '❌'}`);
    console.log(`🤖 AI Features: ${results.filter(r => ['ai-assistant', 'summarizer', 'drafts'].some(f => r.path.includes(f))).every(r => r.success) ? '✅' : '❌'}`);
    console.log(`⚖️ Legal Tools: ${results.filter(r => ['case-tracker', 'research', 'notices', 'acts'].some(f => r.path.includes(f))).every(r => r.success) ? '✅' : '❌'}`);
    console.log(`👥 CRM & News: ${results.filter(r => ['crm', 'news'].some(f => r.path.includes(f))).every(r => r.success) ? '✅' : '❌'}`);
    console.log(`🔧 System APIs: ${results.filter(r => r.path.includes('/api')).every(r => r.success) ? '✅' : '❌'}`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    const failedEndpoints = results.filter(r => !r.success);
    if (failedEndpoints.length === 0) {
      console.log('🎉 All tests passed! Application is fully functional.');
    } else {
      console.log('🔧 Issues found:');
      failedEndpoints.forEach(endpoint => {
        console.log(`   - ${endpoint.name}: Status ${endpoint.status} (expected ${endpoint.expected})`);
      });
    }
    
    return { passed, failed, results };
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    return { passed: 0, failed: ENDPOINTS.length, error: error.message };
  } finally {
    if (devServer) {
      console.log('\n🛑 Stopping development server...');
      devServer.kill();
    }
  }
}

// Run tests
runTests().then(result => {
  const exitCode = result.failed > 0 ? 1 : 0;
  console.log(`\n🏁 Test completed with exit code: ${exitCode}`);
  process.exit(exitCode);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});