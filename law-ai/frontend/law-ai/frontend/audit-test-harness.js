#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test harness for LAW-AI audit
class AuditTestHarness {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.results = {
      endpoints: [],
      realtime: { sse: { ok: false, latency_ms: 0 }, ws: { ok: false } },
      uploads: { txt_ok: false, pdf_ok: false, oversize_rejected: false },
      security: [],
      perf: { bundle_kb: 0, largest_route: '', top_heavy_deps: [] },
      duplicates: [],
      env_missing: []
    };
  }

  async testEndpoint(path, method = 'GET', body = null, headers = {}) {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : null
      });
      
      const latency = Date.now() - start;
      const result = {
        path,
        status: response.status,
        latency_ms: latency,
        errors: []
      };

      if (!response.ok) {
        result.errors.push(`HTTP ${response.status}`);
      }

      return result;
    } catch (error) {
      return {
        path,
        status: 0,
        latency_ms: Date.now() - start,
        errors: [error.message]
      };
    }
  }

  async testSSE() {
    return new Promise((resolve) => {
      const start = Date.now();
      try {
        const eventSource = new EventSource(`${this.baseUrl}/api/notifications/sse`);
        
        eventSource.onopen = () => {
          const latency = Date.now() - start;
          eventSource.close();
          resolve({ ok: true, latency_ms: latency });
        };
        
        eventSource.onerror = () => {
          eventSource.close();
          resolve({ ok: false, latency_ms: Date.now() - start });
        };
        
        setTimeout(() => {
          eventSource.close();
          resolve({ ok: false, latency_ms: Date.now() - start });
        }, 5000);
      } catch (error) {
        resolve({ ok: false, latency_ms: Date.now() - start });
      }
    });
  }

  async runEndpointTests() {
    const endpoints = [
      '/api/health',
      '/api/user/profile',
      '/api/dashboard/stats',
      '/api/chat-enhanced',
      '/api/summarizer',
      '/api/drafts',
      '/api/upload',
      '/api/case-tracker',
      '/api/crm',
      '/api/news',
      '/api/research',
      '/api/notices'
    ];

    for (const endpoint of endpoints) {
      const result = await this.testEndpoint(endpoint);
      this.results.endpoints.push(result);
    }
  }

  async runRealtimeTests() {
    this.results.realtime.sse = await this.testSSE();
  }

  scanForDuplicates() {
    const srcDir = path.join(__dirname, 'src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);
    const duplicates = [];
    
    // Simple duplicate detection by filename
    const fileMap = new Map();
    files.forEach(file => {
      const basename = path.basename(file);
      if (fileMap.has(basename)) {
        duplicates.push({
          files: [fileMap.get(basename), file],
          reason: 'Same filename'
        });
      } else {
        fileMap.set(basename, file);
      }
    });
    
    this.results.duplicates = duplicates;
  }

  getAllFiles(dir, extensions) {
    let results = [];
    try {
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(this.getAllFiles(filePath, extensions));
        } else if (extensions.some(ext => file.endsWith(ext))) {
          results.push(filePath);
        }
      });
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    return results;
  }

  checkEnvVars() {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY',
      'NEXT_PUBLIC_RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'DATABASE_URL'
    ];
    
    const envPath = path.join(__dirname, '.env.local');
    let envContent = '';
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      this.results.env_missing = required;
      return;
    }
    
    const missing = required.filter(key => {
      const regex = new RegExp(`^${key}=(.+)$`, 'm');
      const match = envContent.match(regex);
      return !match || match[1].includes('your_') || match[1].includes('placeholder');
    });
    
    this.results.env_missing = missing;
  }

  async run() {
    console.log('🔍 Running LAW-AI Audit Test Harness...\n');
    
    console.log('📡 Testing endpoints...');
    await this.runEndpointTests();
    
    console.log('⚡ Testing real-time capabilities...');
    await this.runRealtimeTests();
    
    console.log('🔍 Scanning for duplicates...');
    this.scanForDuplicates();
    
    console.log('🔧 Checking environment variables...');
    this.checkEnvVars();
    
    return this.results;
  }
}

// Export for use in audit
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuditTestHarness;
}

// Run if called directly
if (require.main === module) {
  const harness = new AuditTestHarness();
  harness.run().then(results => {
    console.log('\n📊 Test Results:');
    console.log(JSON.stringify(results, null, 2));
  });
}